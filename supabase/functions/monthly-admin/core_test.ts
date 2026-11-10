// Failure-injection, retry and parallel tests for monthly-admin orchestration. In-memory fakes only;
// no network, no real records. DB atomicity of each RPC is tested separately (scripts/monthly/atomic.test.ts).
import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { type Deps, provisionOwner, sha256, stageVersion } from './core.ts';

const enc = (s: string) => new TextEncoder().encode(s);
const FILES = { html: enc('<html><body>synthetic</body></html>'), pdf: enc('%PDF-1.4 synthetic'), content: enc('{"synthetic":true}') };
const expected = async () => ({ html: await sha256(FILES.html), pdf: await sha256(FILES.pdf), content: await sha256(FILES.content) });
const REPORT = '00000000-0000-4000-8000-000000000001';

function fake(opts: { failUpload?: string; corrupt?: string; failCommit?: boolean; failFailAudit?: boolean; failReserve?: boolean } = {}) {
  const objects = new Map<string, Uint8Array>();
  const staging = new Map<string, { version: number; base_path: string; state: string; version_id: string | null }>();
  let nextVersion = 1;
  const calls: string[] = [];
  const removed: string[] = [];
  const d: Deps = {
    rpc: async (fn, args) => {
      calls.push(fn);
      const req = args.p_request as string;
      if (fn === 'monthly_admin_reserve_version') {
        if (opts.failReserve) return { data: null, error: 'audit' };
        if (!staging.has(req)) staging.set(req, { version: nextVersion++, base_path: `monthly/c/${args.p_report}/v${nextVersion - 1}-${req}`, state: 'reserved', version_id: null });
        return { data: [staging.get(req)!], error: null };
      }
      if (fn === 'monthly_admin_commit_version') {
        if (opts.failCommit) return { data: null, error: 'audit' };
        const s = staging.get(req)!; s.state = 'committed'; s.version_id ??= crypto.randomUUID();
        return { data: s.version_id, error: null };
      }
      if (fn === 'monthly_admin_fail_staging') {
        if (opts.failFailAudit) return { data: null, error: 'audit' };
        staging.get(req)!.state = 'failed'; return { data: null, error: null };
      }
      return { data: null, error: 'unknown' };
    },
    upload: async (path, bytes) => {
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      if (opts.failUpload && path.endsWith(opts.failUpload)) return { error: 'boom' };
      if (objects.has(path)) return { error: 'exists', exists: true };
      objects.set(path, opts.corrupt && path.endsWith(opts.corrupt) ? enc('tampered') : bytes);
      return { error: null };
    },
    download: async (path) => objects.get(path) ?? null,
    remove: async (paths) => { for (const p of paths) { removed.push(p); objects.delete(p); } },
    createUser: async () => ({ id: 'u1' }),
    findUserId: async () => null,
  };
  return { d, objects, staging, calls, removed };
}
const run = async (f: ReturnType<typeof fake>, request_id = crypto.randomUUID()) => stageVersion(f.d, { request_id, report_id: REPORT, files: FILES, expected: await expected() });

Deno.test('happy path stages draft with verified read-back', async () => {
  const f = fake(); const o = await run(f);
  assertEquals(o.status, 200); assertEquals(o.body.state, 'draft'); assertEquals(f.objects.size, 3);
});
Deno.test('checksum mismatch rejected before any mutation', async () => {
  const f = fake();
  const o = await stageVersion(f.d, { request_id: crypto.randomUUID(), report_id: REPORT, files: FILES, expected: { ...(await expected()), pdf: 'f'.repeat(64) } });
  assertEquals(o.status, 422); assertEquals(f.calls.length, 0); assertEquals(f.objects.size, 0);
});
Deno.test('reservation audit failure => no uploads', async () => {
  const f = fake({ failReserve: true }); const o = await run(f);
  assertEquals(o.status, 403); assertEquals(f.objects.size, 0);
});
Deno.test('upload failure removes only objects this request created, marks failed', async () => {
  const f = fake({ failUpload: 'content.json' }); const o = await run(f);
  assertEquals(o.status, 502); assertEquals(f.removed.length, 2); assertEquals(f.objects.size, 0);
  assertEquals([...f.staging.values()][0].state, 'failed');
});
Deno.test('read-back mismatch fails staging', async () => {
  const f = fake({ corrupt: 'report.pdf' }); const o = await run(f);
  assertEquals(o.status, 502); assertEquals(o.body.error, 'readback_pdf'); assertEquals(f.objects.size, 0);
});
Deno.test('commit (DB/audit) failure removes created objects and fails staging', async () => {
  const f = fake({ failCommit: true }); const o = await run(f);
  assertEquals(o.status, 502); assertEquals(f.objects.size, 0); assertEquals([...f.staging.values()][0].state, 'failed');
});
Deno.test('failure audit failure is reported as recovery required, never success', async () => {
  const f = fake({ failCommit: true, failFailAudit: true }); const o = await run(f);
  assertEquals(o.status, 500); assertEquals([...f.staging.values()][0].state, 'reserved');
});
Deno.test('other requests objects are never deleted on conflict/failure', async () => {
  const f = fake(); await run(f);
  const before = new Map(f.objects);
  const g = { ...f, d: { ...f.d, upload: async (p: string, b: Uint8Array, m: string) => p.endsWith('content.json') ? { error: 'boom' } : f.d.upload(p, b, m) } };
  const o = await run(g as typeof f);
  assertEquals(o.status, 502);
  for (const [k, v] of before) assertEquals(f.objects.get(k), v);
});
Deno.test('retry with same request_id after crash reuses identical objects without deleting them', async () => {
  const f = fake(); const id = crypto.randomUUID();
  const s = await f.d.rpc('monthly_admin_reserve_version', { p_request: id, p_report: REPORT });
  const base = s.data![0].base_path;
  f.objects.set(`${base}/report.html`, FILES.html); // left by crashed attempt
  const o = await run(f, id);
  assertEquals(o.status, 200); assert(f.objects.has(`${base}/report.html`));
  const again = await run(f, id);
  assertEquals(again.status, 200); assertEquals(again.body.idempotent, true); assertEquals(again.body.id, o.body.id);
});
Deno.test('retry finds tampered pre-existing object: fails without deleting it', async () => {
  const f = fake(); const id = crypto.randomUUID();
  const s = await f.d.rpc('monthly_admin_reserve_version', { p_request: id, p_report: REPORT });
  const p = `${s.data![0].base_path}/report.html`; f.objects.set(p, enc('different'));
  const o = await run(f, id);
  assertEquals(o.status, 502); assert(f.objects.has(p)); assert(!f.removed.includes(p));
});
Deno.test('parallel distinct requests get distinct versions and disjoint objects', async () => {
  const f = fake(); const outs = await Promise.all(Array.from({ length: 8 }, () => run(f)));
  assert(outs.every((o) => o.status === 200));
  assertEquals(new Set(outs.map((o) => o.body.version)).size, 8); assertEquals(f.objects.size, 24);
});
Deno.test('provision: no Auth call if intent audit fails; finish failure => recovery required', async () => {
  let created = 0;
  const base = fake().d;
  const d1: Deps = { ...base, rpc: async () => ({ data: null, error: 'audit' }), createUser: async () => { created++; return { id: 'u' }; } };
  assertEquals((await provisionOwner(d1, { request_id: crypto.randomUUID(), email: 'a@example.invalid' })).status, 403); assertEquals(created, 0);
  const d2: Deps = { ...base, rpc: async (fn) => fn === 'monthly_admin_provision_begin' ? { data: [{ state: 'pending', user_id: null }], error: null } : { data: null, error: 'audit' }, createUser: async () => ({ id: 'u' }) };
  assertEquals((await provisionOwner(d2, { request_id: crypto.randomUUID(), email: 'a@example.invalid' })).status, 500);
  const d3: Deps = { ...base, rpc: async (fn) => fn === 'monthly_admin_provision_begin' ? { data: [{ state: 'pending', user_id: null }], error: null } : { data: null, error: null }, createUser: async () => ({ exists: true }), findUserId: async () => 'u-existing' };
  assertEquals((await provisionOwner(d3, { request_id: crypto.randomUUID(), email: 'a@example.invalid' })).body.user_id, 'u-existing');
});
