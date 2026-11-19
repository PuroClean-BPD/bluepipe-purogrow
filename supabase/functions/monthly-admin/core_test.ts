// UNIT tests with in-memory fakes that mirror the lease/fingerprint RPC contract (the real SQL contract is
// tested separately in scripts/monthly/lease.test.ts on a disposable local DB). No network, no real records,
// no storage deletion. These are NOT authenticated hosted-runtime tests.
import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { type Deps, provisionOwner, sha256, stageVersion } from './core.ts';

const enc = (s: string) => new TextEncoder().encode(s);
const mk = (tag: string) => ({ html: enc(`<html><body>${tag}</body></html>`), pdf: enc(`%PDF-1.4 ${tag}`), content: enc(`{"tag":"${tag}"}`) });
const FILES = mk('synthetic');
const sumsOf = async (f: ReturnType<typeof mk>) => ({ html: await sha256(f.html), pdf: await sha256(f.pdf), content: await sha256(f.content) });
const REPORT = '00000000-0000-4000-8000-000000000001';
const tick = () => new Promise((r) => setTimeout(r, 1));

type Row = { version: number; base_path: string; state: string; version_id: string | null; lease: string | null; exp: number; fp: string; sums: unknown; bytes: unknown };
function backend() {
  const objects = new Map<string, Uint8Array>();
  const staging = new Map<string, Row>();
  const audit: { action: string; detail: Record<string, unknown> }[] = [];
  const clock = { now: 0 };
  let next = 1;
  const deps = (opt: { failUpload?: string; corrupt?: string; commitLostResponse?: boolean; failRelease?: boolean; slowUploadMs?: number; beforeCommit?: () => Promise<void> } = {}): Deps => ({
    rpc: async (fn, args) => {
      const req = args.p_request as string;
      if (fn === 'monthly_admin_stage_acquire') {
        const fp = JSON.stringify([args.p_sums, args.p_bytes]);
        const s = staging.get(req);
        if (s) {
          if (s.fp !== fp) return { data: null, error: { message: 'Payload mismatch' } };
          if (s.state !== 'reserved') return { data: [{ ...s, lease: null }], error: null };
          if (s.lease && s.exp > clock.now) return { data: null, error: { message: 'Busy' } };
          s.lease = crypto.randomUUID(); s.exp = clock.now + 120;
          return { data: [{ ...s }], error: null };
        }
        const v = next++;
        const row: Row = { version: v, base_path: `monthly/c/${args.p_report}/v${v}-${req}`, state: 'reserved', version_id: null, lease: crypto.randomUUID(), exp: clock.now + 120, fp, sums: args.p_sums, bytes: args.p_bytes };
        staging.set(req, row);
        return { data: [{ ...row }], error: null };
      }
      const s = staging.get(req)!;
      if (fn === 'monthly_admin_stage_commit') {
        if (opt.beforeCommit) await opt.beforeCommit();
        if (s.state === 'committed') return { data: s.version_id, error: null };
        if (s.lease !== args.p_lease || s.exp <= clock.now) return { data: null, error: { message: 'Lease lost' } };
        s.state = 'committed'; s.version_id = crypto.randomUUID(); s.lease = null;
        audit.push({ action: 'stage_version', detail: { sha256: s.sums } });
        return opt.commitLostResponse ? { data: null, error: { message: 'network: response lost' } } : { data: s.version_id, error: null };
      }
      if (fn === 'monthly_admin_stage_release') {
        if (opt.failRelease) return { data: null, error: 'audit' };
        if (s.state !== 'reserved' || s.lease !== args.p_lease) return { data: false, error: null };
        s.lease = null; if (args.p_fatal) s.state = 'failed';
        audit.push({ action: args.p_fatal ? 'stage_failed' : 'stage_attempt_failed', detail: { orphan_candidates: args.p_orphans } });
        return { data: true, error: null };
      }
      return { data: null, error: 'unknown' };
    },
    upload: async (path, bytes) => {
      if (opt.slowUploadMs) await new Promise((r) => setTimeout(r, opt.slowUploadMs));
      await tick();
      if (opt.failUpload && path.endsWith(opt.failUpload)) return { error: 'boom' };
      if (objects.has(path)) return { error: 'exists', exists: true };
      objects.set(path, opt.corrupt && path.endsWith(opt.corrupt) ? enc('tampered') : bytes);
      return { error: null };
    },
    download: async (path) => objects.get(path) ?? null,
    createUser: async () => ({ id: 'u1' }),
    findUserId: async () => null,
  });
  return { objects, staging, audit, clock, deps };
}
const stage = async (d: Deps, request_id: string, files = FILES) => stageVersion(d, { request_id, report_id: REPORT, files, expected: await sumsOf(files) });
const snapshot = (m: Map<string, Uint8Array>) => new Map(m);
const assertPreserved = (before: Map<string, Uint8Array>, after: Map<string, Uint8Array>) => { for (const [k, v] of before) assertEquals(after.get(k), v, `object deleted/changed: ${k}`); };

Deno.test('happy path: draft staged, returned sums are the stored ones', async () => {
  const b = backend(); const o = await stage(b.deps(), crypto.randomUUID());
  assertEquals(o.status, 200); assertEquals(o.body.sha256, await sumsOf(FILES)); assertEquals(b.objects.size, 3);
});
Deno.test('checksum mismatch rejected before any lease or upload', async () => {
  const b = backend();
  const o = await stageVersion(b.deps(), { request_id: crypto.randomUUID(), report_id: REPORT, files: FILES, expected: { ...(await sumsOf(FILES)), pdf: 'f'.repeat(64) } });
  assertEquals(o.status, 422); assertEquals(b.staging.size, 0); assertEquals(b.objects.size, 0);
});
Deno.test('(1) commit succeeds but response lost: nothing removed; retry returns original committed metadata', async () => {
  const b = backend(); const id = crypto.randomUUID();
  const o = await stage(b.deps({ commitLostResponse: true }), id);
  assertEquals(o.status, 503);
  assertEquals(b.objects.size, 3);
  const before = snapshot(b.objects);
  const r = await stage(b.deps(), id);
  assertEquals(r.status, 200); assertEquals(r.body.idempotent, true); assertEquals(r.body.id, b.staging.get(id)!.version_id);
  assertEquals(r.body.sha256, await sumsOf(FILES));
  assertPreserved(before, b.objects);
});
Deno.test('(2) concurrent SAME request_id: second invocation refused while first holds lease; committed bytes kept', async () => {
  const b = backend(); const id = crypto.randomUUID();
  const first = stage(b.deps({ slowUploadMs: 15 }), id);
  await new Promise((r) => setTimeout(r, 8));
  assert(b.staging.get(id)?.lease, 'first invocation holds the lease');
  const second = await stage(b.deps({ corrupt: 'report.pdf' }), id);
  assertEquals(second.status, 409);
  const o = await first; assertEquals(o.status, 200);
  assertEquals(b.objects.get(`${b.staging.get(id)!.base_path}/report.pdf`), FILES.pdf);
});
Deno.test('(2b/4) stale lease: expired holder fails after new owner commits; it deletes nothing and cannot release', async () => {
  const b = backend(); const id = crypto.randomUUID();
  let committedBefore = new Map<string, Uint8Array>();
  const stale = stage(b.deps({
    beforeCommit: async () => {
      // Lease expires mid-flight; a new owner acquires and commits before the stale commit lands.
      b.clock.now += 500;
      const n = await stage(b.deps(), id);
      assertEquals(n.status, 200);
      committedBefore = snapshot(b.objects);
    },
  }), id);
  const o = await stale;
  assertEquals(o.status, 200); // commit RPC is idempotent on committed rows: returns the NEW owner's version
  assertEquals(o.body.id, b.staging.get(id)!.version_id);
  assertPreserved(committedBefore, b.objects);
});
Deno.test('(4) stale lease holder failing readback cannot release/fail the new owner request', async () => {
  const b = backend(); const id = crypto.randomUUID();
  // Stale holder A acquires, then its lease expires; B acquires and commits.
  await b.deps().rpc('monthly_admin_stage_acquire', { p_request: id, p_report: REPORT, p_sums: await sumsOf(FILES), p_bytes: { html: FILES.html.length, pdf: FILES.pdf.length, content: FILES.content.length } });
  const staleLease = b.staging.get(id)!.lease; b.clock.now += 500;
  assertEquals((await stage(b.deps(), id)).status, 200);
  const before = snapshot(b.objects);
  const rel = await b.deps().rpc('monthly_admin_stage_release', { p_request: id, p_lease: staleLease, p_reason: 'readback_pdf', p_fatal: true, p_orphans: [] });
  assertEquals(rel.data, false); assertEquals(b.staging.get(id)!.state, 'committed');
  assertPreserved(before, b.objects);
});
Deno.test('(3) same request_id with different content after success is rejected; original metadata unchanged', async () => {
  const b = backend(); const id = crypto.randomUUID();
  assertEquals((await stage(b.deps(), id)).status, 200);
  const before = snapshot(b.objects);
  const o = await stage(b.deps(), id, mk('DIFFERENT'));
  assertEquals(o.status, 409); assert(!('sha256' in o.body));
  assertEquals(b.staging.get(id)!.sums, await sumsOf(FILES));
  assertPreserved(before, b.objects);
});
Deno.test('upload failure: lease released, objects retained as audited orphan candidates, same request resumes', async () => {
  const b = backend(); const id = crypto.randomUUID();
  const o = await stage(b.deps({ failUpload: 'content.json' }), id);
  assertEquals(o.status, 502); assertEquals(b.objects.size, 2);
  assertEquals((b.audit.at(-1)!.detail.orphan_candidates as string[]).length, 2);
  const r = await stage(b.deps(), id);
  assertEquals(r.status, 200); assertEquals(b.objects.size, 3);
});
Deno.test('read-back mismatch: fatal, nothing deleted', async () => {
  const b = backend(); const o = await stage(b.deps({ corrupt: 'report.pdf' }), crypto.randomUUID());
  assertEquals(o.status, 502); assertEquals(o.body.error, 'readback_pdf'); assertEquals(b.objects.size, 2);
  assertEquals(b.audit.at(-1)!.action, 'stage_failed');
});
Deno.test('release audit failure reported as recovery required, never success', async () => {
  const b = backend(); const o = await stage(b.deps({ failUpload: 'report.pdf', failRelease: true }), crypto.randomUUID());
  assertEquals(o.status, 500);
});
Deno.test('parallel distinct requests: distinct versions, disjoint objects', async () => {
  const b = backend(); const outs = await Promise.all(Array.from({ length: 8 }, () => stage(b.deps(), crypto.randomUUID())));
  assert(outs.every((o) => o.status === 200));
  assertEquals(new Set(outs.map((o) => o.body.version)).size, 8); assertEquals(b.objects.size, 24);
});
Deno.test('provision: no Auth call if intent audit fails; finish failure => recovery required; existing user linked', async () => {
  let created = 0;
  const base = backend().deps();
  const d1: Deps = { ...base, rpc: async () => ({ data: null, error: 'audit' }), createUser: async () => { created++; return { id: 'u' }; } };
  assertEquals((await provisionOwner(d1, { request_id: crypto.randomUUID(), email: 'a@example.invalid' })).status, 403); assertEquals(created, 0);
  const d2: Deps = { ...base, rpc: async (fn) => fn === 'monthly_admin_provision_begin' ? { data: [{ state: 'pending', user_id: null }], error: null } : { data: null, error: 'audit' }, createUser: async () => ({ id: 'u' }) };
  assertEquals((await provisionOwner(d2, { request_id: crypto.randomUUID(), email: 'a@example.invalid' })).status, 500);
  const d3: Deps = { ...base, rpc: async (fn) => fn === 'monthly_admin_provision_begin' ? { data: [{ state: 'pending', user_id: null }], error: null } : { data: null, error: null }, createUser: async () => ({ exists: true }), findUserId: async () => 'u-existing' };
  assertEquals((await provisionOwner(d3, { request_id: crypto.randomUUID(), email: 'a@example.invalid' })).body.user_id, 'u-existing');
});

// ---- Direct private upload + server-verified commit ----
import { type UploadDeps, stageUploadBegin, stageUploadCommit } from './core.ts';
const ADMIN = 'admin-1';
const TYPES: Record<string, string> = { 'report.html': 'text/html; charset=utf-8', 'report.pdf': 'application/pdf', 'content.json': 'application/json' };
function uploadDeps(b: ReturnType<typeof backend>, opt: { signFail?: boolean } = {}) {
  const base = b.deps();
  const types = new Map<string, string>();
  const d: UploadDeps = {
    rpc: base.rpc,
    signUpload: async (path) => (opt.signFail ? null : { url: `signed://${path}` }),
    stagingRow: async (req) => {
      const s = b.staging.get(req);
      return s ? { base_path: s.base_path, state: s.state, created_by: ADMIN, version: s.version, version_id: s.version_id, lease_token: s.lease, sums: s.sums as never, bytes: s.bytes as never } : null;
    },
    downloadTyped: async (path) => { const x = b.objects.get(path); return x ? { bytes: x, type: types.get(path) ?? TYPES[path.split('/').pop()!] } : null; },
  };
  // Simulates the caller PUTting to each signed URL (no overwrite).
  const put = (url: string, bytes: Uint8Array, type?: string) => { const p = url.replace('signed://', ''); if (b.objects.has(p)) return false; b.objects.set(p, bytes); if (type) types.set(p, type); return true; };
  return { d, put };
}
const bytesOf = (f: ReturnType<typeof mk>) => ({ html: f.html.length, pdf: f.pdf.length, content: f.content.length });
const begin = async (d: UploadDeps, id: string, f = FILES) => stageUploadBegin(d, { request_id: id, report_id: REPORT, expected: await sumsOf(f), bytes: bytesOf(f) });

Deno.test('upload path: begin -> direct uploads -> verified draft commit; retry is idempotent', async () => {
  const b = backend(); const { d, put } = uploadDeps(b); const id = crypto.randomUUID();
  const o = await begin(d, id); assertEquals(o.status, 200);
  const up = o.body.uploads as Record<string, { url: string }>;
  put(up.html.url, FILES.html); put(up.pdf.url, FILES.pdf); put(up.content.url, FILES.content);
  const c = await stageUploadCommit(d, ADMIN, { request_id: id, lease: o.body.lease as string });
  assertEquals(c.status, 200); assertEquals(c.body.state, 'draft'); assertEquals(c.body.sha256, await sumsOf(FILES));
  const again = await stageUploadCommit(d, ADMIN, { request_id: id, lease: 'x' });
  assertEquals(again.body.idempotent, true); assertEquals(again.body.id, c.body.id);
});
Deno.test('upload path: tampered bytes are rejected fatally and nothing is deleted', async () => {
  const b = backend(); const { d, put } = uploadDeps(b); const id = crypto.randomUUID();
  const o = await begin(d, id); const up = o.body.uploads as Record<string, { url: string }>;
  put(up.html.url, FILES.html); put(up.pdf.url, enc('%PDF-tampered')); put(up.content.url, FILES.content);
  const c = await stageUploadCommit(d, ADMIN, { request_id: id, lease: o.body.lease as string });
  assertEquals(c.status, 502); assertEquals(b.staging.get(id)!.state, 'failed'); assertEquals(b.objects.size, 3);
  assertEquals(b.audit.at(-1)!.action, 'stage_failed');
});
Deno.test('upload path: wrong MIME type is rejected', async () => {
  const b = backend(); const { d, put } = uploadDeps(b); const id = crypto.randomUUID();
  const o = await begin(d, id); const up = o.body.uploads as Record<string, { url: string }>;
  put(up.html.url, FILES.html, 'text/plain'); put(up.pdf.url, FILES.pdf); put(up.content.url, FILES.content);
  assertEquals((await stageUploadCommit(d, ADMIN, { request_id: id, lease: o.body.lease as string })).status, 502);
});
Deno.test('upload path: missing file keeps the lease; another caller or wrong lease is refused', async () => {
  const b = backend(); const { d, put } = uploadDeps(b); const id = crypto.randomUUID();
  const o = await begin(d, id); const up = o.body.uploads as Record<string, { url: string }>; const lease = o.body.lease as string;
  put(up.html.url, FILES.html);
  assertEquals((await stageUploadCommit(d, ADMIN, { request_id: id, lease })).status, 409);
  assertEquals(b.staging.get(id)!.state, 'reserved');
  assertEquals((await stageUploadCommit(d, 'someone-else', { request_id: id, lease })).status, 403);
  assertEquals((await stageUploadCommit(d, ADMIN, { request_id: id, lease: crypto.randomUUID() })).status, 409);
  put(up.pdf.url, FILES.pdf); put(up.content.url, FILES.content);
  assertEquals((await stageUploadCommit(d, ADMIN, { request_id: id, lease })).status, 200);
});
Deno.test('upload path: resumes a stale reservation with the same request_id and an already stored file', async () => {
  const b = backend(); const id = crypto.randomUUID();
  const first = await begin(uploadDeps(b).d, id); const up = first.body.uploads as Record<string, { url: string }>;
  b.objects.set(up.html.url.replace('signed://', ''), FILES.html); // earlier partial attempt
  b.clock.now += 1000; // lease expired
  const { d, put } = uploadDeps(b);
  const o = await begin(d, id); assertEquals(o.status, 200); assertEquals(o.body.version, first.body.version);
  const u2 = o.body.uploads as Record<string, { url: string }>;
  assertEquals(put(u2.html.url, FILES.html), false); put(u2.pdf.url, FILES.pdf); put(u2.content.url, FILES.content);
  assertEquals((await stageUploadCommit(d, ADMIN, { request_id: id, lease: o.body.lease as string })).status, 200);
});
Deno.test('upload path: changed bytes for the same request_id and oversize files are refused', async () => {
  const b = backend(); const { d } = uploadDeps(b); const id = crypto.randomUUID();
  await begin(d, id); b.clock.now += 1000;
  assertEquals((await begin(d, id, mk('other'))).status, 409);
  assertEquals((await stageUploadBegin(d, { request_id: crypto.randomUUID(), report_id: REPORT, expected: await sumsOf(FILES), bytes: { ...bytesOf(FILES), html: 15_000_001 } })).status, 413);
});
