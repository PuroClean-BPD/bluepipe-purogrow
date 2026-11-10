// Disposable PGlite UNIT simulation ONLY. Local auth.uid stub is never deployed.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { test, expect, beforeAll } from "bun:test";
import {
  verifier,
  digest,
  opaque,
  equal,
} from "../../supabase/functions/monthly-code/crypto";
const db = new PGlite();
const admin = "11111111-1111-4111-8111-111111111111";
const q = async (sql: string, args: unknown[] = []) =>
  (await db.query<any>(sql, args)).rows;
const manage = async (
  action: string,
  id: string | null = null,
  clients: string[] | null = null,
) =>
  (
    await q(`select monthly_code_manage($1,$2,$3,$4,$5,$6) id`, [
      action,
      id,
      opaque().slice(0, 32),
      opaque().slice(0, 32),
      "a".repeat(64),
      clients,
    ])
  )[0].id;
const access = async (
  token: string,
  action = "archive",
  version: string | null = null,
) =>
  (
    await q(`select monthly_code_access($1,$2,$3,'html') r`, [
      token,
      action,
      version,
    ])
  )[0].r;
let clients: string[] = [];
let ids: string[] = [];
let tokens: string[] = [];
let selector = "";
let version = "";
async function login(id: string) {
  const c = (
    await q("select selector from monthly_code_credentials where id=$1", [id])
  )[0];
  const a = (await q("select monthly_code_begin($1) r", [c.selector]))[0].r;
  expect(a.allowed).toBe(true);
  const t = opaque();
  const f = (
    await q("select monthly_code_finish($1,true,$2) r", [a.attempt, t])
  )[0].r;
  expect(f.ok).toBe(true);
  return t;
}
beforeAll(async () => {
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create schema auth;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;create schema storage;create table storage.objects(bucket_id text);alter table storage.objects enable row level security;`,
  );
  for (const f of readdirSync("drizzle/migrations")
    .filter((x) => x.endsWith(".sql"))
    .sort())
    await db.exec(
      readFileSync("drizzle/migrations/" + f, "utf8").replaceAll(
        "--> statement-breakpoint",
        "",
      ),
    );
  await db.exec(
    `insert into monthly_staff values('${admin}','admin');select set_config('test.uid','${admin}',false);`,
  );
  const org = (
    await q("select monthly_admin_create_org('Synthetic code UNIT') id")
  )[0].id;
  for (let i = 0; i < 24; i++)
    clients.push(
      (
        await q("select monthly_admin_create_client($1,$2,$3,null) id", [
          org,
          "syn-code-" + i,
          "Synthetic " + i,
        ])
      )[0].id,
    );
  let offset = 0;
  for (const n of [3, 3, 2, 2, ...Array(14).fill(1)]) {
    ids.push(
      await manage("create_synthetic", null, clients.slice(offset, offset + n)),
    );
    offset += n;
  }
  for (const id of ids) tokens.push(await login(id));
  selector = (
    await q("select selector from monthly_code_credentials where id=$1", [
      ids[0],
    ])
  )[0].selector;
  const report = (
    await q(
      "select monthly_admin_create_report($1,now(),now()+interval '1 day','Synthetic period','monthly') id",
      [clients[0]],
    )
  )[0].id;
  const a = (
    await q("select * from monthly_admin_stage_acquire($1,$2,$3,$4)", [
      crypto.randomUUID(),
      report,
      JSON.stringify({
        html: "a".repeat(64),
        pdf: "b".repeat(64),
        content: "c".repeat(64),
      }),
      JSON.stringify({ html: 10, pdf: 10, content: 10 }),
    ])
  )[0];
  version = (
    await q("select monthly_admin_stage_commit($1,$2,'{}',null) id", [
      a.request_id ??
        (
          await q("select request_id from monthly_staging where report_id=$1", [
            report,
          ])
        )[0].request_id,
      a.lease,
    ])
  )[0].id;
});
test("18 owners cover exactly 24 with 3/3/2/2 plus 14 singles; 432 matrix cells", async () => {
  expect(ids.length).toBe(18);
  let offset = 0;
  for (let i = 0; i < 18; i++) {
    const n = [3, 3, 2, 2, ...Array(14).fill(1)][i];
    const a = await access(tokens[i]);
    expect(a.ok).toBe(true);
    for (let j = 0; j < 24; j++)
      expect(a.clients.some((x: any) => x.id === clients[j])).toBe(
        j >= offset && j < offset + n,
      );
    offset += n;
  }
  expect(offset).toBe(24);
});
test("draft and approved hidden; published only visible in correct scope; withdrawn hidden", async () => {
  expect((await access(tokens[0])).reports.length).toBe(0);
  await q("select monthly_transition($1,'approved')", [version]);
  expect((await access(tokens[0], "file", version)).ok).toBe(false);
  await q("select monthly_transition($1,'published')", [version]);
  expect((await access(tokens[0], "file", version)).ok).toBe(true);
  expect((await access(tokens[1], "file", version)).ok).toBe(false);
  expect((await access(tokens[0], "file", crypto.randomUUID())).ok).toBe(false);
  await q("select monthly_transition($1,'withdrawn')", [version]);
  expect((await access(tokens[0], "file", version)).ok).toBe(false);
});
test("logout and digest replay immediately denied", async () => {
  expect((await access(tokens[2], "logout")).ok).toBe(true);
  expect((await access(tokens[2])).ok).toBe(false);
});
test("scope removal invalidates sessions immediately", async () => {
  await manage("remove_scope", ids[3], [clients[8]]);
  expect((await access(tokens[3])).ok).toBe(false);
});
test("rotate and revoke invalidate sessions", async () => {
  await manage("rotate", ids[4]);
  expect((await access(tokens[4])).ok).toBe(false);
  await manage("revoke", ids[5]);
  expect((await access(tokens[5])).ok).toBe(false);
});
test("expiry exactly 30 days and expired session denied", async () => {
  const r = (
    await q("select expires_at from monthly_code_sessions where digest=$1", [
      tokens[6],
    ])
  )[0];
  expect(
    Math.abs(Date.parse(r.expires_at) - Date.now() - 30 * 86400000),
  ).toBeLessThan(10000);
  await q(
    "update monthly_code_sessions set expires_at=now()-interval '1 second' where digest=$1",
    [tokens[6]],
  );
  expect((await access(tokens[6])).ok).toBe(false);
});
test("five in-flight reservations cap KDF; five finished failures lock 15 min; cooldown recovers", async () => {
  await manage("unlock", ids[0]);
  const attempts = [];
  for (let i = 0; i < 5; i++) {
    const r = (await q("select monthly_code_begin($1) r", [selector]))[0].r;
    expect(r.allowed).toBe(true);
    attempts.push(r.attempt);
  }
  expect(
    (await q("select monthly_code_begin($1) r", [selector]))[0].r.allowed,
  ).toBe(false);
  for (const a of attempts)
    expect(
      (await q("select monthly_code_finish($1,false,$2) r", [a, opaque()]))[0].r
        .ok,
    ).toBe(false);
  const r = (
    await q("select locked_until from monthly_code_credentials where id=$1", [
      ids[0],
    ])
  )[0];
  expect(
    Math.abs(Date.parse(r.locked_until) - Date.now() - 900000),
  ).toBeLessThan(5000);
  await q(
    "update monthly_code_credentials set locked_until=now()-interval '1 second',window_start=now()-interval '16 minutes' where id=$1",
    [ids[0]],
  );
  expect(
    (await q("select monthly_code_begin($1) r", [selector]))[0].r.allowed,
  ).toBe(true);
});
test("rotation racing in-flight KDF prevents issuance", async () => {
  await manage("unlock", ids[7]);
  const c = (
    await q("select selector from monthly_code_credentials where id=$1", [
      ids[7],
    ])
  )[0];
  const a = (await q("select monthly_code_begin($1) r", [c.selector]))[0].r;
  await manage("rotate", ids[7]);
  expect(
    (
      await q("select monthly_code_finish($1,true,$2) r", [a.attempt, opaque()])
    )[0].r.ok,
  ).toBe(false);
});
test("unknown selector generic denied, global 30/min bound before KDF", async () => {
  await q("update monthly_code_budget set used=29 where id");
  expect((await q("select monthly_code_begin('unknown') r"))[0].r.allowed).toBe(
    false,
  );
  expect(
    (await q("select monthly_code_begin($1) r", [selector]))[0].r.allowed,
  ).toBe(false);
});
test("audit failure rolls back mutation, session creation and access", async () => {
  await db.exec(
    "create function fail_code_audit() returns trigger language plpgsql as $$begin raise exception 'injected audit failure';end$$;create trigger unit_fail before insert on monthly_audit_log for each row execute function fail_code_audit();",
  );
  const before = (
    await q("select generation from monthly_code_credentials where id=$1", [
      ids[8],
    ])
  )[0].generation;
  await expect(manage("revoke", ids[8])).rejects.toThrow(
    "injected audit failure",
  );
  expect(
    (
      await q("select generation from monthly_code_credentials where id=$1", [
        ids[8],
      ])
    )[0].generation,
  ).toBe(before);
  await expect(access(tokens[8])).rejects.toThrow("injected audit failure");
  await db.exec("drop trigger unit_fail on monthly_audit_log");
});
test("staff check rejects nonadmin manage and all owner SQL grants absent", async () => {
  await db.exec(
    "select set_config('test.uid','22222222-2222-4222-8222-222222222222',false)",
  );
  await expect(manage("unlock", ids[0])).rejects.toThrow("Forbidden");
  expect(
    (
      await q(
        "select has_function_privilege('anon','monthly_code_access(text,text,uuid,text)','EXECUTE') ok",
      )
    )[0].ok,
  ).toBe(false);
  expect(
    (
      await q(
        "select has_table_privilege('authenticated','monthly_code_credentials','SELECT') ok",
      )
    )[0].ok,
  ).toBe(false);
});
test("PBKDF2 salted verifier and 256 bit opaque generator", async () => {
  const a = await verifier("synthetic-unit-only", "a".repeat(32));
  const b = await verifier("synthetic-unit-only", "b".repeat(32));
  expect(a.length).toBe(64);
  expect(equal(a, b)).toBe(false);
  expect(await digest("a")).toBe(
    "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
  );
  expect(opaque()).toMatch(/^[a-f0-9]{64}$/);
});
test("regression: six valid logins do not lock a zero-failure credential", async () => {
  await db.exec(
    `select set_config('test.uid','${admin}',false);update monthly_code_budget set used=0 where id;`,
  );
  await manage("unlock", ids[9]);
  for (let i = 0; i < 6; i++) await login(ids[9]);
  const row = (
    await q(
      "select failures,locked_until from monthly_code_credentials where id=$1",
      [ids[9]],
    )
  )[0];
  expect(row.failures).toBe(0);
  expect(row.locked_until).toBeNull();
});
test("mixed concurrent successes and failures: successes release only own slot", async () => {
  await q("update monthly_code_budget set used=0 where id");
  await manage("unlock", ids[10]);
  const c = (
    await q("select selector from monthly_code_credentials where id=$1", [
      ids[10],
    ])
  )[0];
  const begin = async () =>
    (await q("select monthly_code_begin($1) r", [c.selector]))[0].r;
  const a = await Promise.all([begin(), begin(), begin(), begin()]);
  await Promise.all(
    a.map((x, i) =>
      q("select monthly_code_finish($1,$2,$3) r", [x.attempt, i < 2, opaque()]),
    ),
  );
  let row = (
    await q(
      "select failures,locked_until from monthly_code_credentials where id=$1",
      [ids[10]],
    )
  )[0];
  expect(row.failures).toBe(2);
  expect(row.locked_until).toBeNull();
  for (let i = 0; i < 3; i++) {
    const x = await begin();
    await q("select monthly_code_finish($1,false,$2)", [x.attempt, opaque()]);
  }
  row = (
    await q(
      "select failures,locked_until from monthly_code_credentials where id=$1",
      [ids[10]],
    )
  )[0];
  expect(row.failures).toBe(5);
  expect(row.locked_until).not.toBeNull();
});
test("real staged credential requires genuine nonsynthetic admin and defaults inactive", async () => {
  const before = (
    await q(
      "select count(*)::int n from monthly_code_credentials where not synthetic",
    )
  )[0].n;
  await expect(
    q("select monthly_code_manage('create_real_staged',null,$1,$2,$3,$4)", [
      opaque().slice(0, 32),
      opaque().slice(0, 32),
      "a".repeat(64),
      [clients[0]],
    ]),
  ).rejects.toThrow();
  expect(
    (
      await q(
        "select count(*)::int n from monthly_code_credentials where not synthetic",
      )
    )[0].n,
  ).toBe(before);
  await expect(
    q("select monthly_admin_create_org('Real PuroClean')"),
  ).rejects.toThrow("Real staff required");
  const d = await q(
    "select column_default from information_schema.columns where table_name='monthly_code_credentials' and column_name in ('synthetic','active') order by column_name",
  );
  expect(d.map((x: any) => x.column_default)).toEqual(["false", "false"]);
});
test("UNIT missing frozen hashes deny every format before signing", async () => {
  await db.exec(`select set_config('test.uid','${admin}',false);`);
  // Withdrawn fixture can be tested via a new published report, then corrupt only disposable SQL state.
  const report = (
    await q(
      "select monthly_admin_create_report($1,'2026-10-05','2026-11-05','Synthetic hash UNIT','monthly') id",
      [clients[17]],
    )
  )[0].id;
  const request = crypto.randomUUID();
  const staged = (
    await q("select * from monthly_admin_stage_acquire($1,$2,$3,$4)", [
      request,
      report,
      JSON.stringify({
        html: "a".repeat(64),
        pdf: "b".repeat(64),
        content: "c".repeat(64),
      }),
      JSON.stringify({ html: 10, pdf: 10, content: 10 }),
    ])
  )[0];
  const id = (
    await q("select monthly_admin_stage_commit($1,$2,'{}',null) id", [
      request,
      staged.lease,
    ])
  )[0].id;
  await q("select monthly_transition($1,'approved')", [id]);
  await q("select monthly_transition($1,'published')", [id]);
  expect((await access(tokens[11], "file", id)).sha256).toBe("a".repeat(64));
  await q("update monthly_staging set sums=sums-'html' where request_id=$1", [
    request,
  ]);
  expect((await access(tokens[11], "file", id)).ok).toBe(false);
  await q(
    "update monthly_staging set sums=jsonb_set(sums,'{pdf}','\"bad\"') where request_id=$1",
    [request],
  );
  expect(
    (
      await q("select monthly_code_access($1,'file',$2,'pdf') r", [
        tokens[11],
        id,
      ])
    )[0].r.ok,
  ).toBe(false);
  await q(
    "update monthly_staging set sums=jsonb_set(sums,'{content}',to_jsonb(repeat('d',64))) where request_id=$1",
    [request],
  );
  expect(
    (
      await q("select monthly_code_access($1,'file',$2,'content') r", [
        tokens[11],
        id,
      ])
    )[0].r.ok,
  ).toBe(false);
});
test("UNIT real staged verifier transaction stores false/false and synthetic staff cannot import", async () => {
  // Disposable local simulation only; no real identity or live bootstrap.
  await q("update monthly_staff set synthetic=false where user_id=$1", [admin]);
  const org = (
    await q("select monthly_admin_create_org('UNIT real classification') id")
  )[0].id;
  const client = (
    await q(
      "select monthly_admin_create_client($1,'unit-real-scope','UNIT only',null) id",
      [org],
    )
  )[0].id;
  const id = await manage("create_real_staged", null, [client]);
  const row = (
    await q(
      "select synthetic,active from monthly_code_credentials where id=$1",
      [id],
    )
  )[0];
  expect(row.synthetic).toBe(false);
  expect(row.active).toBe(false);
  await q("update monthly_staff set synthetic=true where user_id=$1", [admin]);
  await expect(
    q(
      "select monthly_admin_create_report($1,now(),now()+interval '1 day','UNIT','monthly')",
      [client],
    ),
  ).rejects.toThrow("Real staff required");
  await expect(manage("unlock", id)).rejects.toThrow("Real staff required");
});
test("UNIT archive SQL orders latest period first despite reversed insertion", async () => {
  await db.exec(`select set_config('test.uid','${admin}',false);`);
  const idsInOrder = [];
  for (const end of ["2026-12-05T23:59:59Z", "2026-11-05T23:59:59Z"]) {
    const report = (
      await q(
        "select monthly_admin_create_report($1,'2026-10-05',$2,'Synthetic order UNIT','monthly') id",
        [clients[18], end],
      )
    )[0].id;
    const request = crypto.randomUUID();
    const lease = (
      await q("select * from monthly_admin_stage_acquire($1,$2,$3,$4)", [
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
    const id = (
      await q("select monthly_admin_stage_commit($1,$2,'{}',null) id", [
        request,
        lease,
      ])
    )[0].id;
    await q("select monthly_transition($1,'approved')", [id]);
    await q("select monthly_transition($1,'published')", [id]);
    idsInOrder.push(id);
  }
  const archive = await access(tokens[12]);
  expect(archive.reports.map((r: any) => r.id)).toEqual(idsInOrder);
});
