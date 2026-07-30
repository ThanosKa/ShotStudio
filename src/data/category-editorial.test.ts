import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/data/categories";
import {
  CATEGORY_CLUSTERS,
  categoriesByDemand,
  categoryAnchor,
  clusterOf,
  relatedCategories,
} from "@/data/category-editorial";

/**
 * `relatedCategories` is the internal-linking backbone of the 40 programmatic
 * category pages, and it looks more complicated than it needs to be. It isn't.
 *
 * The obvious implementation — `CATEGORIES.filter(not-self).slice(0, 6)` — gave
 * every one of the 40 pages the *same* six siblings. That left 33 of them with
 * a single inbound internal link (the hub) and made every related block on the
 * site byte-identical, which is both useless to a reader and a thin-content
 * signal to a crawler.
 *
 * The two-stage design (cluster siblings first, then a rotating ring window to
 * fill) exists to fix exactly that. These tests assert the *properties* that
 * make it worth the complexity, so anyone who later "simplifies" it back to a
 * slice gets a failure explaining why instead of a silent SEO regression.
 */

const LIMIT = 6;

describe("relatedCategories", () => {
  const blocks = new Map(
    CATEGORIES.map((c) => [c.slug, relatedCategories(c.slug, LIMIT)] as const),
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

  /**
   * The regression that motivated the whole function: with `.slice(0, 6)` this
   * was 1 for 33 of 40 categories. The rotating ring currently yields 4–8.
   */
  it("leaves no category with fewer than two inbound sibling links", () => {
    const inbound = new Map(CATEGORIES.map((c) => [c.slug, 0]));
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

  /** Byte-identical blocks across 40 pages are the thin-content signal. */
  it("gives every category a distinct related block", () => {
    const fingerprints = [...blocks.values()].map((related) =>
      related.map((r) => r.slug).join(","),
    );
    expect(new Set(fingerprints).size).toBe(CATEGORIES.length);
  });

  it("puts cluster siblings before ring fillers", () => {
    for (const [slug, related] of blocks) {
      const cluster = clusterOf(slug);
      if (!cluster) continue;
      const inSameCluster = related.map((r) => clusterOf(r.slug)?.id === cluster.id);
      // Once the block leaves the cluster it must not come back to it: all the
      // `true`s are up front.
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
  it("returns every category exactly once when unlimited", () => {
    const all = categoriesByDemand();
    expect(all).toHaveLength(CATEGORIES.length);
    expect(new Set(all.map((c) => c.slug)).size).toBe(CATEGORIES.length);
  });

  it("respects the limit", () => {
    expect(categoriesByDemand(3)).toHaveLength(3);
  });

  /**
   * The ordering is memoised at module load. Callers must not be able to
   * corrupt that shared array for everyone else.
   */
  it("hands out a copy, not the cached ordering", () => {
    const first = categoriesByDemand();
    first.length = 0;
    expect(categoriesByDemand()).toHaveLength(CATEGORIES.length);
  });
});
