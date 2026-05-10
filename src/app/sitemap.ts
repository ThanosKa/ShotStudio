import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/screenshots-for`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/alternatives`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${APP_URL}/screenshots-for/${c.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const competitorPages: MetadataRoute.Sitemap = COMPETITORS.map((c) => ({
    url: `${APP_URL}/alternatives/${c.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...competitorPages];
}
