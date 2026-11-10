// Disposable local SQL UNIT simulation only. No hosted JWT/identity spoofing.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { test, expect, beforeAll } from "bun:test";
const db = new PGlite();
const admin = "11111111-1111-4111-8111-111111111111";
const approver = "22222222-2222-4222-8222-222222222222";
const editor = "33333333-3333-4333-8333-333333333333";
const owner = "44444444-4444-4444-8444-444444444444";
const query = async (sql: string, args: unknown[] = []) =>
  (await db.query<any>(sql, args)).rows;
const identity = async (id: string) =>
  db.exec(`select set_config('unit.uid','${id}',false)`);
let client = "",
  version = "";
beforeAll(async () => {
  await db.exec(
    "create role anon;create role authenticated;create role service_role;create schema auth;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('unit.uid',true),'')::uuid$$;create schema storage;create table storage.objects(bucket_id text);alter table storage.objects enable row level security;",
  );
  for (const f of readdirSync("drizzle/migrations")
    .filter((x) => x.endsWith(".sql"))
    .sort()) {
    if (process.env.UNIT_BEFORE === "1" && f.startsWith("0009")) continue;
    await db.exec(
      readFileSync("drizzle/migrations/" + f, "utf8").replaceAll(
        "--> statement-breakpoint",
        "",
      ),
    );
  }
  await db.exec(
    `insert into monthly_staff(user_id,role) values('${admin}','admin'),('${approver}','approver'),('${editor}','editor')`,
  );
  await identity(admin);
  const org = (
    await query(
      "select monthly_admin_create_org('Synthetic retirement UNIT') id",
    )
  )[0].id;
  client = (
    await query(
      "select monthly_admin_create_client($1,'syn-retirement-unit','Synthetic UNIT',null) id",
      [org],
    )
  )[0].id;
  const report = (
    await query(
      "select monthly_admin_create_report($1,now(),now()+interval '1 day','Synthetic UNIT','monthly') id",
      [client],
    )
  )[0].id;
  const request = crypto.randomUUID();
  const lease = (
    await query("select * from monthly_admin_stage_acquire($1,$2,$3,$4)", [
      request,
      report,
      JSON.stringify({
        html: "a".repeat(64),
        pdf: "b".repeat(64),
        content: "c".repeat(64),
      }),
      JSON.stringify({ html: 10, pdf: 10, content: 10 }),
    ])
  )[0].lease;
  version = (
    await query("select monthly_admin_stage_commit($1,$2,'{}',null) id", [
      request,
      lease,
    ])
  )[0].id;
  await query(
    "select monthly_grant($1,$2,'client_viewer','UNIT historical membership')",
    [owner, client],
  );
});
test("historical owner membership cannot authorize client or version JWT reads", async () => {
  await identity(owner);
  expect(
    (
      await query("select coalesce(monthly_can_client($1),false) allowed", [
        client,
      ])
    )[0].allowed,
  ).toBe(false);
  expect(
    (
      await query("select coalesce(monthly_can_version($1),false) allowed", [
        version,
      ])
    )[0].allowed,
  ).toBe(false);
  await db.exec("set role authenticated");
  expect((await query("select id from monthly_clients")).length).toBe(0);
  expect((await query("select id from monthly_report_versions")).length).toBe(
    0,
  );
  await db.exec("reset role");
});
test("approver can approve; cannot publish; editor cannot approve or publish", async () => {
  await identity(editor);
  await expect(
    query("select monthly_transition($1,'approved')", [version]),
  ).rejects.toThrow();
  await identity(approver);
  await query("select monthly_transition($1,'approved')", [version]);
  expect(
    (
      await query("select state from monthly_report_versions where id=$1", [
        version,
      ])
    )[0].state,
  ).toBe("approved");
  await expect(
    query("select monthly_transition($1,'published')", [version]),
  ).rejects.toThrow();
  await identity(editor);
  await expect(
    query("select monthly_transition($1,'published')", [version]),
  ).rejects.toThrow();
  await identity(admin);
  await query("select monthly_transition($1,'published')", [version]);
  expect(
    (
      await query("select state from monthly_report_versions where id=$1", [
        version,
      ])
    )[0].state,
  ).toBe("published");
});
test("staff read preserved and synthetic approver cannot import real data", async () => {
  await identity(approver);
  expect(
    (await query("select monthly_can_client($1) allowed", [client]))[0].allowed,
  ).toBe(true);
  await expect(
    query("select monthly_admin_create_org('Real import denied')"),
  ).rejects.toThrow();
});
