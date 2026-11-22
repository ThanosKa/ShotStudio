import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/data/categories";
import { indexableCategories, isCategoryPruned } from "@/lib/marketing/pruned";
import {
  CATEGORY_CLUSTERS,
  categoriesByDemand,
  categoryAnchor,
  clusterOf,
  relatedCategories,
} from "@/data/category-editorial";

const LIMIT = 6;

describe("relatedCategories", () => {
  const blocks = new Map(
    CATEGORIES.map((c) => [c.slug, relatedCategories({ slug: c.slug, limit: LIMIT })] as const),
  );

  it("always returns the requested number of siblings", () => {
    for (const [slug, related] of blocks) {
      expect(related, slug).toHaveLength(LIMIT);
    }
  });

  it("never links a page to itself", () => {
    for (const [slug, related] of blocks) {
      expect(related.map((r) => r.slug), slug).not.toContain(slug);
    }
  });

  it("never repeats a sibling within one block", () => {
    for (const [slug, related] of blocks) {
      const slugs = related.map((r) => r.slug);
      expect(new Set(slugs).size, slug).toBe(slugs.length);
    }
  });

  it("leaves no indexable category with fewer than two inbound sibling links", () => {
    const inbound = new Map(indexableCategories().map((c) => [c.slug, 0]));
    for (const related of blocks.values()) {
      for (const r of related) {
        inbound.set(r.slug, (inbound.get(r.slug) ?? 0) + 1);
      }
    }
    const starved = [...inbound]
      .filter(([, n]) => n < 2)
      .map(([slug, n]) => `${slug}: ${n}`);
    expect(starved).toEqual([]);
  });

  it("gives every indexable category a distinct related block", () => {
    const fingerprints = indexableCategories().map((c) =>
      (blocks.get(c.slug) ?? []).map((r) => r.slug).join(","),
    );
    expect(new Set(fingerprints).size).toBe(indexableCategories().length);
  });

  it("never links a pruned (noindex) category from any block", () => {
    for (const [slug, related] of blocks) {
      for (const r of related) {
        expect(isCategoryPruned(r.slug), `${slug} -> ${r.slug}`).toBe(false);
      }
    }
  });

  it("puts cluster siblings before ring fillers", () => {
    for (const [slug, related] of blocks) {
      const cluster = clusterOf(slug);
      if (!cluster) continue;
      const inSameCluster = related.map((r) => clusterOf(r.slug)?.id === cluster.id);
      const firstOutsider = inSameCluster.indexOf(false);
      if (firstOutsider === -1) continue;
      expect(inSameCluster.slice(firstOutsider), slug).not.toContain(true);
    }
  });
});

describe("category editorial data", () => {
  it("covers every category", () => {
    for (const category of CATEGORIES) {
      expect(clusterOf(category.slug), category.slug).toBeDefined();
    }
  });

  it("assigns every category to a declared cluster", () => {
    const ids = new Set(CATEGORY_CLUSTERS.map((c) => c.id));
    for (const category of CATEGORIES) {
      expect(ids, category.slug).toContain(clusterOf(category.slug)!.id);
    }
  });

  it("gives every category non-empty anchor text", () => {
    for (const category of CATEGORIES) {
      expect(categoryAnchor(category).trim(), category.slug).not.toBe("");
    }
  });
});

describe("categoriesByDemand", () => {
  it("returns every indexable category exactly once when unlimited", () => {
    const all = categoriesByDemand();
    const kept = indexableCategories();
    expect(all).toHaveLength(kept.length);
    expect(new Set(all.map((c) => c.slug)).size).toBe(kept.length);
    expect(all.some((c) => isCategoryPruned(c.slug))).toBe(false);
  });

  it("respects the limit", () => {
    expect(categoriesByDemand(3)).toHaveLength(3);
  });

  it("hands out a copy, not the cached ordering", () => {
    const first = categoriesByDemand();
    first.length = 0;
    expect(categoriesByDemand()).toHaveLength(indexableCategories().length);
  });
});
