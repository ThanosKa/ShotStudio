import { env } from "cloudflare:workers";
import { logger } from "@/lib/logger";
import { APP_STORE_PORTRAIT_H, APP_STORE_PORTRAIT_W } from "./app-store-size";

// Cloudflare's error code once the account's monthly transformations run out.
// Every Generation then fails (and is refunded) until the month ends.
const MONTHLY_LIMIT_CODE = /\b9422\b/;

// Worker replacement for `upscale.ts`, which Workers cannot load. See the plugin
// in `vite.config.ts`.
export async function upscaleToAppStore(b64: string): Promise<Buffer> {
  const input = new Response(Buffer.from(b64, "base64")).body;
  if (!input) throw new Error("Image to upscale is empty");

  try {
    const result = await env.IMAGES.input(input)
      // `cover` enlarges small images; `crop` would not. No `gravity`: Cloudflare
      // documents the centre as the default.
      .transform({
        width: APP_STORE_PORTRAIT_W,
        height: APP_STORE_PORTRAIT_H,
        fit: "cover",
      })
      .output({ format: "image/png" });
    return Buffer.from(await result.response().arrayBuffer());
  } catch (err) {
    if (MONTHLY_LIMIT_CODE.test(String(err))) {
      logger.error({ err }, "cloudflare images monthly transformation limit reached");
    }
    throw err;
  }
}
