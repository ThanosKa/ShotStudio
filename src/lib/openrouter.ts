import { APP_URL } from "@/lib/utils";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

const ENDPOINT = "https://openrouter.ai/api/v1";
const MODEL = "openai/gpt-image-2.5-sunburst";

export type ImageGenerationInput = {
  prompt: string;
  /**
   * Optional reference images as data URLs (e.g. `data:image/jpeg;base64,...`).
   * Sent as `input_references` for image-to-image generation (the model accepts up to 16).
   */
  referenceImages?: string[];
  aspectRatio?: string;
  imageSize?: "0.5K" | "1K" | "2K" | "4K";
  /** Per-call timeout in ms. Defaults to 120s so a single slow shot can't starve the route. */
  timeoutMs?: number;
};

type ImagesResponse = {
  data?: Array<{ b64_json?: string; media_type?: string }>;
};

/** Long edge in px per size tier. Concrete dimensions are derived from the aspect ratio. */
const LONG_EDGE_PX: Record<NonNullable<ImageGenerationInput["imageSize"]>, number> = {
  "0.5K": 1024,
  "1K": 1536,
  "2K": 2048,
  "4K": 3840,
};

/**
 * The images endpoint for gpt-image models wants explicit `WIDTHxHEIGHT` (a tier like
 * "1K" is rejected with 400). Dimensions are rounded to multiples of 16.
 */
function toPixelSize({
  aspectRatio,
  imageSize,
}: {
  aspectRatio: string;
  imageSize: NonNullable<ImageGenerationInput["imageSize"]>;
}): string {
  const match = /^(\d+):(\d+)$/.exec(aspectRatio);
  const w = match ? Number(match[1]) : 0;
  const h = match ? Number(match[2]) : 0;
  if (!(w > 0 && h > 0)) throw new Error(`Invalid aspect ratio: ${aspectRatio}`);

  const long = LONG_EDGE_PX[imageSize];
  const scale = long / Math.max(w, h);
  const round16 = (n: number) => Math.max(16, Math.round(n / 16) * 16);
  return `${round16(w * scale)}x${round16(h * scale)}`;
}

function isImagesResponse(value: unknown): value is ImagesResponse {
  if (typeof value !== "object" || value === null) return false;
  return !("data" in value) || Array.isArray(value.data);
}

/**
 * Returns raw base64 (no `data:image/...` prefix) so callers can hand it to
 * `Buffer.from(b64, "base64")` directly.
 */
export async function generateImage(input: ImageGenerationInput): Promise<string> {
  const size = toPixelSize({
    aspectRatio: input.aspectRatio ?? "9:16",
    imageSize: input.imageSize ?? "2K",
  });

  const controller = new AbortController();
  const timeoutMs = input.timeoutMs ?? 120_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": "ShotStudio",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: input.prompt,
        size,
        n: 1,
        ...(input.referenceImages?.length
          ? {
              input_references: input.referenceImages.map((url) => ({
                type: "image_url",
                image_url: { url },
              })),
            }
          : {}),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`OpenRouter timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }

  const data: unknown = await res.json();
  const b64 = isImagesResponse(data) ? data.data?.[0]?.b64_json : undefined;
  if (typeof b64 !== "string" || b64.length === 0) throw new Error("OpenRouter returned no image");
  return b64;
}
