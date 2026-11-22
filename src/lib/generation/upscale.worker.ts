import { env } from "cloudflare:workers";
import { logger } from "@/lib/logger";
import { APP_STORE_PORTRAIT_H, APP_STORE_PORTRAIT_W } from "./app-store-size";

// Cloudflare Images error 9422, usage limit reached: https://developers.cloudflare.com/images/reference/troubleshooting/
const MONTHLY_LIMIT_CODE = /\b9422\b/;

export async function upscaleToAppStore(b64: string): Promise<Buffer> {
  const input = new Response(Buffer.from(b64, "base64")).body;
  if (!input) throw new Error("Image to upscale is empty");

  try {
    const result = await env.IMAGES.input(input)
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
