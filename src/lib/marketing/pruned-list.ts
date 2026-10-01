// Dependency-free on purpose: next.config.ts imports this file, and the config
// loader does not resolve the "@/" path alias.

/**
 * Reversible pruning list (2026-10-01 SEO sprint, see PRUNED.md).
 *
 * GSC showed the programmatic /screenshots-for/* and /alternatives/* families
 * sliding into "Crawled - currently not indexed" (7 -> 30 pages). Pages below
 * the keep threshold are noindexed (X-Robots-Tag via next.config.ts), dropped
 * from sitemap.ts, and filtered out of hubs, footer and sibling rings so the
 * pages we keep do not spend links on pages we have told Google to skip.
 *
 * Keep threshold: never prune a URL with >=1 click in either GSC export or
 * >=10 impressions in the 2026-10-01 export, and never prune vpn-apps,
 * pet-care-apps, music-apps, finance-apps or running-apps.
 *
 * Revert: delete an entry here. That one edit restores the header, the
 * sitemap row and every internal link. Bump the matching REVISED date in
 * sitemap.ts when you do.
 *
 * `gsc.clicks` is clicks in the 2026-10-01 plus July exports combined;
 * `gsc.impressions` is the 2026-10-01 export (2026-06-29 to 2026-09-28).
 */
export type PrunedEntry = {
  path: string;
  action: "noindex" | "redirect";
  /** Required when action is "redirect". */
  target?: string;
  reason: string;
  gsc: { clicks: number; impressions: number };
};

const CATEGORY_REASON =
  "Templated category page below the keep threshold; Google reports the family as crawled, not indexed.";
const COMPETITOR_REASON =
  "Competitor page below the keep threshold; no clicks and no impressions to defend.";

export const PRUNED: readonly PrunedEntry[] = [
  { path: "/screenshots-for/productivity-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/indie-games", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 7 } },
  { path: "/screenshots-for/dev-tools", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/meditation-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 4 } },
  { path: "/screenshots-for/budgeting-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 2 } },
  { path: "/screenshots-for/note-taking-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/language-learning-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/social-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/dating-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 2 } },
  { path: "/screenshots-for/ecommerce-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 1 } },
  { path: "/screenshots-for/ai-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 5 } },
  { path: "/screenshots-for/kids-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/travel-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/food-delivery-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 1 } },
  { path: "/screenshots-for/habit-tracker-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 4 } },
  { path: "/screenshots-for/photo-editing-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 1 } },
  { path: "/screenshots-for/podcast-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/crypto-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/sleep-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/recipe-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 9 } },
  { path: "/screenshots-for/journaling-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 4 } },
  { path: "/screenshots-for/task-management-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 6 } },
  { path: "/screenshots-for/health-tracking-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 4 } },
  { path: "/screenshots-for/real-estate-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 3 } },
  { path: "/screenshots-for/shopping-list-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 3 } },
  { path: "/screenshots-for/parenting-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/scanner-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 2 } },
  { path: "/screenshots-for/language-translation-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 7 } },
  { path: "/screenshots-for/invoicing-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/ar-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/screenshots-for/ebook-reader-apps", action: "noindex", reason: CATEGORY_REASON, gsc: { clicks: 0, impressions: 3 } },
  { path: "/alternatives/screenshots-pro", action: "noindex", reason: COMPETITOR_REASON, gsc: { clicks: 0, impressions: 0 } },
  { path: "/alternatives/rotato", action: "noindex", reason: COMPETITOR_REASON, gsc: { clicks: 0, impressions: 0 } },
];
