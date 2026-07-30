import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import { CREDIT_PACKAGE_LIST } from "@/lib/packages";

/**
 * Drift guard for the hand-written, agent-facing fact files.
 *
 * `public/llms.txt`, `public/llms-full.txt` and `public/pricing.md` restate
 * facts that also live in `packages.ts`, `categories.ts` and `competitors.ts`.
 * Only about a third of `llms-full.txt` is mechanically derivable; the rest is
 * authored prose with no home in a data module, which is why these files are
 * written by hand rather than generated at build time (see
 * reports/06-code-quality.md for that decision and its reasoning).
 *
 * Hand-written means they go stale silently — and these are exactly the files
 * an LLM quotes verbatim, so a stale price here becomes a wrong price in
 * somebody's answer. Three copies of the price list against one source of truth
 * is how a product ends up with mutually incompatible answers to "what does it
 * cost?".
 *
 * These assertions turn that silent drift into a failing `pnpm test`: change a
 * pack price, add a category, or reword a competitor FAQ, and the file that
 * still says otherwise fails here rather than in production.
 *
 * This can only check the derivable facts. It cannot check the prose.
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");

function read(name: string): string {
  return fs.readFileSync(path.join(PUBLIC_DIR, name), "utf8");
}

const llms = read("llms.txt");
const llmsFull = read("llms-full.txt");
const pricingMd = read("pricing.md");

/** "$7", "$17" — the form all three files use for ShotStudio's own packs. */
function priceLabel(cents: number): string {
  return `$${cents / 100}`;
}

/** Every pack sells `credits` sets of three images. */
function imageCount(credits: number): number {
  return credits * 3;
}

describe("pricing facts stay in sync with packages.ts", () => {
  it.each(CREDIT_PACKAGE_LIST)(
    "llms.txt states $name correctly",
    ({ name, priceCents, credits }) => {
      expect(llms).toContain(
        `${name} — ${priceLabel(priceCents)} USD for ${credits} generation sets`,
      );
    },
  );

  it.each(CREDIT_PACKAGE_LIST)(
    "llms-full.txt's pricing table row for $name is correct",
    ({ name, priceCents, credits }) => {
      // | Starter | $7 | 2 | 6 | $3.50 |
      const row = new RegExp(
        `\\|\\s*${name}\\s*\\|\\s*\\${priceLabel(priceCents)}\\s*\\|\\s*${credits}\\s*\\|\\s*${imageCount(credits)}\\s*\\|`,
      );
      expect(llmsFull).toMatch(row);
    },
  );

  it.each(CREDIT_PACKAGE_LIST)(
    "pricing.md's $name section is correct",
    ({ name, priceCents, credits }) => {
      // Headings may carry a suffix, e.g. "## Growth (most chosen)".
      const section = pricingMd.split(/^## /m).find((s) => s.startsWith(name));
      expect(section, `no "## ${name}" section in pricing.md`).toBeDefined();
      expect(section).toContain(`Price: ${priceLabel(priceCents)} USD`);
      expect(section).toContain(
        `${credits} generation sets (${imageCount(credits)} images)`,
      );
    },
  );

  it("advertises no pack that packages.ts no longer sells", () => {
    const live = CREDIT_PACKAGE_LIST.map((p) => p.name);
    const retired = ["Solo", "Indie", "Pro", "Team", "Free", "Basic"].filter(
      (name) => !live.includes(name),
    );
    for (const [file, text] of [
      ["llms.txt", llms],
      ["llms-full.txt", llmsFull],
      ["pricing.md", pricingMd],
    ] as const) {
      for (const name of retired) {
        expect(
          new RegExp(`^##+ ${name}\\b|^- ${name} —|^\\|\\s*${name}\\s*\\|`, "m").test(
            text,
          ),
          `${file} still advertises a "${name}" pack`,
        ).toBe(false);
      }
    }
  });
});

describe("llms-full.txt stays in sync with the data modules", () => {
  it("lists exactly the current category slugs, in order", () => {
    const line = llmsFull.split("\n").find((l) => l.startsWith("fitness-apps,"));
    expect(line, "category slug list not found").toBeDefined();
    expect(line!.split(",").map((s) => s.trim())).toEqual(
      CATEGORIES.map((c) => c.slug),
    );
  });

  it("states the correct category count", () => {
    expect(llmsFull).toContain(`The ${CATEGORIES.length} categories are:`);
  });

  it("reproduces every competitor FAQ question and answer verbatim", () => {
    const missing: string[] = [];
    for (const competitor of COMPETITORS) {
      for (const { q, a } of competitor.faq) {
        if (!llmsFull.includes(q)) missing.push(`${competitor.slug} Q: ${q}`);
        if (!llmsFull.includes(a)) {
          missing.push(`${competitor.slug} A: ${a.slice(0, 70)}…`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("links every competitor page", () => {
    for (const { slug } of COMPETITORS) {
      expect(llmsFull).toContain(`/alternatives/${slug}`);
    }
  });
});

describe("llms.txt stays in sync with the data modules", () => {
  it("links every competitor page", () => {
    for (const { slug } of COMPETITORS) {
      expect(llms).toContain(`/alternatives/${slug}`);
    }
  });
});
