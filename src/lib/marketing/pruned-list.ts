export type PrunedEntry = {
  path: string;
  action: "noindex" | "redirect";
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
