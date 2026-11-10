import { describe, it, expect } from "vitest";
import { calendarDate, latestFirst, verifyFrozenBytes } from "./owner-rules";
import { webcrypto } from "node:crypto";
describe("owner frozen report rules", () => {
  it("Oct 5 through Nov 5 inclusive survives UTC midnight and DST", () => {
    expect(calendarDate("2026-10-05T00:00:00Z")).toBe("10/5/2026");
    expect(calendarDate("2026-11-05T00:00:00Z")).toBe("11/5/2026");
    expect(calendarDate("2026-11-05T23:59:59-06:00")).toBe("11/5/2026");
    expect(calendarDate("2026-11-06T05:59:59Z")).toBe("11/5/2026");
    expect(calendarDate("2026-10-05T05:00:00Z")).toBe("10/5/2026");
  });
  it("latest period/version independent of reversed insertion", () => {
    const reports = [
      {
        id: "a",
        version: 1,
        period_start: "2026-10-05",
        period_end: "2026-11-05",
      },
      {
        id: "b",
        version: 2,
        period_start: "2026-10-05",
        period_end: "2026-11-05",
      },
      {
        id: "c",
        version: 1,
        period_start: "2026-11-06",
        period_end: "2026-12-05",
      },
    ];
    expect(latestFirst(reports).map((x) => x.id)).toEqual(["c", "b", "a"]);
    expect(latestFirst([...reports].reverse()).map((x) => x.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });
  it("missing invalid and mismatching hash fail closed; exact hash succeeds", async () => {
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
    });
    const bytes = new TextEncoder().encode("a").buffer;
    for (const hash of [null, undefined, "bad", "0".repeat(64)])
      await expect(verifyFrozenBytes(bytes, hash)).rejects.toThrow();
    await expect(
      verifyFrozenBytes(
        bytes,
        "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      ),
    ).resolves.toBeUndefined();
  });
});
