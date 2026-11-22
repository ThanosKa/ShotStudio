import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import { getAllPostMetas } from "@/lib/blog";
import { isCategoryPruned, isCompetitorPruned } from "@/lib/marketing/pruned";

const REVISED = {
  home: "2026-11-04",
  pricing: "2026-11-04",
  screenshotsForHub: "2026-11-13",
  alternativesHub: "2026-11-16",
  blogHub: "2026-11-13",
  privacy: "2026-07-29",
  terms: "2026-07-29",
  sizeChecker: "2026-11-18",
  categories: "2026-07-29",
  competitors: "2026-07-29",
} as const;

const CATEGORY_REVISED: Record<string, string> = {
  "fitness-apps": "2026-11-09",
  "finance-apps": "2026-11-09",
  "education-apps": "2026-11-09",
  "music-apps": "2026-11-09",
  "weather-apps": "2026-11-09",
  "vpn-apps": "2026-11-09",
  "pet-care-apps": "2026-11-09",
  "running-apps": "2026-11-09",
  "ai-chatbot-apps": "2026-11-09",
  "indie-games": "2026-11-09",
};

const COMPETITOR_REVISED: Record<string, string> = {
  appmockup: "2026-11-09",
  previewed: "2026-11-09",
  shotbot: "2026-11-16",
  applaunchpad: "2026-11-09",
  appscreens: "2026-11-09",
};

function revisedAt(iso: string | undefined): Date {
  const raw = iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso : REVISED.blogHub;
  return new Date(raw.includes("T") ? raw : `${raw}T00:00:00.000Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
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
    {
      url: `${APP_URL}/tools/app-store-screenshot-sizes`,
      lastModified: revisedAt(REVISED.sizeChecker),
      changeFrequency: "monthly",
      priority: 0.8,
    },
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

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => !isCategoryPruned(c.slug),
  ).map((c) => ({
    url: `${APP_URL}/screenshots-for/${c.slug}`,
    lastModified: revisedAt(CATEGORY_REVISED[c.slug] ?? REVISED.categories),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const competitorPages: MetadataRoute.Sitemap = COMPETITORS.filter(
    (c) => !isCompetitorPruned(c.slug),
  ).map((c) => ({
    url: `${APP_URL}/alternatives/${c.slug}`,
    lastModified: revisedAt(COMPETITOR_REVISED[c.slug] ?? REVISED.competitors),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = getAllPostMetas().map((p) => ({
    url: `${APP_URL}/blog/${p.slug}`,
    lastModified: revisedAt(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...competitorPages, ...blogPages];
}
