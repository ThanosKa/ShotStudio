import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import { getAllPostMetas } from "@/lib/blog";

/**
 * Content revision dates — the last time the content behind each surface
 * actually changed. Plain ISO dates, hand-maintained.
 *
 * NEVER put `new Date()` in this file. `sitemap.ts` is a Route Handler that
 * Next caches at build time (see next/docs .../metadata/sitemap.md), so
 * `new Date()` freezes to the build timestamp and stamps every URL with the
 * same instant. That broke crawling twice over:
 *
 *  1. Between deploys the value never moves. The 2026-06-13 build stamped all
 *     52 non-blog URLs `2026-06-13T20:40:15.675Z`; Google read the sitemap on
 *     2026-06-14 and did not come back for 45 days, because nothing in it ever
 *     claimed to have changed.
 *  2. When it does move, all 54 URLs move together. Google discards `<lastmod>`
 *     it cannot verify, and "every URL changed at the same millisecond on every
 *     deploy" is the textbook unreliable signal.
 *
 * When you change the content behind a surface, bump only its entry here.
 * Per-slug overrides go in CATEGORY_REVISED / COMPETITOR_REVISED so a single
 * rewritten page does not have to re-date its 39 siblings.
 */
const REVISED = {
  // 2026-07-29: the SEO recovery sprint rewrote metadata, schema, body copy and
  // internal links across every marketing surface, so today is the honest
  // revision date for all of them. Previous genuine dates, for reference:
  // home 2026-05-11, pricing/hubs 2026-05-19, privacy/terms 2026-05-12,
  // categories 2026-06-13, competitors 2026-05-19.
  home: "2026-07-29",
  pricing: "2026-07-29",
  screenshotsForHub: "2026-07-29",
  alternativesHub: "2026-07-29",
  blogHub: "2026-07-29",
  privacy: "2026-07-29",
  terms: "2026-07-29",
  /** Fallback for `/screenshots-for/[category]` — src/data/categories.ts. */
  categories: "2026-07-29",
  /** Fallback for `/alternatives/[competitor]` — src/data/competitors.ts. */
  competitors: "2026-07-29",
} as const;

/** Per-slug overrides. Add an entry when you rewrite one category page. */
const CATEGORY_REVISED: Record<string, string> = {};

/** Per-slug overrides. Add an entry when you rewrite one competitor page. */
const COMPETITOR_REVISED: Record<string, string> = {};

/**
 * Parse a revision string into a Date. `YYYY-MM-DD` is normalised to UTC
 * midnight so the emitted `<lastmod>` is stable regardless of build machine
 * timezone; a full ISO timestamp is passed through.
 */
function revisedAt(iso: string | undefined): Date {
  // Guard: a blog post missing both `updatedAt` and `publishedAt` frontmatter
  // must not emit an Invalid Date into <lastmod>.
  const raw = iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso : REVISED.blogHub;
  return new Date(raw.includes("T") ? raw : `${raw}T00:00:00.000Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Every entry below must be an absolute https://shotstudio.dev URL, must be
  // indexable, and must match that page's self-referencing canonical exactly.
  // Deliberately excluded: /home, /sign-in, /sign-up (noindex app + auth
  // routes) and /api/* (non-HTML, disallowed in robots.ts).
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: revisedAt(REVISED.home),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: revisedAt(REVISED.pricing),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/screenshots-for`,
      lastModified: revisedAt(REVISED.screenshotsForHub),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/alternatives`,
      lastModified: revisedAt(REVISED.alternativesHub),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/blog`,
      lastModified: revisedAt(REVISED.blogHub),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Kept in the sitemap on purpose: /privacy and /terms are trust signals and
    // are linked from Stripe checkout and Clerk sign-up. They are NOT
    // noindexed. Their low priority reflects that they should never outrank
    // /pricing — see reports/01-indexing.md for the internal-linking handoff.
    {
      url: `${APP_URL}/privacy`,
      lastModified: revisedAt(REVISED.privacy),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: revisedAt(REVISED.terms),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${APP_URL}/screenshots-for/${c.slug}`,
    lastModified: revisedAt(CATEGORY_REVISED[c.slug] ?? REVISED.categories),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const competitorPages: MetadataRoute.Sitemap = COMPETITORS.map((c) => ({
    url: `${APP_URL}/alternatives/${c.slug}`,
    lastModified: revisedAt(COMPETITOR_REVISED[c.slug] ?? REVISED.competitors),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // `updatedAt` falls back to `publishedAt` in src/lib/blog.ts, so a post that
  // is edited moves its own lastmod without touching any other URL.
  const blogPages: MetadataRoute.Sitemap = getAllPostMetas().map((p) => ({
    url: `${APP_URL}/blog/${p.slug}`,
    lastModified: revisedAt(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...competitorPages, ...blogPages];
}
