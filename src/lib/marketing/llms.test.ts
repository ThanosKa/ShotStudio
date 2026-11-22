import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import { CREDIT_PACKAGE_LIST } from "@/lib/packages";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function read(name: string): string {
  return fs.readFileSync(path.join(PUBLIC_DIR, name), "utf8");
}

const llms = read("llms.txt");
const llmsFull = read("llms-full.txt");
const pricingMd = read("pricing.md");

function priceLabel(cents: number): string {
  return `$${cents / 100}`;
}

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
      const row = new RegExp(
        `\\|\\s*${name}\\s*\\|\\s*\\${priceLabel(priceCents)}\\s*\\|\\s*${credits}\\s*\\|\\s*${imageCount(credits)}\\s*\\|`,
      );
      expect(llmsFull).toMatch(row);
    },
  );

  it.each(CREDIT_PACKAGE_LIST)(
    "pricing.md's $name section is correct",
    ({ name, priceCents, credits }) => {
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

describe("agent-facing fact files match the upload rules", () => {
  it.each([
    ["llms.txt", llms],
    ["llms-full.txt", llmsFull],
    ["pricing.md", pricingMd],
  ])("%s never promises a 10 MB upload limit", (_name, text) => {
    expect(text).not.toMatch(/10\s*mb/i);
  });
});

describe("llms.txt stays in sync with the data modules", () => {
  it("links every competitor page", () => {
    for (const { slug } of COMPETITORS) {
      expect(llms).toContain(`/alternatives/${slug}`);
    }
  });
});
