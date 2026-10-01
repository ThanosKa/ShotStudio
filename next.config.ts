import type { NextConfig } from "next";
import { PRUNED } from "./src/lib/marketing/pruned-list";

const nextConfig: NextConfig = {
  // Pruned programmatic pages (see src/lib/marketing/pruned.ts and PRUNED.md)
  // stay reachable for users but tell crawlers to drop them while still
  // following links. Deleting an entry from PRUNED reverses this.
  async headers() {
    return PRUNED.filter((entry) => entry.action === "noindex").map((entry) => ({
      source: entry.path,
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }));
  },
  async redirects() {
    return PRUNED.flatMap((entry) =>
      entry.action === "redirect" && entry.target
        ? [{ source: entry.path, destination: entry.target, permanent: true }]
        : [],
    );
  },
};

export default nextConfig;
