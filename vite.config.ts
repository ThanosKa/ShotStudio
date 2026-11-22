import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { blogContent } from "./src/lib/blog-vite-plugin";

const UPSCALE = path.resolve(import.meta.dirname, "src/lib/generation/upscale.ts");
const UPSCALE_WORKER = path.resolve(import.meta.dirname, "src/lib/generation/upscale.worker.ts");

function workerUpscale(): Plugin {
  return {
    name: "shotstudio:worker-upscale",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!/(?:^|\/)upscale(?:\.ts)?$/.test(source)) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved?.id === UPSCALE ? UPSCALE_WORKER : null;
    },
  };
}

export default defineConfig({
  plugins: [
    workerUpscale(),
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
