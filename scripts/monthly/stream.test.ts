import { test, expect } from "bun:test";
import { boundedJson } from "../../supabase/functions/_shared/bounded-json";
import handler from "../../netlify/functions/monthly-owner.mts";
test("bounded reader cancels oversized chunked stream before reading tail", async () => {
  let cancelled = false,
    reads = 0;
  const stream = new ReadableStream({
    pull(c) {
      reads++;
      c.enqueue(new Uint8Array(1024));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request("https://example.invalid", {
    method: "POST",
    body: stream,
    duplex: "half",
  } as RequestInit);
  await expect(boundedJson(request)).rejects.toThrow("Body limit");
  expect(cancelled).toBe(true);
  expect(reads).toBeLessThan(6);
});
test("declared oversized request and invalid UTF8 reject", async () => {
  await expect(
    boundedJson(
      new Request("https://example.invalid", {
        method: "POST",
        headers: { "Content-Length": "9999" },
        body: "{}",
      }),
    ),
  ).rejects.toThrow();
  await expect(
    boundedJson(
      new Request("https://example.invalid", {
        method: "POST",
        body: new Uint8Array([255]),
      }),
    ),
  ).rejects.toThrow();
});
test("broker rejects oversized chunked JSON", async () => {
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(
        new TextEncoder().encode(
          JSON.stringify({ action: "login", code: "a".repeat(4096) }),
        ),
      );
      c.close();
    },
  });
  const r = await handler(
    new Request("https://example.invalid/portal/api/owner", {
      method: "POST",
      headers: { Origin: "https://example.invalid", "X-BluePipe-Request": "1" },
      body: stream,
      duplex: "half",
    } as RequestInit),
  );
  expect(r.status).toBe(400);
});
