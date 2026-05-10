import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/home", "/sign-in", "/sign-up"],
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
