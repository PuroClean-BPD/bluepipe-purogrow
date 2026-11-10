import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

// Admin-only monthly portal operations. Caller must be a real signed-in monthly_staff admin.
// Grants, revocations and state transitions run through the audited RPCs under the caller's own JWT.
// No arbitrary bucket/path input: storage paths are derived server-side from database IDs.
const BUCKET = 'reports-private';
const LIMITS = { html: 15_000_000, pdf: 30_000_000, content: 5_000_000 };
const MIME = { html: 'text/html; charset=utf-8', pdf: 'application/pdf', content: 'application/json' };
const uuid = z.string().uuid();
const b64 = z.string().min(4).max(42_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/);
const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create_org'), name: z.string().trim().min(2).max(120) }).strict(),
  z.object({ action: z.literal('create_client'), org_id: uuid, slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}$/), display_name: z.string().trim().min(2).max(160), package: z.string().trim().max(80).nullable().optional() }).strict(),
  z.object({ action: z.literal('create_report'), client_id: uuid, period_start: z.string().datetime({ offset: true }), period_end: z.string().datetime({ offset: true }), period_label: z.string().trim().min(3).max(80), kind: z.enum(['monthly', 'special']) }).strict(),
  z.object({ action: z.literal('stage_version'), report_id: uuid, html_b64: b64, pdf_b64: b64, content_b64: b64, expected: z.object({ html_sha256: z.string().regex(/^[a-f0-9]{64}$/), pdf_sha256: z.string().regex(/^[a-f0-9]{64}$/), content_sha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict(), notes: z.string().max(500).optional() }).strict(),
  z.object({ action: z.literal('provision_owner'), email: z.string().email().max(254), full_name: z.string().trim().max(120).optional() }).strict(),
  z.object({ action: z.literal('grant'), user_id: uuid, client_id: uuid, role: z.enum(['client_viewer', 'client_manager']), grant_source: z.string().trim().min(3).max(200) }).strict(),
  z.object({ action: z.literal('revoke'), membership_id: uuid }).strict(),
  z.object({ action: z.literal('transition'), version_id: uuid, next_state: z.enum(['approved', 'published', 'withdrawn']) }).strict(),
]);

const hex = async (b: Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', b))).map((x) => x.toString(16).padStart(2, '0')).join('');
const decode = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

Deno.serve(async (req) => {
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return reply({ error: 'Unauthorized' }, 401);
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_ANON_KEY'), service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key || !service) return reply({ error: 'Unavailable' }, 503);
  const caller = createClient(url, key, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: u, error: ue } = await caller.auth.getUser(auth.slice(7));
  if (ue || !u.user) return reply({ error: 'Unauthorized' }, 401);
  // Role from the caller's own RLS-scoped read of monthly_staff; never from input or JWT metadata.
  const { data: role } = await caller.rpc('monthly_staff_role');
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const log = (action: string, target_table: string, target_id: string | null, client_id: string | null, detail: Record<string, unknown>) =>
    admin.from('monthly_audit_log').insert({ actor: u.user!.id, action, target_table, target_id, client_id, detail });
  if (role !== 'admin') { await log('admin_denied', 'monthly_staff', null, null, { role: role ?? null }); return reply({ error: 'Forbidden' }, 403); }

  let p;
  try { p = Action.safeParse(await req.json()); } catch { return reply({ error: 'Invalid request' }, 400); }
  if (!p.success) return reply({ error: 'Invalid request', fields: p.error.flatten().fieldErrors }, 400);
  const a = p.data;

  if (a.action === 'create_org') {
    const { data, error } = await admin.from('monthly_organizations').insert({ name: a.name }).select('id').single();
    if (error) return reply({ error: 'Rejected' }, 409);
    await log('create_org', 'monthly_organizations', data.id, null, { name: a.name });
    return reply({ id: data.id });
  }
  if (a.action === 'create_client') {
    const { data, error } = await admin.from('monthly_clients').insert({ org_id: a.org_id, slug: a.slug, display_name: a.display_name, package: a.package ?? null }).select('id').single();
    if (error) return reply({ error: 'Rejected' }, 409);
    await log('create_client', 'monthly_clients', data.id, data.id, { slug: a.slug });
    return reply({ id: data.id });
  }
  if (a.action === 'create_report') {
    if (new Date(a.period_end) <= new Date(a.period_start)) return reply({ error: 'Invalid period' }, 400);
    const { data, error } = await admin.from('monthly_reports').insert({ client_id: a.client_id, period_start: a.period_start, period_end: a.period_end, period_label: a.period_label, kind: a.kind }).select('id').single();
    if (error) return reply({ error: 'Rejected' }, 409);
    await log('create_report', 'monthly_reports', data.id, a.client_id, { period_label: a.period_label });
    return reply({ id: data.id });
  }
  if (a.action === 'stage_version') {
    const { data: r } = await admin.from('monthly_reports').select('id,client_id').eq('id', a.report_id).maybeSingle();
    if (!r) return reply({ error: 'Not found' }, 404);
    const files = { html: decode(a.html_b64), pdf: decode(a.pdf_b64), content: decode(a.content_b64) };
    for (const k of ['html', 'pdf', 'content'] as const) if (files[k].length === 0 || files[k].length > LIMITS[k]) return reply({ error: `Size limit: ${k}` }, 413);
    if (new TextDecoder().decode(files.pdf.slice(0, 5)) !== '%PDF-') return reply({ error: 'Not a PDF' }, 415);
    if (!/<html[\s>]/i.test(new TextDecoder().decode(files.html.slice(0, 4096)))) return reply({ error: 'Not HTML' }, 415);
    let dataset: unknown;
    try { dataset = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(files.content)); } catch { return reply({ error: 'Not JSON' }, 415); }
    const sums = { html: await hex(files.html), pdf: await hex(files.pdf), content: await hex(files.content) };
    if (sums.html !== a.expected.html_sha256 || sums.pdf !== a.expected.pdf_sha256 || sums.content !== a.expected.content_sha256) {
      await log('stage_failed', 'monthly_reports', r.id, r.client_id, { reason: 'sha256_mismatch_on_receipt' });
      return reply({ error: 'Checksum mismatch' }, 422);
    }
    const { data: last } = await admin.from('monthly_report_versions').select('version').eq('report_id', r.id).order('version', { ascending: false }).limit(1).maybeSingle();
    const version = (last?.version ?? 0) + 1;
    const base = `monthly/${r.client_id}/${r.id}/v${version}`;
    const paths = { html: `${base}/report.html`, pdf: `${base}/report.pdf`, content: `${base}/content.json` };
    const cleanup = () => admin.storage.from(BUCKET).remove(Object.values(paths));
    for (const k of ['html', 'pdf', 'content'] as const) {
      const { error } = await admin.storage.from(BUCKET).upload(paths[k], files[k], { contentType: MIME[k], upsert: false });
      if (error) { await cleanup(); await log('stage_failed', 'monthly_reports', r.id, r.client_id, { reason: `upload_${k}` }); return reply({ error: 'Upload failed' }, 502); }
      const { data: back } = await admin.storage.from(BUCKET).download(paths[k]);
      const bytes = back ? new Uint8Array(await back.arrayBuffer()) : new Uint8Array();
      if (bytes.length !== files[k].length || (await hex(bytes)) !== sums[k]) {
        await cleanup(); await log('stage_failed', 'monthly_reports', r.id, r.client_id, { reason: `readback_${k}` });
        return reply({ error: 'Read-back verification failed' }, 502);
      }
    }
    const { data: v, error } = await admin.from('monthly_report_versions').insert({ report_id: r.id, version, state: 'draft', dataset, dataset_sha256: sums.content, html_path: paths.html, pdf_path: paths.pdf, created_by: u.user.id, notes: a.notes ?? null }).select('id').single();
    if (error) { await cleanup(); return reply({ error: 'Rejected' }, 409); }
    await log('stage_version', 'monthly_report_versions', v.id, r.client_id, { version, sha256: sums, bytes: { html: files.html.length, pdf: files.pdf.length, content: files.content.length } });
    return reply({ id: v.id, version, state: 'draft', sha256: sums });
  }
  if (a.action === 'provision_owner') {
    // Auth Admin createUser: no invitation, no email, no password.
    const { data, error } = await admin.auth.admin.createUser({ email: a.email.toLowerCase(), email_confirm: true, user_metadata: a.full_name ? { full_name: a.full_name } : {} });
    if (error || !data.user) { await log('provision_failed', 'auth.users', null, null, {}); return reply({ error: 'Rejected' }, 409); }
    await log('provision_owner', 'auth.users', data.user.id, null, { email_domain: a.email.split('@')[1] });
    return reply({ user_id: data.user.id });
  }
  if (a.action === 'grant') {
    const { data, error } = await caller.rpc('monthly_grant', { uid: a.user_id, cid: a.client_id, mrole: a.role, source: a.grant_source });
    return error ? reply({ error: 'Rejected' }, 403) : reply({ membership_id: data });
  }
  if (a.action === 'revoke') {
    const { error } = await caller.rpc('monthly_revoke', { mid: a.membership_id });
    return error ? reply({ error: 'Rejected' }, 403) : reply({ ok: true });
  }
  const { error } = await caller.rpc('monthly_transition', { vid: a.version_id, next_state: a.next_state });
  return error ? reply({ error: 'Rejected' }, 403) : reply({ ok: true });
});
