// Unprivileged same-origin broker; Cloud independently authorizes every request.
import { z } from "zod";
import { boundedJson } from "../../supabase/functions/_shared/bounded-json";
import {
  ownerInput,
  archiveOutput,
  fileOutput,
  hash,
} from "../lib/owner-contract";
const ENDPOINT =
  "https://zawxlalhmruzijnsdpcu.supabase.co/functions/v1/monthly-code";
const COOKIE = "__Host-bluepipe-owner";
const BASE = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
const cookie = (session: string, age: number) =>
  `${COOKIE}=${session}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
export default async function handler(req: Request) {
  const reply = (
    body: unknown,
    status = 200,
    extra: Record<string, string> = {},
  ) => Response.json(body, { status, headers: { ...BASE, ...extra } });
  if (req.method !== "POST") return reply({ error: "Denied" }, 405);
  if (
    req.headers.get("Origin") !== new URL(req.url).origin ||
    req.headers.get("X-BluePipe-Request") !== "1"
  )
    return reply({ error: "Denied" }, 403);
  let input;
  try {
    input = ownerInput.safeParse(await boundedJson(req));
  } catch {
    return reply({ error: "Denied" }, 400);
  }
  if (!input.success) return reply({ error: "Denied" }, 400);
  const p = input.data;
  const session = req.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1);
  const body = p.action === "login" ? p : { ...p, session: session ?? "" };
  try {
    const upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
    if (!upstream.ok) {
      await upstream.body?.cancel();
      const status = [400, 401, 405, 429, 503].includes(upstream.status)
        ? upstream.status
        : 503;
      return reply(
        { error: status === 401 ? "Access unavailable" : "Unavailable" },
        status,
        status === 401 ? { "Set-Cookie": cookie("", 0) } : {},
      );
    }
    const data = await boundedJson(upstream, 1_000_000);
    if (p.action === "login") {
      const parsed = z
        .object({
          session: hash,
          expires_at: z.string().datetime({ offset: true }),
        })
        .parse(data);
      return reply({ ok: true }, 200, {
        "Set-Cookie": cookie(parsed.session, 2592000),
      });
    }
    if (p.action === "logout") {
      z.object({ ok: z.literal(true) }).parse(data);
      return reply({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }
    return reply(
      p.action === "archive"
        ? archiveOutput.parse(data)
        : fileOutput.parse(data),
    );
  } catch {
    return reply({ error: "Unavailable" }, 503);
  }
}
export const config = { path: "/portal/api/owner" };
