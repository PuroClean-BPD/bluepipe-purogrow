import { z } from "zod";
export const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const ownerInput = z.discriminatedUnion("action", [
  z.object({ action: z.literal("login"), code: z.string().max(100) }).strict(),
  z.object({ action: z.enum(["archive", "logout"]) }).strict(),
  z
    .object({
      action: z.literal("file"),
      version_id: z.string().uuid(),
      format: z.enum(["html", "pdf", "content"]),
    })
    .strict(),
]);
// Strip unexpected fields at every level. Never pass through upstream JSON.
export const archiveOutput = z.object({
  ok: z.literal(true),
  clients: z.array(
    z.object({
      id: z.string().uuid(),
      display_name: z.string(),
      slug: z.string(),
      package: z.string().nullable(),
    }),
  ),
  reports: z.array(
    z.object({
      id: z.string().uuid(),
      report_id: z.string().uuid(),
      client_id: z.string().uuid(),
      version: z.number().int().positive(),
      period_label: z.string(),
      period_start: z.string(),
      period_end: z.string(),
      dataset_sha256: hash,
    }),
  ),
});
export const fileOutput = z.object({
  url: z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === "https:"),
  sha256: hash,
  expires_in: z.literal(60),
});
