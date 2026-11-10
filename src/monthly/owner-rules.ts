export type PeriodReport = {
  id: string;
  version: number;
  period_start: string;
  period_end: string;
};
// Bare dates and UTC-midnight SQL dates are calendar labels; other timestamps
// carry real instants and must use the report's America/Chicago timezone.
export function calendarDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) throw new Error("Invalid period");
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value) ||
    /T00:00:00(?:\.0+)?(?:Z|\+00:00)$/.test(value)
  )
    return `${Number(match[2])}/${Number(match[3])}/${match[1]}`;
  return new Date(value).toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
  });
}
export function latestFirst<T extends PeriodReport>(reports: T[]): T[] {
  return [...reports].sort(
    (a, b) =>
      Date.parse(b.period_end) - Date.parse(a.period_end) ||
      Date.parse(b.period_start) - Date.parse(a.period_start) ||
      b.version - a.version ||
      b.id.localeCompare(a.id),
  );
}
export async function verifyFrozenBytes(
  bytes: ArrayBuffer,
  expected: unknown,
): Promise<void> {
  if (typeof expected !== "string" || !/^[a-f0-9]{64}$/.test(expected))
    throw new Error("Missing frozen hash");
  const actual = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (x) => x.toString(16).padStart(2, "0"),
  ).join("");
  if (actual !== expected) throw new Error("Frozen hash mismatch");
}
