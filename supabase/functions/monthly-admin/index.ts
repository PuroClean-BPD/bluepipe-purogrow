import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { type Deps, provisionOwner, stageVersion } from "./core.ts";

// Admin-only monthly portal operations. Caller must be a real signed-in monthly_staff admin.
// All DB mutations go through audited RPCs under the caller's own JWT (mutation + audit atomic).
// The service credential is used only for private storage I/O and Auth Admin createUser.
const BUCKET = "reports-private";
const uuid = z.string().uuid();
const b64 = z
  .string()
  .min(4)
  .max(42_000_000)
  .regex(/^[A-Za-z0-9+/]+={0,2}$/);
const hex = z.string().regex(/^[a-f0-9]{64}$/);
const Action = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("stage_owner_verifier"),
      selector: z.string().regex(/^[a-f0-9]{32}$/),
      salt: z.string().regex(/^[a-f0-9]{32}$/),
      verifier: hex,
      client_ids: z.array(uuid).min(1).max(3),
    })
    .strict(),
  z
    .object({
      action: z.literal("create_org"),
      name: z.string().trim().min(2).max(120),
    })
    .strict(),
  z
    .object({
      action: z.literal("create_client"),
      org_id: uuid,
      slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}$/),
      display_name: z.string().trim().min(2).max(160),
      package: z.string().trim().max(80).nullable().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal("create_report"),
      client_id: uuid,
      period_start: z.string().datetime({ offset: true }),
      period_end: z.string().datetime({ offset: true }),
      period_label: z.string().trim().min(3).max(80),
      kind: z.enum(["monthly", "special"]),
    })
    .strict(),
  z
    .object({
      action: z.literal("stage_version"),
      request_id: uuid,
      report_id: uuid,
      html_b64: b64,
      pdf_b64: b64,
      content_b64: b64,
      expected: z
        .object({ html_sha256: hex, pdf_sha256: hex, content_sha256: hex })
        .strict(),
      notes: z.string().max(500).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal("provision_owner"),
      request_id: uuid,
      email: z.string().email().max(254),
      full_name: z.string().trim().max(120).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal("grant"),
      user_id: uuid,
      client_id: uuid,
      role: z.enum(["client_viewer", "client_manager"]),
      grant_source: z.string().trim().min(3).max(200),
    })
    .strict(),
  z.object({ action: z.literal("revoke"), membership_id: uuid }).strict(),
  z
    .object({
      action: z.literal("transition"),
      version_id: uuid,
      next_state: z.enum(["approved", "published", "withdrawn"]),
    })
    .strict(),
]);
const decode = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

Deno.serve(async (req) => {
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer "))
    return reply({ error: "Unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL"),
    key = Deno.env.get("SUPABASE_ANON_KEY"),
    service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key || !service) return reply({ error: "Unavailable" }, 503);
  const caller = createClient(url, key, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: u, error: ue } = await caller.auth.getUser(auth.slice(7));
  if (ue || !u.user) return reply({ error: "Unauthorized" }, 401);
  // Early gate only; every RPC re-checks admin role from auth.uid() in the database.
  const { data: role } = await caller.rpc("monthly_staff_role");
  if (role !== "admin") return reply({ error: "Forbidden" }, 403);

  let p;
  try {
    p = Action.safeParse(await req.json());
  } catch {
    return reply({ error: "Invalid request" }, 400);
  }
  if (!p.success)
    return reply(
      { error: "Invalid request", fields: p.error.flatten().fieldErrors },
      400,
    );
  const a = p.data;
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const store = admin.storage.from(BUCKET);
  const deps: Deps = {
    rpc: async (fn, args) => {
      const r = await caller.rpc(fn, args);
      return { data: r.data, error: r.error };
    },
    upload: async (path, bytes, mime) => {
      const { error } = await store.upload(path, bytes, {
        contentType: mime,
        upsert: false,
      });
      const exists =
        !!error &&
        /exists|duplicate/i.test(
          String((error as { message?: string }).message ?? ""),
        );
      return { error, exists };
    },
    download: async (path) => {
      const { data } = await store.download(path);
      return data ? new Uint8Array(await data.arrayBuffer()) : null;
    },
    createUser: async (email, meta) => {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: meta,
      });
      if (data?.user) return { id: data.user.id };
      return {
        error,
        exists: /already|registered|exists/i.test(String(error?.message ?? "")),
      };
    },
    findUserId: async (email) => {
      for (let page = 1; page <= 20; page++) {
        const { data } = await admin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        const hit = data?.users.find((x) => x.email?.toLowerCase() === email);
        if (hit) return hit.id;
        if (!data || data.users.length < 1000) return null;
      }
      return null;
    },
  };
  const rpcOut = async (
    fn: string,
    args: Record<string, unknown>,
    key: string,
  ) => {
    const { data, error } = await caller.rpc(fn, args);
    return error
      ? reply({ error: "Rejected" }, 403)
      : reply({ [key]: data ?? true });
  };

  switch (a.action) {
    case "stage_owner_verifier":
      return rpcOut(
        "monthly_code_manage",
        {
          p_action: "create_real_staged",
          p_selector: a.selector,
          p_salt: a.salt,
          p_verifier: a.verifier,
          p_clients: a.client_ids,
        },
        "id",
      );
    case "create_org":
      return rpcOut("monthly_admin_create_org", { p_name: a.name }, "id");
    case "create_client":
      return rpcOut(
        "monthly_admin_create_client",
        {
          p_org: a.org_id,
          p_slug: a.slug,
          p_display: a.display_name,
          p_package: a.package ?? null,
        },
        "id",
      );
    case "create_report":
      return rpcOut(
        "monthly_admin_create_report",
        {
          p_client: a.client_id,
          p_start: a.period_start,
          p_end: a.period_end,
          p_label: a.period_label,
          p_kind: a.kind,
        },
        "id",
      );
    case "grant":
      return rpcOut(
        "monthly_grant",
        {
          uid: a.user_id,
          cid: a.client_id,
          mrole: a.role,
          source: a.grant_source,
        },
        "membership_id",
      );
    case "revoke":
      return rpcOut("monthly_revoke", { mid: a.membership_id }, "ok");
    case "transition":
      return rpcOut(
        "monthly_transition",
        { vid: a.version_id, next_state: a.next_state },
        "ok",
      );
    case "stage_version": {
      const o = await stageVersion(deps, {
        request_id: a.request_id,
        report_id: a.report_id,
        files: {
          html: decode(a.html_b64),
          pdf: decode(a.pdf_b64),
          content: decode(a.content_b64),
        },
        expected: {
          html: a.expected.html_sha256,
          pdf: a.expected.pdf_sha256,
          content: a.expected.content_sha256,
        },
        notes: a.notes,
      });
      return reply(o.body, o.status);
    }
    case "provision_owner": {
      const o = await provisionOwner(deps, {
        request_id: a.request_id,
        email: a.email,
        full_name: a.full_name,
      });
      return reply(o.body, o.status);
    }
  }
});
