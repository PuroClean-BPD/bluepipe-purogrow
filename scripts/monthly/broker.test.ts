import { test, expect, afterEach } from "bun:test";
import handler from "../../netlify/functions/monthly-owner.mts";
const original = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = original;
});
const req = (
  body: unknown,
  cookie?: string,
  origin = "https://puroclean.bluepipedigital.com",
) =>
  new Request("https://puroclean.bluepipedigital.com/portal/api/owner", {
    method: "POST",
    headers: {
      Origin: origin,
      "X-BluePipe-Request": "1",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
test("broker sets 30-day host-only HttpOnly Secure Strict cookie, no session JSON", async () => {
  globalThis.fetch = async () =>
    Response.json({
      session: "a".repeat(64),
      expires_at: "2026-12-10T19:34:00Z",
    });
  const r = await handler(req({ action: "login", code: "synthetic" }));
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ ok: true });
  expect(r.headers.get("set-cookie")).toBe(
    "__Host-bluepipe-owner=" +
      "a".repeat(64) +
      "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000",
  );
  expect(r.headers.get("cache-control")).toBe("no-store");
});
test("session comes only from cookie, forged JSON/header session not trusted", async () => {
  let body: any;
  globalThis.fetch = async (_url, init) => {
    body = JSON.parse(String(init?.body));
    return Response.json({ ok: true, clients: [], reports: [] });
  };
  expect(
    (
      await handler(
        req(
          { action: "archive", session: "forged" },
          "__Host-bluepipe-owner=" + "b".repeat(64),
        ),
      )
    ).status,
  ).toBe(400);
  expect(body).toBeUndefined();
});
test("cross-origin/missing origin rejected before forwarding", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({});
  };
  expect(
    (
      await handler(
        req({ action: "archive" }, undefined, "https://evil.invalid"),
      )
    ).status,
  ).toBe(403);
  expect(calls).toBe(0);
});
test("logout clears cookie only after durable backend confirmation", async () => {
  globalThis.fetch = async () => Response.json({ ok: true });
  const r = await handler(
    req({ action: "logout" }, "__Host-bluepipe-owner=" + "b".repeat(64)),
  );
  expect(r.headers.get("set-cookie")).toContain("Max-Age=0");
  globalThis.fetch = async () =>
    Response.json({ error: "Unavailable" }, { status: 503 });
  expect(
    (await handler(req({ action: "logout" }))).headers.has("set-cookie"),
  ).toBe(false);
});
test("forged forwarded IP never forwarded; public broker has no privileged key", async () => {
  let headers: any;
  globalThis.fetch = async (_url, init) => {
    headers = init?.headers;
    return Response.json({ error: "Access unavailable" }, { status: 401 });
  };
  const r = req({ action: "login", code: "synthetic" });
  r.headers.set("X-Forwarded-For", "1.2.3.4");
  await handler(r);
  expect(headers).toEqual({ "Content-Type": "application/json" });
});

test("null primitives arrays and unknown fields rejected without forwarding", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({});
  };
  for (const body of [
    null,
    1,
    "archive",
    [],
    { action: "archive", slug: "forged" },
    { action: "file", version_id: "bad", format: "html" },
  ])
    expect((await handler(req(body))).status).toBe(400);
  expect(calls).toBe(0);
});
test("unexpected upstream session and error fields never reach browser", async () => {
  globalThis.fetch = async () =>
    Response.json({
      ok: true,
      clients: [],
      reports: [],
      session: "hidden",
      secret: "hidden",
    });
  expect(await (await handler(req({ action: "archive" }))).json()).toEqual({
    ok: true,
    clients: [],
    reports: [],
  });
  globalThis.fetch = async () =>
    Response.json(
      { session: "hidden", error: "private diagnostic" },
      { status: 500 },
    );
  expect(await (await handler(req({ action: "archive" }))).json()).toEqual({
    error: "Unavailable",
  });
  globalThis.fetch = async () => Response.json(null);
  expect((await handler(req({ action: "archive" }))).status).toBe(503);
});
