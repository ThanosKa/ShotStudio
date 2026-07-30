import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";

// Only block non-HTML endpoints here. /home, /sign-in, and /sign-up carry
// `robots: { index: false }` meta tags instead — blocking them in robots.txt
// would stop crawlers from ever reading those tags, which is what produced
// Google's "Indexed, though blocked by robots.txt" warning for /home.
// That warning is now clear (0 pages in the 2026-07-29 coverage export), so do
// not re-add HTML routes here. robots.txt is a crawl directive, not an index
// directive: it can never remove a URL from the index, it only guarantees
// Google can't read the noindex that would.
//
// GSC will keep reporting a "Blocked by robots.txt" row for an /api/* URL
// (the checkout and generation endpoints are referenced from client bundles,
// so Google discovers them). That row is expected and correct — these are
// POST-only JSON endpoints with no indexable content. Do not "fix" it.
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
