import { CATEGORIES, type Category } from "@/data/categories";

/**
 * Editorial + internal-linking layer over `categories.ts`.
 *
 * `categories.ts` holds the page body data (lead, dos/donts, FAQ). This file
 * holds the things the *linking* layer needs:
 *
 * - `cluster`   — which sibling group a category belongs to, so related-links
 *                 blocks point at genuinely adjacent verticals instead of
 *                 whatever happens to sit first in the array.
 * - `anchor`    — the real search phrase people type ("fitness app
 *                 screenshots"). Every internal link to a category page uses
 *                 this as anchor text. Never "learn more".
 * - `headlineExamples` — three App Store headline patterns that work in this
 *                 vertical. Rendered on the category page as unique on-page
 *                 substance, not metadata.
 */

export const CATEGORY_CLUSTER_IDS = [
  "health",
  "money",
  "work",
  "tech",
  "social",
  "media",
  "learn",
  "life",
] as const;

export type CategoryClusterId = (typeof CATEGORY_CLUSTER_IDS)[number];

export type CategoryCluster = {
  id: CategoryClusterId;
  label: string;
  /** One line describing what the whole cluster has to solve in the carousel. */
  blurb: string;
};

export const CATEGORY_CLUSTERS: CategoryCluster[] = [
  {
    id: "health",
    label: "Health & fitness apps",
    blurb:
      "Screenshots have to sell momentum — a streak, a chart climbing, a body in motion — before anyone reads a word.",
  },
  {
    id: "money",
    label: "Money & finance apps",
    blurb:
      "One number, large, with one piece of context. Everything else in the shot whispers.",
  },
  {
    id: "work",
    label: "Work & productivity apps",
    blurb:
      "The most crowded corner of the App Store. Specific beats comprehensive, every time.",
  },
  {
    id: "tech",
    label: "Developer, AI & utility apps",
    blurb:
      "Sold to sceptics. Real-looking UI and one concrete capability per shot; marketing language is instant tune-out.",
  },
  {
    id: "social",
    label: "Social, dating & family apps",
    blurb:
      "People-first shots. The screenshot has to show the moment the app creates between humans, not the feature list.",
  },
  {
    id: "media",
    label: "Creative, media & game apps",
    blurb:
      "Art-forward categories where the hero shot has to land the vibe at thumbnail size.",
  },
  {
    id: "learn",
    label: "Learning & language apps",
    blurb:
      "Show progress and a concrete outcome — a lesson finished, a phrase understood, a level cleared.",
  },
  {
    id: "life",
    label: "Everyday life apps",
    blurb:
      "Low-consideration downloads decided in two seconds. One obvious daily use, rendered plainly.",
  },
];

export type CategoryEditorial = {
  cluster: CategoryClusterId;
  /** Real query phrase. Used verbatim as internal-link anchor text. */
  anchor: string;
  /** Three example App Store headlines that work in this vertical. */
  headlineExamples: [string, string, string];
};

export const CATEGORY_EDITORIAL: Record<string, CategoryEditorial> = {
  "fitness-apps": {
    cluster: "health",
    anchor: "fitness app screenshots",
    headlineExamples: [
      "Run your first 5K in 8 weeks",
      "Every workout, one tap away",
      "Streaks that survive a bad week",
    ],
  },
  "running-apps": {
    cluster: "health",
    anchor: "running app screenshots",
    headlineExamples: [
      "Your next run, already planned",
      "Negative splits, on purpose",
      "Couch to 10K, week by week",
    ],
  },
  "health-tracking-apps": {
    cluster: "health",
    anchor: "health tracking app screenshots",
    headlineExamples: [
      "Every number in one place",
      "Spot the trend before your doctor does",
      "Six months of health, one screen",
    ],
  },
  "sleep-apps": {
    cluster: "health",
    anchor: "sleep app screenshots",
    headlineExamples: [
      "Fall asleep 20 minutes faster",
      "Wake up before your alarm",
      "Last night, explained",
    ],
  },
  "meditation-apps": {
    cluster: "health",
    anchor: "meditation app screenshots",
    headlineExamples: [
      "Five quiet minutes, every morning",
      "Anxiety, down to a whisper",
      "Breathe before the day starts",
    ],
  },
  "habit-tracker-apps": {
    cluster: "health",
    anchor: "habit tracker app screenshots",
    headlineExamples: [
      "Day 47 and still going",
      "One habit. Every day. No guilt.",
      "Miss a day, keep the streak",
    ],
  },

  "finance-apps": {
    cluster: "money",
    anchor: "finance app screenshots",
    headlineExamples: [
      "Every account, one balance",
      "+$1,240 vs last month",
      "Know your net worth by Friday",
    ],
  },
  "budgeting-apps": {
    cluster: "money",
    anchor: "budgeting app screenshots",
    headlineExamples: [
      "$300 left until payday",
      "Every subscription you forgot",
      "A budget that survives real life",
    ],
  },
  "crypto-apps": {
    cluster: "money",
    anchor: "crypto app screenshots",
    headlineExamples: [
      "Your whole portfolio, one screen",
      "Cost basis, calculated for you",
      "Every wallet, one balance",
    ],
  },
  "invoicing-apps": {
    cluster: "money",
    anchor: "invoicing app screenshots",
    headlineExamples: [
      "Invoice sent in 30 seconds",
      "Get paid before the 30th",
      "Chase overdue invoices automatically",
    ],
  },
  "real-estate-apps": {
    cluster: "money",
    anchor: "real estate app screenshots",
    headlineExamples: [
      "New listings, an hour early",
      "Every listing on your commute",
      "See the price history first",
    ],
  },
  "ecommerce-apps": {
    cluster: "money",
    anchor: "ecommerce app screenshots",
    headlineExamples: [
      "Checkout in two taps",
      "Your cart, on every device",
      "Track every order in one place",
    ],
  },

  "productivity-apps": {
    cluster: "work",
    anchor: "productivity app screenshots",
    headlineExamples: [
      "Plan tomorrow in 90 seconds",
      "One list. Nothing else.",
      "Sunday review, done by 9am",
    ],
  },
  "task-management-apps": {
    cluster: "work",
    anchor: "task manager app screenshots",
    headlineExamples: [
      "Capture it before you forget",
      "Today's three things",
      "Every project, one inbox",
    ],
  },
  "note-taking-apps": {
    cluster: "work",
    anchor: "note taking app screenshots",
    headlineExamples: [
      "Write now, organise never",
      "Find any note in one search",
      "Your second brain, offline",
    ],
  },
  "journaling-apps": {
    cluster: "work",
    anchor: "journal app screenshots",
    headlineExamples: [
      "Two lines a day is enough",
      "A year of entries, one scroll",
      "Private by default. Always.",
    ],
  },
  "scanner-apps": {
    cluster: "work",
    anchor: "scanner app screenshots",
    headlineExamples: [
      "Paper to PDF in one tap",
      "Scan the receipt, bin the paper",
      "Sharp scans, no shadows",
    ],
  },
  "shopping-list-apps": {
    cluster: "work",
    anchor: "shopping list app screenshots",
    headlineExamples: [
      "The list your partner can edit",
      "Sorted by aisle automatically",
      "Never buy milk twice",
    ],
  },

  "dev-tools": {
    cluster: "tech",
    anchor: "developer tool screenshots",
    headlineExamples: [
      "Postgres queries that read themselves",
      "Ship a hotfix from your phone",
      "Every log, searchable in milliseconds",
    ],
  },
  "ai-apps": {
    cluster: "tech",
    anchor: "AI app screenshots",
    headlineExamples: [
      "Ask once, done in seconds",
      "Runs on-device. Nothing uploaded.",
      "The assistant that reads your files",
    ],
  },
  "ai-chatbot-apps": {
    cluster: "tech",
    anchor: "AI chatbot app screenshots",
    headlineExamples: [
      "A chat that remembers",
      "Answers with sources attached",
      "Every model, one keyboard",
    ],
  },
  "ar-apps": {
    cluster: "tech",
    anchor: "AR app screenshots",
    headlineExamples: [
      "Point your camera. See it in place.",
      "Measure a room in 10 seconds",
      "Try it before you buy it",
    ],
  },
  "vpn-apps": {
    cluster: "tech",
    anchor: "VPN app screenshots",
    headlineExamples: [
      "One tap. Nothing logged.",
      "Fast enough to forget it's on",
      "Your traffic, nobody's business",
    ],
  },

  "social-apps": {
    cluster: "social",
    anchor: "social app screenshots",
    headlineExamples: [
      "The group chat that stays fun",
      "No ads. No algorithm.",
      "Find your people in one tap",
    ],
  },
  "dating-apps": {
    cluster: "social",
    anchor: "dating app screenshots",
    headlineExamples: [
      "Five matches, chosen daily",
      "Conversations, not swipes",
      "Meet in person by Friday",
    ],
  },
  "parenting-apps": {
    cluster: "social",
    anchor: "parenting app screenshots",
    headlineExamples: [
      "Both parents, one schedule",
      "Every milestone, remembered",
      "Sleep logs that finally make sense",
    ],
  },
  "kids-apps": {
    cluster: "social",
    anchor: "kids app screenshots",
    headlineExamples: [
      "Learning that feels like play",
      "Safe by design. No ads, ever.",
      "20 minutes a day, parent-approved",
    ],
  },
  "pet-care-apps": {
    cluster: "social",
    anchor: "pet app screenshots",
    headlineExamples: [
      "Every vet visit, remembered",
      "Feeding, walks, meds — logged",
      "Your dog's whole life, one app",
    ],
  },

  "photo-editing-apps": {
    cluster: "media",
    anchor: "photo editing app screenshots",
    headlineExamples: [
      "Studio edits in three taps",
      "One preset, your whole roll",
      "RAW to ready in a minute",
    ],
  },
  "music-apps": {
    cluster: "media",
    anchor: "music app screenshots",
    headlineExamples: [
      "Your library, offline",
      "A setlist for every mood",
      "Loop it, layer it, ship it",
    ],
  },
  "podcast-apps": {
    cluster: "media",
    anchor: "podcast app screenshots",
    headlineExamples: [
      "Never lose your place",
      "Skip the ads automatically",
      "Two hours of listening, offline",
    ],
  },
  "ebook-reader-apps": {
    cluster: "media",
    anchor: "ebook reader app screenshots",
    headlineExamples: [
      "Read anywhere, sync everywhere",
      "Highlights you'll actually revisit",
      "Your whole library, in a pocket",
    ],
  },
  "indie-games": {
    cluster: "media",
    anchor: "indie game screenshots",
    headlineExamples: [
      "Smash to survive",
      "Match. Chain. Win.",
      "One tap. 30 seconds. Chaos.",
    ],
  },

  "education-apps": {
    cluster: "learn",
    anchor: "education app screenshots",
    headlineExamples: [
      "One lesson a day, ten minutes",
      "Learn it, then prove it",
      "Courses that fit a commute",
    ],
  },
  "language-learning-apps": {
    cluster: "learn",
    anchor: "language learning app screenshots",
    headlineExamples: [
      "Speak Spanish in 8 weeks",
      "Ten new words before coffee",
      "Practise with real conversations",
    ],
  },
  "language-translation-apps": {
    cluster: "learn",
    anchor: "translation app screenshots",
    headlineExamples: [
      "Point, translate, understand",
      "Offline in 40 languages",
      "Translate a menu in one shot",
    ],
  },

  "travel-apps": {
    cluster: "life",
    anchor: "travel app screenshots",
    headlineExamples: [
      "Every booking, one timeline",
      "Offline maps for 30 cities",
      "Your whole trip, planned tonight",
    ],
  },
  "food-delivery-apps": {
    cluster: "life",
    anchor: "food delivery app screenshots",
    headlineExamples: [
      "Dinner in 20 minutes",
      "Track every order live",
      "Your usual, reordered in a tap",
    ],
  },
  "recipe-apps": {
    cluster: "life",
    anchor: "recipe app screenshots",
    headlineExamples: [
      "Dinner from what's in the fridge",
      "Groceries sorted by aisle",
      "Recipes that fit a weeknight",
    ],
  },
  "weather-apps": {
    cluster: "life",
    anchor: "weather app screenshots",
    headlineExamples: [
      "Rain in 12 minutes",
      "Tomorrow, hour by hour",
      "The forecast, without the noise",
    ],
  },
};

/**
 * Demand order taken from Search Console impressions (2026-07 export). Drives
 * which categories get surfaced on the homepage, in the footer, and as filler
 * in related blocks — link weight follows real demand, not array order.
 */
export const PRIORITY_CATEGORY_SLUGS: string[] = [
  "fitness-apps",
  "indie-games",
  "finance-apps",
  "productivity-apps",
  "vpn-apps",
  "dating-apps",
  "running-apps",
  "weather-apps",
  "meditation-apps",
  "budgeting-apps",
  "language-translation-apps",
  "ai-apps",
  "education-apps",
  "note-taking-apps",
  "habit-tracker-apps",
  "social-apps",
];

/** Which competitor comparison pages are most relevant per cluster. */
const CLUSTER_COMPETITORS: Record<CategoryClusterId, string[]> = {
  health: ["appmockup", "previewed"],
  money: ["screenshots-pro", "previewed"],
  work: ["appmockup", "screenshots-pro"],
  tech: ["screenshots-pro", "rotato"],
  social: ["appmockup", "shotbot"],
  media: ["rotato", "previewed"],
  learn: ["screenshots-pro", "appmockup"],
  life: ["shotbot", "appmockup"],
};

export function getCategoryEditorial(slug: string): CategoryEditorial | undefined {
  return CATEGORY_EDITORIAL[slug];
}

/**
 * Anchor text for any internal link pointing at a category page. Falls back to
 * a constructed phrase so a newly added category is never linked as "here".
 */
export function categoryAnchor(category: Pick<Category, "slug" | "noun">): string {
  return CATEGORY_EDITORIAL[category.slug]?.anchor ?? `${category.noun} screenshots`;
}

export function categoriesInCluster(cluster: CategoryClusterId): Category[] {
  return CATEGORIES.filter(
    (c) => CATEGORY_EDITORIAL[c.slug]?.cluster === cluster,
  );
}

/**
 * Categories ordered by real search demand, highest first. Computed once at
 * module load: it is a pure function of two module constants, and the footer
 * alone would otherwise rebuild it on every one of the ~55 prerendered pages.
 */
const CATEGORIES_BY_DEMAND: readonly Category[] = (() => {
  const ranked = PRIORITY_CATEGORY_SLUGS.map((slug) =>
    CATEGORIES.find((c) => c.slug === slug),
  ).filter((c): c is Category => Boolean(c));
  const rest = CATEGORIES.filter(
    (c) => !PRIORITY_CATEGORY_SLUGS.includes(c.slug),
  );
  return [...ranked, ...rest];
})();

/** Categories ordered by real search demand, highest first. */
export function categoriesByDemand(limit?: number): Category[] {
  return CATEGORIES_BY_DEMAND.slice(0, limit);
}

/** How many cluster siblings a related block may take before the ring fills up. */
const MAX_CLUSTER_SIBLINGS = 4;

/**
 * Siblings for the related block, built from two rules that fix two different
 * problems:
 *
 * 1. **Cluster siblings first** — links point at genuinely adjacent verticals
 *    (fitness → running → habit tracker), which is what makes them worth a
 *    click and what makes the anchor text meaningful.
 * 2. **Rotating ring window to fill** — the old `slice(0, 6)` handed all 40
 *    category pages the *same* six siblings, so 34 of 40 URLs had exactly one
 *    inbound internal link (the hub) and every related block was byte-identical.
 *    Walking a window forward through the array guarantees each category is
 *    linked from several others and every block is unique per page.
 */
export function relatedCategories(slug: string, limit = 6): Category[] {
  const editorial = CATEGORY_EDITORIAL[slug];
  const picked: Category[] = [];
  const push = (c: Category | undefined) => {
    if (!c) return;
    if (c.slug !== slug && !picked.some((p) => p.slug === c.slug)) picked.push(c);
  };

  if (editorial) {
    // Ring window *within* the cluster: a plain slice would always pick the
    // first N members, leaving the tail of every cluster with no inbound
    // sibling links at all.
    const members = categoriesInCluster(editorial.cluster);
    const selfInCluster = members.findIndex((c) => c.slug === slug);
    for (
      let i = 1;
      i < members.length && picked.length < MAX_CLUSTER_SIBLINGS;
      i += 1
    ) {
      push(members[(selfInCluster + i) % members.length]);
    }
  }

  const selfIndex = CATEGORIES.findIndex((c) => c.slug === slug);
  if (selfIndex >= 0) {
    for (let i = 1; i < CATEGORIES.length && picked.length < limit; i += 1) {
      push(CATEGORIES[(selfIndex + i) % CATEGORIES.length]);
    }
  }

  // Last-resort top-up. The ring above walks the whole of CATEGORIES, so this
  // only ever fires if there are fewer categories than `limit` — guarded so the
  // common path doesn't build and scan a 40-item array it will discard.
  if (picked.length < limit) categoriesByDemand().forEach(push);

  return picked.slice(0, limit);
}

export function competitorSlugsForCategory(slug: string): string[] {
  const cluster = CATEGORY_EDITORIAL[slug]?.cluster;
  return cluster ? CLUSTER_COMPETITORS[cluster] : ["appmockup", "previewed"];
}

export function clusterOf(slug: string): CategoryCluster | undefined {
  const id = CATEGORY_EDITORIAL[slug]?.cluster;
  return CATEGORY_CLUSTERS.find((c) => c.id === id);
}
