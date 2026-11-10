import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
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
  const client = createClient(url, key, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: user, error: authError } = await client.auth.getUser(
    auth.slice(7),
  );
  if (authError || !user.user) return reply({ error: "Unauthorized" }, 401);
  const { data: staff, error: staffError } =
    await client.rpc("monthly_staff_role");
  if (staffError || !["admin", "approver", "editor"].includes(staff ?? ""))
    return reply({ error: "Forbidden" }, 403);
  let input;
  try {
    input = z
      .object({
        version_id: z.string().uuid(),
        format: z.enum(["html", "pdf"]),
      })
      .strict()
      .safeParse(await req.json());
  } catch {
    return reply({ error: "Invalid request" }, 400);
  }
  if (!input.success) return reply({ error: "Invalid request" }, 400);
  // Read through the caller's RLS. No client IDs, slugs, paths, or staff claims from input.
  const { data: v, error } = await client
    .from("monthly_report_versions")
    .select("id,report_id,html_path,pdf_path,state")
    .eq("id", input.data.version_id)
    .maybeSingle();
  if (error || !v) return reply({ error: "Forbidden" }, 403);
  const { data: r } = await client
    .from("monthly_reports")
    .select("client_id")
    .eq("id", v.report_id)
    .maybeSingle();
  if (!r) return reply({ error: "Forbidden" }, 403);
  const path = input.data.format === "pdf" ? v.pdf_path : v.html_path;
  if (!path.startsWith("monthly/") || path.includes(".."))
    return reply({ error: "Forbidden" }, 403);
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: signed, error: signError } = await admin.storage
    .from("reports-private")
    .createSignedUrl(path, 60, {
      download: `BluePipe-Monthly-Report.${input.data.format}`,
    });
  if (signError || !signed) return reply({ error: "Unavailable" }, 503);
  const { error: logError } = await admin
    .from("monthly_audit_log")
    .insert({
      actor: user.user.id,
      action: "file_issued",
      target_table: "monthly_report_versions",
      target_id: v.id,
      client_id: r.client_id,
      detail: { format: input.data.format, expires_in: 60 },
    });
  if (logError) return reply({ error: "Unavailable" }, 503);
  return reply({ url: signed.signedUrl, expires_in: 60 });
});
