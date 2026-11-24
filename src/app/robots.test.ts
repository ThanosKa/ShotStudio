import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

const NOINDEX_PAGES = ["/home", "/sign-in", "/sign-up"];

describe("robots", () => {
  const rules = [robots().rules].flat();

  it("blocks only the POST-only JSON endpoints under /api/", () => {
    for (const rule of rules) {
      expect([rule.disallow].flat(), String(rule.userAgent)).toEqual(["/api/"]);
    }
  });

  it("never blocks the noindex pages, so crawlers can read their noindex tag", () => {
    for (const rule of rules) {
      const blocked = [rule.disallow].flat();
      for (const page of NOINDEX_PAGES) {
        expect(
          blocked.some((prefix) => prefix && page.startsWith(prefix)),
          `${String(rule.userAgent)} blocks ${page}`,
        ).toBe(false);
      }
    }
  });
});
