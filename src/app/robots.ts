import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";

const PRIVATE_PATHS = ["/api/", "/home"];

const AI_SEARCH_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      ...AI_SEARCH_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
