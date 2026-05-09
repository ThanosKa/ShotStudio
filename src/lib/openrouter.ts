import { APP_URL } from "@/lib/env";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

const ENDPOINT = "https://openrouter.ai/api/v1";
const MODEL = "openai/gpt-5.4-image-2";

export type ImageGenerationInput = {
  prompt: string;
  /**
   * Optional reference images as data URLs (e.g. `data:image/jpeg;base64,...`).
   * Sent as `image_url` content parts alongside the text prompt for image-to-image generation.
   */
  referenceImages?: string[];
  aspectRatio?: string;
  imageSize?: "0.5K" | "1K" | "2K" | "4K";
  /** Per-call timeout in ms. Defaults to 120s so a single slow shot can't starve the route. */
  timeoutMs?: number;
};

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      images?: Array<{
        type?: string;
        image_url?: { url?: string };
      }>;
    };
  }>;
};

/**
 * Returns raw base64 (no `data:image/...` prefix) so callers can hand it to
 * `Buffer.from(b64, "base64")` directly.
 */
export async function generateImage(input: ImageGenerationInput): Promise<string> {
  const content: ContentPart[] = [{ type: "text", text: input.prompt }];
  if (input.referenceImages) {
    for (const url of input.referenceImages) {
      content.push({ type: "image_url", image_url: { url } });
    }
  }

  const controller = new AbortController();
  const timeoutMs = input.timeoutMs ?? 120_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": "ShotStudio",
      },
      body: JSON.stringify({
        model: MODEL,
        modalities: ["image", "text"],
        messages: [{ role: "user", content }],
        image_config: {
          aspect_ratio: input.aspectRatio ?? "9:16",
          image_size: input.imageSize ?? "2K",
        },
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new Error(`OpenRouter timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const dataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl) throw new Error("OpenRouter returned no image");

  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx < 0 || !dataUrl.startsWith("data:")) {
    throw new Error("OpenRouter returned malformed image URL");
  }
  return dataUrl.slice(commaIdx + 1);
}
