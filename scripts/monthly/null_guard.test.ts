// UNIT SIMULATION ONLY: disposable local PGlite DB with a local auth.uid() stub. Not authenticated hosted runtime.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { expect, test, beforeAll } from 'bun:test';
const root = process.env.MIG_ROOT ?? new URL('../../drizzle/migrations/', import.meta.url).pathname;
const GUARD = process.env.GUARD_SQL ?? root + '0005_monthly_stage_null_guards.sql';
const db = new PGlite();
const ADMIN = '11111111-1111-4111-8111-111111111111';
const fails = async (sql: string, p: unknown[] = []) => { try { await db.query(sql, p); return null; } catch (e) { return String((e as Error).message); } };
const S = { html: 'a'.repeat(64), pdf: 'b'.repeat(64), content: 'c'.repeat(64) }, B = { html: 10, pdf: 20, content: 5 };
let report = '';
const ACQ = `SELECT * FROM monthly_admin_stage_acquire($1,$2,$3::jsonb,$4::jsonb,$5)`;
const acq = (req: string, sums: unknown = S, bytes: unknown = B, secs: number | null = 120) => db.query<any>(ACQ, [req, report, sums === null ? null : JSON.stringify(sums), bytes === null ? null : JSON.stringify(bytes), secs]).then((r) => r.rows[0]);
const tryAcq = (req: string, sums: unknown = S, bytes: unknown = B, secs: number | null = 120) => fails(ACQ, [req, report, sums === null ? null : JSON.stringify(sums), bytes === null ? null : JSON.stringify(bytes), secs]);
const COMMIT = `SELECT monthly_admin_stage_commit($1,$2,'{}'::jsonb,null) id`;
const release = (req: string, lease: string | null, fatal: boolean | null = false) => db.query<any>(`SELECT monthly_admin_stage_release($1,$2,'t',$3,'[]'::jsonb) ok`, [req, lease, fatal]).then((r) => r.rows[0].ok);
const versions = async () => (await db.query<any>(`SELECT count(*)::int n FROM monthly_report_versions`)).rows[0].n;
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
   CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
   CREATE SCHEMA storage; CREATE TABLE storage.objects(bucket_id text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
  for (const f of ['0000_monthly_portal_v1.sql', '0001_monthly_policy_scope_fix.sql', '0002_monthly_admin_atomic.sql', '0003_monthly_admin_tighten_grants.sql', '0004_monthly_stage_leases.sql']) await db.exec(readFileSync(root + f, 'utf8').replaceAll('--> statement-breakpoint', ''));
  await db.exec(readFileSync(GUARD, 'utf8').replaceAll('--> statement-breakpoint', ''));
  await db.exec(`INSERT INTO monthly_staff VALUES('${ADMIN}','admin'); SELECT set_config('test.uid','${ADMIN}',false);`);
  const org = (await db.query<any>(`SELECT monthly_admin_create_org('Synthetic') id`)).rows[0].id;
  const c = (await db.query<any>(`SELECT monthly_admin_create_client($1,'syn-n1','Syn',null) id`, [org])).rows[0].id;
  report = (await db.query<any>(`SELECT monthly_admin_create_report($1,now(),now()+interval '1 day','L','monthly') id`, [c])).rows[0].id;
});
test('acquire rejects NULL lease duration and out-of-range duration', async () => {
  expect(await tryAcq(crypto.randomUUID(), S, B, null)).toContain('Invalid lease');
  expect(await tryAcq(crypto.randomUUID(), S, B, 5)).toContain('Invalid lease');
});
test('acquire rejects NULL / malformed sums and bytes', async () => {
  for (const [s, b] of [[null, B], [S, null], [{ ...S, pdf: null }, B], [S, { ...B, html: null }], [{ ...S, html: 'XYZ' }, B], [S, { ...B, pdf: 0 }], [S, { ...B, pdf: '20' }], [S, { ...B, pdf: 99_000_000 }], [{ html: S.html, pdf: S.pdf }, B]] as const)
    expect(await tryAcq(crypto.randomUUID(), s, b)).toContain('Invalid payload');
  expect(await fails(ACQ, [null, report, JSON.stringify(S), JSON.stringify(B), 120])).toContain('Invalid request');
});
test('released reservation + NULL lease cannot commit (the three-valued-logic hole)', async () => {
  const r = crypto.randomUUID(); const a = await acq(r);
  expect(await release(r, a.lease, false)).toBe(true);
  const st = (await db.query<any>(`SELECT lease_token,lease_expires_at FROM monthly_staging WHERE request_id=$1`, [r])).rows[0];
  expect(st.lease_token).toBeNull(); expect(st.lease_expires_at).toBeNull();
  const n = await versions();
  expect(await fails(COMMIT, [r, null])).toContain('Lease lost');
  expect(await fails(COMMIT, [r, a.lease])).toContain('Lease lost');
  expect(await versions()).toBe(n);
});
test('NULL / unknown / expired / stale token commit is rejected; NULL-lease release is a no-op', async () => {
  const r = crypto.randomUUID(); const a = await acq(r);
  expect(await fails(COMMIT, [r, null])).toContain('Lease lost');
  expect(await fails(COMMIT, [r, crypto.randomUUID()])).toContain('Lease lost');
  expect(await release(r, null)).toBe(false);
  await db.query(`UPDATE monthly_staging SET lease_expires_at=now()-interval '1 second' WHERE request_id=$1`, [r]);
  expect(await fails(COMMIT, [r, a.lease])).toContain('Lease lost');
  const b = await acq(r);
  expect(await fails(COMMIT, [r, a.lease])).toContain('Lease lost');
  await db.query(`UPDATE monthly_staging SET lease_expires_at=NULL WHERE request_id=$1`, [r]); // corrupted expiry fails closed
  expect(await fails(COMMIT, [r, b.lease])).toContain('Lease lost');
  expect(await fails(COMMIT, [null, b.lease])).toContain('Forbidden');
});
test('normal released request can reacquire and commit; committed retry stays idempotent', async () => {
  const r = crypto.randomUUID(); const a = await acq(r);
  expect(await release(r, a.lease, false)).toBe(true);
  const b = await acq(r); expect(b.lease).toBeTruthy();
  const vid = (await db.query<any>(COMMIT, [r, b.lease])).rows[0].id; expect(vid).toBeTruthy();
  expect((await db.query<any>(COMMIT, [r, null])).rows[0].id).toBe(vid);
  const again = await acq(r); expect(again.version_id).toBe(vid); expect(again.lease).toBeNull(); expect(again.sums).toEqual(S);
});
test('NULL fatal flag on release fails closed to a terminal failed state', async () => {
  const r = crypto.randomUUID(); const a = await acq(r);
  expect(await release(r, a.lease, null)).toBe(true);
  expect((await db.query<any>(`SELECT state FROM monthly_staging WHERE request_id=$1`, [r])).rows[0].state).toBe('failed');
});
test('non-admin caller is refused', async () => {
  await db.exec(`SELECT set_config('test.uid','22222222-2222-4222-8222-222222222222',false)`);
  expect(await tryAcq(crypto.randomUUID())).not.toBeNull();
  expect(await fails(COMMIT, [crypto.randomUUID(), crypto.randomUUID()])).not.toBeNull();
  await db.exec(`SELECT set_config('test.uid','${ADMIN}',false)`);
});
