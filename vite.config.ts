import path from "node:path";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { blogContent } from "./src/lib/blog-vite-plugin";

export default defineConfig({
  resolve: {
    alias: {
      // Workers cannot load sharp. Next and Vitest do not read this file, so they keep it.
      "@/lib/generation/upscale": path.resolve(
        import.meta.dirname,
        "src/lib/generation/upscale.worker.ts",
      ),
    },
  },
  plugins: [
    blogContent(),
    vinext({
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
