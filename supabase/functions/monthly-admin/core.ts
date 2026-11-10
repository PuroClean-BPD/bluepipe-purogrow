// Pure orchestration for monthly-admin, with injected dependencies so failure paths are testable.
// Every DB mutation + its audit row happen inside one audited RPC (atomic) under the caller's JWT.
// deno-lint-ignore no-explicit-any
export type R<T = any> = { data: T | null; error: unknown | null };
export interface Deps {
  rpc(fn: string, args: Record<string, unknown>): Promise<R>;
  upload(path: string, bytes: Uint8Array, mime: string): Promise<{ error: unknown | null; exists?: boolean }>;
  download(path: string): Promise<Uint8Array | null>;
  remove(paths: string[]): Promise<void>;
  createUser(email: string, meta: Record<string, string>): Promise<{ id?: string; exists?: boolean; error?: unknown }>;
  findUserId(email: string): Promise<string | null>;
}
export type Out = { status: number; body: Record<string, unknown> };
const ok = (body: Record<string, unknown>): Out => ({ status: 200, body });
const err = (status: number, error: string): Out => ({ status, body: { error } });

export const LIMITS = { html: 15_000_000, pdf: 30_000_000, content: 5_000_000 };
const MIME = { html: 'text/html; charset=utf-8', pdf: 'application/pdf', content: 'application/json' } as const;
const NAMES = { html: 'report.html', pdf: 'report.pdf', content: 'content.json' } as const;
type Kind = keyof typeof NAMES;
const KINDS: Kind[] = ['html', 'pdf', 'content'];

export const sha256 = async (b: Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b as BufferSource))).map((x) => x.toString(16).padStart(2, '0')).join('');

export async function stageVersion(d: Deps, a: { request_id: string; report_id: string; files: Record<Kind, Uint8Array>; expected: Record<Kind, string>; notes?: string }): Promise<Out> {
  const f = a.files;
  for (const k of KINDS) if (f[k].length === 0 || f[k].length > LIMITS[k]) return err(413, `Size limit: ${k}`);
  if (new TextDecoder().decode(f.pdf.slice(0, 5)) !== '%PDF-') return err(415, 'Not a PDF');
  if (!/<html[\s>]/i.test(new TextDecoder().decode(f.html.slice(0, 4096)))) return err(415, 'Not HTML');
  let dataset: unknown;
  try { dataset = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(f.content)); } catch { return err(415, 'Not JSON'); }
  const sums = {} as Record<Kind, string>;
  for (const k of KINDS) sums[k] = await sha256(f[k]);
  // Rejected before any mutation: nothing to audit or clean.
  for (const k of KINDS) if (sums[k] !== a.expected[k]) return err(422, 'Checksum mismatch');

  const res = await d.rpc('monthly_admin_reserve_version', { p_request: a.request_id, p_report: a.report_id });
  const s = res.data?.[0];
  if (res.error || !s) return err(403, 'Rejected');
  if (s.state === 'committed') return ok({ id: s.version_id, version: s.version, state: 'draft', sha256: sums, idempotent: true });
  if (s.state !== 'reserved') return err(409, 'Request already failed; use a new request_id');

  const created: string[] = []; // only objects THIS request positively created
  const fail = async (reason: string, status = 502): Promise<Out> => {
    if (created.length) await d.remove(created).catch(() => undefined);
    const f2 = await d.rpc('monthly_admin_fail_staging', { p_request: a.request_id, p_reason: reason });
    // If even the failure audit cannot be written, the reservation remains 'reserved' with its audited
    // stage_reserved row: a durable, visible recovery state. Never reported as success.
    return f2.error ? err(500, 'Recovery required') : err(status, reason);
  };
  for (const k of KINDS) {
    const path = `${s.base_path}/${NAMES[k]}`;
    const up = await d.upload(path, f[k], MIME[k]);
    if (up.error && !up.exists) return fail(`upload_${k}`);
    if (!up.error) created.push(path);
    // Pre-existing object at a request-unique path can only come from an earlier attempt of this same
    // request. Accept it only if byte-identical; never delete it.
    const back = await d.download(path);
    if (!back || back.length !== f[k].length || (await sha256(back)) !== sums[k]) return fail(`readback_${k}`);
  }
  const c = await d.rpc('monthly_admin_commit_version', {
    p_request: a.request_id, p_dataset: dataset, p_sha: sums.content, p_notes: a.notes ?? null,
    p_detail: { sha256: sums, bytes: { html: f.html.length, pdf: f.pdf.length, content: f.content.length } },
  });
  if (c.error || !c.data) return fail('commit_failed');
  return ok({ id: c.data, version: s.version, state: 'draft', sha256: sums });
}

export async function provisionOwner(d: Deps, a: { request_id: string; email: string; full_name?: string }): Promise<Out> {
  const email = a.email.toLowerCase();
  const b = await d.rpc('monthly_admin_provision_begin', { p_request: a.request_id, p_email: email });
  const p = b.data?.[0];
  if (b.error || !p) return err(403, 'Rejected'); // intent not durably audited => no Auth call made
  if (p.state === 'created') return ok({ user_id: p.user_id, idempotent: true });
  if (p.state === 'failed') return err(409, 'Request already failed; use a new request_id');
  // Auth Admin createUser: no invitation, no email, no password.
  const u = await d.createUser(email, a.full_name ? { full_name: a.full_name } : {});
  let id = u.id ?? null;
  if (!id && u.exists) id = await d.findUserId(email); // retry after an earlier create whose finish failed
  const fin = await d.rpc('monthly_admin_provision_finish', { p_request: a.request_id, p_user: id, p_failure: id ? null : 'create_failed' });
  if (fin.error) return err(500, 'Recovery required'); // audited provision_intent remains pending
  return id ? ok({ user_id: id }) : err(409, 'Rejected');
}
