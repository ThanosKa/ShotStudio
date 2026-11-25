import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";

function lastModifiedByUrl(): Map<string, string> {
  return new Map(
    sitemap().map((entry) => [entry.url, String(entry.lastModified)]),
  );
}

describe("sitemap lastModified", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not depend on the build time, so a deploy never re-dates every URL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-01-01T08:15:00.000Z"));
    const first = lastModifiedByUrl();
    vi.setSystemTime(new Date("2031-06-30T22:45:00.000Z"));
    const second = lastModifiedByUrl();
    expect(second).toEqual(first);
  });

  it("uses hand-kept content revision dates at midnight UTC", () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified, entry.url).toBeInstanceOf(Date);
      expect(
        entry.lastModified instanceof Date &&
          entry.lastModified.toISOString().endsWith("T00:00:00.000Z"),
        entry.url,
      ).toBe(true);
    }
  });

  it("dates surfaces apart, so Google can trust which page changed", () => {
    expect(new Set(lastModifiedByUrl().values()).size).toBeGreaterThan(1);
  });
});
