// UNIT SIMULATION ONLY: disposable local PGlite DB with a local auth.uid() stub. Not authenticated hosted runtime.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { expect, test, beforeAll } from 'bun:test';
const root = process.env.MIG_ROOT ?? new URL('../../drizzle/migrations/', import.meta.url).pathname;
const LEASE_SQL = process.env.LEASE_SQL ?? root + '0004_monthly_stage_leases.sql';
const db = new PGlite();
const ADMIN = '11111111-1111-4111-8111-111111111111';
const fails = async (sql: string, p: unknown[] = []) => { try { await db.query(sql, p); return null; } catch (e) { return String((e as Error).message); } };
const S1 = { html: 'a'.repeat(64), pdf: 'b'.repeat(64), content: 'c'.repeat(64) }, B1 = { html: 10, pdf: 20, content: 5 };
const S2 = { ...S1, pdf: 'd'.repeat(64) };
let report = '';
const acquire = (req: string, sums = S1, bytes = B1) => db.query<any>(`SELECT * FROM monthly_admin_stage_acquire($1,$2,$3,$4)`, [req, report, JSON.stringify(sums), JSON.stringify(bytes)]).then((r) => r.rows[0]);
const commit = (req: string, lease: string | null) => db.query<any>(`SELECT monthly_admin_stage_commit($1,$2,'{"x":1}'::jsonb,null) id`, [req, lease]).then((r) => r.rows[0].id);
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
   CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
   CREATE SCHEMA storage; CREATE TABLE storage.objects(bucket_id text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
  for (const f of ['0000_monthly_portal_v1.sql', '0001_monthly_policy_scope_fix.sql', '0002_monthly_admin_atomic.sql', '0003_monthly_admin_tighten_grants.sql']) await db.exec(readFileSync(root + f, 'utf8').replaceAll('--> statement-breakpoint', ''));
  await db.exec(readFileSync(LEASE_SQL, 'utf8'));
  await db.exec(`INSERT INTO monthly_staff VALUES('${ADMIN}','admin'); SELECT set_config('test.uid','${ADMIN}',false);`);
  const org = (await db.query<any>(`SELECT monthly_admin_create_org('Synthetic') id`)).rows[0].id;
  const c = (await db.query<any>(`SELECT monthly_admin_create_client($1,'syn-l1','Syn',null) id`, [org])).rows[0].id;
  report = (await db.query<any>(`SELECT monthly_admin_create_report($1,now(),now()+interval '1 day','L','monthly') id`, [c])).rows[0].id;
});
const expire = (req: string) => db.query(`UPDATE monthly_staging SET lease_expires_at=now()-interval '1 second' WHERE request_id=$1`, [req]);

test('concurrent same request_id: second invocation is refused while lease is active', async () => {
  const r = crypto.randomUUID(); const a = await acquire(r);
  expect(a.lease).toBeTruthy();
  expect(await fails(`SELECT * FROM monthly_admin_stage_acquire($1,$2,$3,$4)`, [r, report, JSON.stringify(S1), JSON.stringify(B1)])).toContain('Busy');
});
test('same request_id with different payload is rejected (before and after commit)', async () => {
  const r = crypto.randomUUID(); const a = await acquire(r);
  expect(await fails(`SELECT * FROM monthly_admin_stage_acquire($1,$2,$3,$4)`, [r, report, JSON.stringify(S2), JSON.stringify(B1)])).toContain('Payload mismatch');
  await commit(r, a.lease);
  expect(await fails(`SELECT * FROM monthly_admin_stage_acquire($1,$2,$3,$4)`, [r, report, JSON.stringify(S2), JSON.stringify(B1)])).toContain('Payload mismatch');
});
test('committed retry returns ORIGINAL stored sums/bytes/version, no lease', async () => {
  const r = crypto.randomUUID(); const a = await acquire(r); const vid = await commit(r, a.lease);
  const again = await acquire(r);
  expect(again.state).toBe('committed'); expect(again.version_id).toBe(vid); expect(again.lease).toBeNull();
  expect(again.sums).toEqual(S1); expect(again.bytes).toEqual(B1);
  const v = (await db.query<any>(`SELECT dataset_sha256 FROM monthly_report_versions WHERE id=$1`, [vid])).rows[0];
  expect(v.dataset_sha256).toBe(S1.content);
});
test('stale lease holder cannot commit or release after a new owner acquired', async () => {
  const r = crypto.randomUUID(); const a = await acquire(r); await expire(r);
  const b = await acquire(r); expect(b.lease).not.toBe(a.lease);
  expect(await fails(`SELECT monthly_admin_stage_commit($1,$2,'{}'::jsonb,null)`, [r, a.lease])).toContain('Lease lost');
  expect((await db.query<any>(`SELECT monthly_admin_stage_release($1,$2,'x',true,'[]'::jsonb) ok`, [r, a.lease])).rows[0].ok).toBe(false);
  expect((await db.query<any>(`SELECT state FROM monthly_staging WHERE request_id=$1`, [r])).rows[0].state).toBe('reserved');
  expect(await commit(r, b.lease)).toBeTruthy();
});
test('expired lease cannot commit even if nobody re-acquired', async () => {
  const r = crypto.randomUUID(); const a = await acquire(r); await expire(r);
  expect(await fails(`SELECT monthly_admin_stage_commit($1,$2,'{}'::jsonb,null)`, [r, a.lease])).toContain('Lease lost');
});
test('release after commit is a no-op; orphan candidates audited on real release', async () => {
  const r = crypto.randomUUID(); const a = await acquire(r); await commit(r, a.lease);
  expect((await db.query<any>(`SELECT monthly_admin_stage_release($1,$2,'late',true,'[]'::jsonb) ok`, [r, a.lease])).rows[0].ok).toBe(false);
  const r2 = crypto.randomUUID(); const b = await acquire(r2);
  expect((await db.query<any>(`SELECT monthly_admin_stage_release($1,$2,'upload_pdf',false,'["p1"]'::jsonb) ok`, [r2, b.lease])).rows[0].ok).toBe(true);
  const log = (await db.query<any>(`SELECT detail FROM monthly_audit_log WHERE action='stage_attempt_failed' AND detail->>'request_id'=$1`, [r2])).rows[0];
  expect(log.detail.orphan_candidates).toEqual(['p1']);
  expect((await acquire(r2)).lease).toBeTruthy(); // non-fatal release lets the same request resume
});
test('distinct requests still get distinct versions', async () => {
  const x = await acquire(crypto.randomUUID()), y = await acquire(crypto.randomUUID());
  expect(x.version).not.toBe(y.version); expect(x.base_path).not.toBe(y.base_path);
});
