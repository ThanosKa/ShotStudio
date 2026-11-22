import type { NextConfig } from "next";
import { PRUNED } from "./src/lib/marketing/pruned-list";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  experimental: {
    globalNotFound: true,
  },
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
