// Disposable local SQL UNIT simulation only (PGlite, auth.uid() stub). Not hosted runtime.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { test, expect, beforeAll } from "bun:test";
const db = new PGlite();
const synAdmin = "11111111-1111-4111-8111-111111111111";
const realAdmin = "55555555-5555-4555-8555-555555555555";
const synEditor = "33333333-3333-4333-8333-333333333333";
const q = async (sql: string) => (await db.query<any>(sql)).rows;
const as = (id: string) => db.exec(`select set_config('unit.uid','${id}',false)`);
const fails = async (sql: string) => { try { await db.exec(sql); return false; } catch { return true; } };
beforeAll(async () => {
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('unit.uid',true),'')::uuid$$;create schema storage;create table storage.objects(bucket_id text);alter table storage.objects enable row level security;");
  for (const f of readdirSync("drizzle/migrations").filter((x) => x.endsWith(".sql")).sort())
    await db.exec(readFileSync("drizzle/migrations/" + f, "utf8").replaceAll("--> statement-breakpoint", ""));
  await db.exec(`insert into auth.users values('${synEditor}','bluepipe-monthly-${"a".repeat(32)}-editor@example.invalid'),('${realAdmin}','staff@bluepipe.example')`);
  await db.exec(`insert into monthly_staff(user_id,role,synthetic) values('${synAdmin}','admin',true),('${realAdmin}','admin',false),('${synEditor}','editor',true)`);
});
test("synthetic admin cannot revoke staff", async () => {
  await as(synAdmin);
  expect(await fails(`select monthly_revoke_synthetic_staff('${synEditor}','qa cleanup')`)).toBe(true);
  expect((await q(`select revoked_at from monthly_staff where user_id='${synEditor}'`))[0].revoked_at).toBeNull();
});
test("real admin cannot revoke a real or self identity", async () => {
  await as(realAdmin);
  expect(await fails(`select monthly_revoke_synthetic_staff('${realAdmin}','self')`)).toBe(true);
});
test("real admin revokes reserved fixture: row kept, audited, authority gone", async () => {
  await as(realAdmin);
  await db.exec(`select monthly_revoke_synthetic_staff('${synEditor}','pre-import cleanup')`);
  expect((await q(`select count(*)::int n from monthly_staff where user_id='${synEditor}' and revoked_at is not null and revoked_by='${realAdmin}'`))[0].n).toBe(1);
  expect((await q(`select count(*)::int n from monthly_audit_log where action='staff_revoke_synthetic' and target_id='${synEditor}'`))[0].n).toBe(1);
  await as(synEditor);
  expect((await q("select monthly_staff_role() r"))[0].r).toBeNull();
  await as(realAdmin);
  expect(await fails(`select monthly_revoke_synthetic_staff('${synEditor}','again')`)).toBe(true);
});
test("revoked synthetic admin loses admin RPCs", async () => {
  await db.exec(`insert into auth.users values('${synAdmin}','bluepipe-monthly-${"b".repeat(32)}-admin@example.invalid')`);
  await as(realAdmin);
  await db.exec(`select monthly_revoke_synthetic_staff('${synAdmin}','pre-import cleanup')`);
  await as(synAdmin);
  expect(await fails("select monthly_admin_create_org('syn-denied')")).toBe(true);
});
test("scope audit keeps exact before/after client UUIDs, never secrets", async () => {
  await as(realAdmin);
  const org = (await q("select monthly_admin_create_org('syn-audit') id"))[0].id;
  const a = (await q(`select monthly_admin_create_client('${org}','syn-a','A',null) id`))[0].id;
  const b = (await q(`select monthly_admin_create_client('${org}','syn-b','B',null) id`))[0].id;
  const s = "d".repeat(32), h = "c".repeat(64);
  const cid = (await q(`select monthly_code_manage('create_synthetic',null,'${s}','${s}','${h}',array['${a}','${b}']::uuid[]) id`))[0].id;
  await db.exec(`select monthly_code_manage('remove_scope','${cid}',null,null,null,array['${a}']::uuid[])`);
  const d = (await q(`select detail from monthly_audit_log where action='code_admin_remove_scope' and target_id='${cid}'`))[0].detail;
  expect([...d.before_clients].sort()).toEqual([a, b].sort());
  expect(d.after_clients).toEqual([b]);
  expect(d.requested_clients).toEqual([a]);
  expect(d.generation_after).toBe(d.generation_before + 1);
  expect(JSON.stringify(d)).not.toContain(h);
});
