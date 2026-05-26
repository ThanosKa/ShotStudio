import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";

// Only block non-HTML endpoints here. /home, /sign-in, and /sign-up carry
// `robots: { index: false }` meta tags instead — blocking them in robots.txt
// would stop crawlers from ever reading those tags, which is what produced
// Google's "Indexed, though blocked by robots.txt" warning for /home.
const PRIVATE_PATHS = ["/api/"];

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
