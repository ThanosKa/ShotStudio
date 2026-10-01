import { CATEGORIES, type Category } from "@/data/categories";
import { COMPETITORS, type Competitor } from "@/data/competitors";
import { PRUNED } from "@/lib/marketing/pruned-list";

export { PRUNED, type PrunedEntry } from "@/lib/marketing/pruned-list";

const PRUNED_PATHS: ReadonlySet<string> = new Set(PRUNED.map((p) => p.path));

export function isPrunedPath(path: string): boolean {
  return PRUNED_PATHS.has(path);
}

export function isCategoryPruned(slug: string): boolean {
  return isPrunedPath(`/screenshots-for/${slug}`);
}

export function isCompetitorPruned(slug: string): boolean {
  return isPrunedPath(`/alternatives/${slug}`);
}

/** Categories we still index and link to. */
export function indexableCategories(): Category[] {
  return CATEGORIES.filter((c) => !isCategoryPruned(c.slug));
}

/** Competitors we still index and link to. */
export function indexableCompetitors(): Competitor[] {
  return COMPETITORS.filter((c) => !isCompetitorPruned(c.slug));
}
