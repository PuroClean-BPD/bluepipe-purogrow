// Run: bun test scripts/monthly/atomic.test.ts (needs @electric-sql/pglite in a scratch NODE_PATH).
// Throwaway local PGlite database. auth.uid() stub exists ONLY in this disposable local DB.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { expect, test, beforeAll } from 'bun:test';
const root = process.env.MIG_ROOT ?? new URL('../../drizzle/migrations/', import.meta.url).pathname;
const db = new PGlite();
const ADMIN = '11111111-1111-4111-8111-111111111111', EDITOR = '22222222-2222-4222-8222-222222222222', CLIENT = '33333333-3333-4333-8333-333333333333';
const as = (u: string | null) => db.exec(`SELECT set_config('test.uid','${u ?? ''}',false)`);
const count = async (t: string) => Number((await db.query<{ n: number }>(`SELECT count(*)::int n FROM ${t}`)).rows[0].n);
const fails = async (sql: string, p: unknown[] = []) => { try { await db.query(sql, p); return false; } catch { return true; } };
let org = '', client = '', report = '';
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
   CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
   CREATE SCHEMA storage; CREATE TABLE storage.objects(bucket_id text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
  for (const f of ['0000_monthly_portal_v1.sql', '0001_monthly_policy_scope_fix.sql']) await db.exec(readFileSync(root + f, 'utf8').replaceAll('--> statement-breakpoint', ''));
  await db.exec(readFileSync(root + '0002_monthly_admin_atomic.sql', 'utf8'));
  await db.exec(`INSERT INTO monthly_staff VALUES('${ADMIN}','admin'),('${EDITOR}','editor');
   CREATE FUNCTION inject() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF current_setting('test.fail_audit',true)='1' THEN RAISE EXCEPTION 'injected audit failure'; END IF; RETURN NEW; END $$;
   CREATE TRIGGER inject BEFORE INSERT ON monthly_audit_log FOR EACH ROW EXECUTE FUNCTION inject();`);
  await as(ADMIN);
  org = (await db.query<{ id: string }>(`SELECT monthly_admin_create_org('Synthetic Org') id`)).rows[0].id;
  client = (await db.query<{ id: string }>(`SELECT monthly_admin_create_client($1,'syn-a1','Synthetic A1',null) id`, [org])).rows[0].id;
  report = (await db.query<{ id: string }>(`SELECT monthly_admin_create_report($1,'2026-10-05T05:00:00Z','2026-11-06T06:00:00Z','Oct 5 - Nov 5 2026','monthly') id`, [client])).rows[0].id;
});
const fail = (on: boolean) => db.exec(`SELECT set_config('test.fail_audit','${on ? 1 : 0}',false)`);

test('anon, editor and client cannot call admin RPCs', async () => {
  for (const u of [null, EDITOR, CLIENT]) { await as(u); expect(await fails(`SELECT monthly_admin_create_org('x')`)).toBe(true); expect(await fails(`SELECT * FROM monthly_admin_reserve_version(gen_random_uuid(),$1)`, [report])).toBe(true); }
  await as(ADMIN);
});
test('audit failure rolls back create_org/client/report', async () => {
  const before = [await count('monthly_organizations'), await count('monthly_clients'), await count('monthly_reports')];
  await fail(true);
  expect(await fails(`SELECT monthly_admin_create_org('y')`)).toBe(true);
  expect(await fails(`SELECT monthly_admin_create_client($1,'syn-x','X',null)`, [org])).toBe(true);
  expect(await fails(`SELECT monthly_admin_create_report($1,now(),now()+interval '1 day','L','monthly')`, [client])).toBe(true);
  await fail(false);
  expect([await count('monthly_organizations'), await count('monthly_clients'), await count('monthly_reports')]).toEqual(before);
});
test('audit failure rolls back reservation, commit and provisioning intent', async () => {
  const r1 = crypto.randomUUID();
  await fail(true);
  expect(await fails(`SELECT * FROM monthly_admin_reserve_version($1,$2)`, [r1, report])).toBe(true);
  expect(await fails(`SELECT * FROM monthly_admin_provision_begin($1,'syn@example.invalid')`, [crypto.randomUUID()])).toBe(true);
  await fail(false);
  expect(await count('monthly_staging')).toBe(0);
  expect(await count('monthly_provisioning')).toBe(0);
  await db.query(`SELECT * FROM monthly_admin_reserve_version($1,$2)`, [r1, report]);
  await fail(true);
  expect(await fails(`SELECT monthly_admin_commit_version($1,'{}'::jsonb,$2,'{}'::jsonb,null)`, [r1, 'a'.repeat(64)])).toBe(true);
  await fail(false);
  expect(await count('monthly_report_versions')).toBe(0);
  expect((await db.query<{ state: string }>(`SELECT state FROM monthly_staging WHERE request_id=$1`, [r1])).rows[0].state).toBe('reserved');
});
test('distinct requests get distinct versions and request-unique paths; retry is idempotent', async () => {
  const a = crypto.randomUUID(), b = crypto.randomUUID();
  const ra = (await db.query<any>(`SELECT * FROM monthly_admin_reserve_version($1,$2)`, [a, report])).rows[0];
  const rb = (await db.query<any>(`SELECT * FROM monthly_admin_reserve_version($1,$2)`, [b, report])).rows[0];
  expect(ra.version).not.toBe(rb.version);
  expect(ra.base_path).not.toBe(rb.base_path);
  expect(ra.base_path.endsWith(a)).toBe(true);
  const again = (await db.query<any>(`SELECT * FROM monthly_admin_reserve_version($1,$2)`, [a, report])).rows[0];
  expect(again).toEqual(ra);
  const v1 = (await db.query<any>(`SELECT monthly_admin_commit_version($1,'{"k":1}'::jsonb,$2,'{}'::jsonb,null) id`, [a, 'b'.repeat(64)])).rows[0].id;
  const v2 = (await db.query<any>(`SELECT monthly_admin_commit_version($1,'{"k":1}'::jsonb,$2,'{}'::jsonb,null) id`, [a, 'b'.repeat(64)])).rows[0].id;
  expect(v2).toBe(v1);
  expect((await db.query<any>(`SELECT state FROM monthly_report_versions WHERE id=$1`, [v1])).rows[0].state).toBe('draft');
  expect(await fails(`SELECT * FROM monthly_admin_reserve_version($1,$2)`, [a, crypto.randomUUID()])).toBe(true);
});
test('provision: intent audited before auth call; finish records outcome once', async () => {
  const r = crypto.randomUUID();
  await db.query(`SELECT * FROM monthly_admin_provision_begin($1,'Syn@Example.invalid')`, [r]);
  expect((await db.query<any>(`SELECT count(*)::int n FROM monthly_audit_log WHERE action='provision_intent' AND target_id=$1`, [r])).rows[0].n).toBe(1);
  await fail(true);
  expect(await fails(`SELECT monthly_admin_provision_finish($1,$2,null)`, [r, CLIENT])).toBe(true);
  await fail(false);
  expect((await db.query<any>(`SELECT state FROM monthly_provisioning WHERE request_id=$1`, [r])).rows[0].state).toBe('pending');
  await db.query(`SELECT monthly_admin_provision_finish($1,$2,null)`, [r, CLIENT]);
  expect((await db.query<any>(`SELECT state FROM monthly_provisioning WHERE request_id=$1`, [r])).rows[0].state).toBe('created');
});
test('audit log stays append-only', async () => {
  expect(await fails(`DELETE FROM monthly_audit_log`)).toBe(true);
  expect(await fails(`UPDATE monthly_audit_log SET action='x'`)).toBe(true);
});
