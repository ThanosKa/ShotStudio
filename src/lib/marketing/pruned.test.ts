import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import sitemap from "@/app/sitemap";
import {
  PRUNED,
  indexableCategories,
  indexableCompetitors,
  isPrunedPath,
} from "@/lib/marketing/pruned";

type GscRow = { clicks: number; impressions: number };

/** Parse a GSC "Top pages" export into pathname -> clicks and impressions. */
function readGsc(file: string): Map<string, GscRow> {
  const rows = new Map<string, GscRow>();
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/).slice(1)) {
    const [url, clicks, impressions] = line.split(",");
    if (!url || !url.startsWith("http")) continue;
    rows.set(new URL(url).pathname, {
      clicks: Number(clicks),
      impressions: Number(impressions),
    });
  }
  return rows;
}

const NEVER_PRUNE = [
  "vpn-apps",
  "pet-care-apps",
  "music-apps",
  "finance-apps",
  "running-apps",
];

describe("PRUNED", () => {
  it("only lists real category and competitor pages", () => {
    const real = new Set([
      ...CATEGORIES.map((c) => `/screenshots-for/${c.slug}`),
      ...COMPETITORS.map((c) => `/alternatives/${c.slug}`),
    ]);
    for (const entry of PRUNED) {
      expect(real.has(entry.path), entry.path).toBe(true);
    }
  });

  it("has no duplicates and gives every redirect a target", () => {
    expect(new Set(PRUNED.map((p) => p.path)).size).toBe(PRUNED.length);
    for (const entry of PRUNED) {
      if (entry.action === "redirect") {
        expect(entry.target, entry.path).toBeTruthy();
      }
    }
  });

  it("never prunes the protected categories", () => {
    for (const slug of NEVER_PRUNE) {
      expect(isPrunedPath(`/screenshots-for/${slug}`), slug).toBe(false);
    }
  });

  it("records numbers below the keep thresholds for every entry", () => {
    for (const entry of PRUNED) {
      expect(entry.gsc.clicks, entry.path).toBe(0);
      expect(entry.gsc.impressions, entry.path).toBeLessThan(10);
    }
  });

  it("splits categories and competitors into kept and pruned", () => {
    const prunedCategories = PRUNED.filter((p) =>
      p.path.startsWith("/screenshots-for/"),
    );
    const prunedCompetitors = PRUNED.filter((p) =>
      p.path.startsWith("/alternatives/"),
    );
    expect(indexableCategories()).toHaveLength(
      CATEGORIES.length - prunedCategories.length,
    );
    expect(indexableCompetitors()).toHaveLength(
      COMPETITORS.length - prunedCompetitors.length,
    );
  });
});

describe("sitemap", () => {
  const urls = sitemap().map((e) => new URL(e.url).pathname);

  it("omits every pruned page", () => {
    for (const entry of PRUNED) {
      expect(urls, entry.path).not.toContain(entry.path);
    }
  });

  it("keeps every indexable category and competitor", () => {
    for (const c of indexableCategories()) {
      expect(urls).toContain(`/screenshots-for/${c.slug}`);
    }
    for (const c of indexableCompetitors()) {
      expect(urls).toContain(`/alternatives/${c.slug}`);
    }
  });
});

/**
 * Keep-threshold guard against the raw GSC exports. They live outside the repo
 * (in the sibling _traffic-audit folder), so this is skipped when absent.
 */
const AUDIT = path.resolve(__dirname, "../../../../_traffic-audit");
const CURRENT = path.join(
  AUDIT,
  "gsc-2026-10-01/shotstudio/performance/Pages.csv",
);
const JULY = path.join(AUDIT, "shotstudio/gsc/Pages.csv");

describe.skipIf(!fs.existsSync(CURRENT) || !fs.existsSync(JULY))(
  "PRUNED against the raw GSC exports",
  () => {
    it("never prunes a URL with a click or with >=10 current impressions", () => {
      const current = readGsc(CURRENT);
      const july = readGsc(JULY);
      const empty: GscRow = { clicks: 0, impressions: 0 };
      for (const entry of PRUNED) {
        const now = current.get(entry.path) ?? empty;
        const then = july.get(entry.path) ?? empty;
        expect(now.clicks + then.clicks, entry.path).toBe(0);
        expect(now.impressions, entry.path).toBeLessThan(10);
      }
    });
  },
);
