// Pure orchestration for monthly-admin, with injected dependencies so failure paths are testable.
// Every DB mutation + its audit row happen inside one audited RPC (atomic) under the caller's JWT.
// deno-lint-ignore no-explicit-any
export type R<T = any> = { data: T | null; error: unknown | null };
export interface Deps {
  rpc(fn: string, args: Record<string, unknown>): Promise<R>;
  upload(path: string, bytes: Uint8Array, mime: string): Promise<{ error: unknown | null; exists?: boolean }>;
  download(path: string): Promise<Uint8Array | null>;
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

  const bytes = { html: f.html.length, pdf: f.pdf.length, content: f.content.length };
  // Lease + payload fingerprint: one invocation at a time per request_id; changed bytes are rejected.
  const res = await d.rpc('monthly_admin_stage_acquire', { p_request: a.request_id, p_report: a.report_id, p_sums: sums, p_bytes: bytes });
  const s = res.data?.[0];
  if (res.error || !s) {
    const m = String((res.error as { message?: string })?.message ?? res.error);
    if (/Payload mismatch/.test(m)) return err(409, 'Payload differs from original request');
    if (/Busy/.test(m)) return err(409, 'Request in progress; retry later');
    return err(403, 'Rejected');
  }
  // Committed retry: return the ORIGINAL stored, verified metadata, never caller-supplied values.
  if (s.state === 'committed') return ok({ id: s.version_id, version: s.version, state: 'draft', sha256: s.sums, bytes: s.bytes, idempotent: true });
  if (s.state !== 'reserved' || !s.lease) return err(409, 'Request already failed; use a new request_id');

  const created: string[] = [];
  // Definite pre-commit failure only. NEVER deletes objects: created paths are audited orphan candidates.
  const release = async (reason: string, fatal: boolean): Promise<Out> => {
    const r = await d.rpc('monthly_admin_stage_release', { p_request: a.request_id, p_lease: s.lease, p_reason: reason, p_fatal: fatal, p_orphans: created });
    return r.error ? err(500, 'Recovery required') : err(502, reason);
  };
  for (const k of KINDS) {
    const path = `${s.base_path}/${NAMES[k]}`;
    const up = await d.upload(path, f[k], MIME[k]);
    if (up.error && !up.exists) return release(`upload_${k}`, false);
    if (!up.error) created.push(path);
    // An existing object can only come from an earlier attempt of this same fingerprint-bound request.
    const back = await d.download(path);
    if (!back || back.length !== f[k].length || (await sha256(back)) !== sums[k]) return release(`readback_${k}`, true);
  }
  const c = await d.rpc('monthly_admin_stage_commit', { p_request: a.request_id, p_lease: s.lease, p_dataset: dataset, p_notes: a.notes ?? null });
  // Ambiguous outcome (error or lost response): the commit may have succeeded. Touch nothing; the caller
  // retries with the same request_id and receives the stored committed metadata or resumes under a new lease.
  if (c.error || !c.data) return err(503, 'Commit outcome unknown; retry with the same request_id');
  return ok({ id: c.data, version: s.version, state: 'draft', sha256: s.sums, bytes: s.bytes });
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

// ---- Large reports: direct private upload, then server-verified commit (same lease/fingerprint RPCs). ----
// The request body stays tiny, so big files never pass through the function as base64.
export type StageRow = { base_path: string; state: string; created_by: string; version: number; version_id: string | null; lease_token: string | null; sums: Record<Kind, string>; bytes: Record<Kind, number> };
export interface UploadDeps {
  rpc: Deps['rpc'];
  signUpload(path: string): Promise<{ url?: string; exists?: boolean } | null>; // private bucket, no overwrite
  stagingRow(request: string): Promise<StageRow | null>; // read-only lookup of the reserved row
  downloadTyped(path: string): Promise<{ bytes: Uint8Array; type: string } | null>;
}
export const UPLOAD_LEASE_SECONDS = 600;
const baseMime = (m: string) => m.split(';')[0].trim().toLowerCase();

export async function stageUploadBegin(d: UploadDeps, a: { request_id: string; report_id: string; expected: Record<Kind, string>; bytes: Record<Kind, number> }): Promise<Out> {
  for (const k of KINDS) if (!Number.isInteger(a.bytes[k]) || a.bytes[k] <= 0 || a.bytes[k] > LIMITS[k]) return err(413, `Size limit: ${k}`);
  const res = await d.rpc('monthly_admin_stage_acquire', { p_request: a.request_id, p_report: a.report_id, p_sums: a.expected, p_bytes: a.bytes, p_lease_seconds: UPLOAD_LEASE_SECONDS });
  const s = res.data?.[0];
  if (res.error || !s) {
    const m = String((res.error as { message?: string })?.message ?? res.error);
    if (/Payload mismatch/.test(m)) return err(409, 'Payload differs from original request');
    if (/Busy/.test(m)) return err(409, 'Request in progress; retry later');
    return err(403, 'Rejected');
  }
  if (s.state === 'committed') return ok({ id: s.version_id, version: s.version, state: 'draft', sha256: s.sums, bytes: s.bytes, idempotent: true });
  if (s.state !== 'reserved' || !s.lease) return err(409, 'Request already failed; use a new request_id');
  const uploads = {} as Record<Kind, { url: string; content_type: string } | { already_stored: true }>;
  for (const k of KINDS) {
    const u = await d.signUpload(`${s.base_path}/${NAMES[k]}`);
    // Object from an earlier attempt of this same fingerprint-bound request: never overwritten, verified at commit.
    if (u?.exists) { uploads[k] = { already_stored: true }; continue; }
    if (!u?.url) {
      const r = await d.rpc('monthly_admin_stage_release', { p_request: a.request_id, p_lease: s.lease, p_reason: `sign_${k}`, p_fatal: false, p_orphans: [] });
      return r.error ? err(500, 'Recovery required') : err(502, `sign_${k}`);
    }
    uploads[k] = { url: u.url, content_type: MIME[k] };
  }
  return ok({ lease: s.lease, version: s.version, expires_in: UPLOAD_LEASE_SECONDS, uploads });
}

export async function stageUploadCommit(d: UploadDeps, caller: string, a: { request_id: string; lease: string; notes?: string }): Promise<Out> {
  const s = await d.stagingRow(a.request_id);
  if (!s || s.created_by !== caller) return err(403, 'Rejected');
  if (s.state === 'committed' && s.version_id) return ok({ id: s.version_id, version: s.version, state: 'draft', sha256: s.sums, bytes: s.bytes, idempotent: true });
  if (s.state !== 'reserved' || !s.lease_token || s.lease_token !== a.lease) return err(409, 'Lease lost');
  const paths = KINDS.map((k) => `${s.base_path}/${NAMES[k]}`);
  const release = async (reason: string): Promise<Out> => {
    const r = await d.rpc('monthly_admin_stage_release', { p_request: a.request_id, p_lease: a.lease, p_reason: reason, p_fatal: true, p_orphans: paths });
    return r.error ? err(500, 'Recovery required') : err(502, reason);
  };
  let dataset: unknown = null;
  for (const k of KINDS) {
    const got = await d.downloadTyped(`${s.base_path}/${NAMES[k]}`);
    if (!got) return err(409, `Upload missing: ${k}`); // nothing mutated; upload it and commit again within the lease
    const b = got.bytes;
    if (b.length !== Number(s.bytes[k]) || (await sha256(b)) !== s.sums[k] || baseMime(got.type) !== baseMime(MIME[k])) return release(`readback_${k}`);
    if (k === 'pdf' && new TextDecoder().decode(b.slice(0, 5)) !== '%PDF-') return release('format_pdf');
    if (k === 'html' && !/<html[\s>]/i.test(new TextDecoder().decode(b.slice(0, 4096)))) return release('format_html');
    if (k === 'content') {
      try { dataset = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(b)); } catch { return release('format_content'); }
    }
  }
  const c = await d.rpc('monthly_admin_stage_commit', { p_request: a.request_id, p_lease: a.lease, p_dataset: dataset, p_notes: a.notes ?? null });
  if (c.error || !c.data) return err(503, 'Commit outcome unknown; retry with the same request_id');
  return ok({ id: c.data, version: s.version, state: 'draft', sha256: s.sums, bytes: s.bytes });
}
