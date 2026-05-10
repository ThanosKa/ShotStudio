/**
 * Project-local OpenRouter image generation. Calls /v1/chat/completions with
 * image+text modalities and saves the returned PNG. Handles response shapes
 * that the openrouter-images skill mis-parses (image objects, not raw strings).
 *
 * Usage:
 *   pnpm tsx scripts/generate-shot.ts \
 *     --prompt "..." \
 *     --output public/showcase/lumen/1.png \
 *     [--model openai/gpt-5.4-image-2] \
 *     [--aspect-ratio 9:16]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

// tsx auto-loads .env.local via its built-in dotenv support — no import needed.

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY in env or .env.local");
  process.exit(1);
}

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--") && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    args.set(a.slice(2), process.argv[i + 1]);
    i++;
  }
}

const prompt = args.get("prompt");
const output = args.get("output");
const model = args.get("model") || "openai/gpt-5.4-image-2";
const aspectRatio = args.get("aspect-ratio");

if (!prompt || !output) {
  console.error("Usage: tsx generate-shot.ts --prompt \"...\" --output path.png [--model id] [--aspect-ratio 9:16]");
  process.exit(1);
}

const body: Record<string, unknown> = {
  model,
  modalities: ["image", "text"],
  messages: [{ role: "user", content: prompt }],
};
if (aspectRatio) body.image_config = { aspect_ratio: aspectRatio };

console.error(`→ POST openrouter.ai/api/v1/chat/completions`);
console.error(`  model: ${model}`);
console.error(`  aspect: ${aspectRatio ?? "default"}`);
console.error(`  prompt length: ${prompt.length} chars`);

async function main() {
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.error(`HTTP ${res.status}: ${text.slice(0, 1000)}`);
  process.exit(1);
}

const json = (await res.json()) as {
  choices?: Array<{ message?: { content?: string; images?: unknown[] } }>;
};

const message = json.choices?.[0]?.message;
if (!message) {
  console.error("No message in response.");
  console.error(JSON.stringify(json, null, 2).slice(0, 2000));
  process.exit(1);
}

if (message.content) {
  console.error(`Model text: ${String(message.content).slice(0, 500)}`);
}

const images = message.images ?? [];
if (images.length === 0) {
  console.error("No images returned.");
  console.error(JSON.stringify(json, null, 2).slice(0, 2000));
  process.exit(1);
}

function extractDataUrl(item: unknown): string | null {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    if (typeof obj.image_url === "string") return obj.image_url;
    if (obj.image_url && typeof obj.image_url === "object") {
      const url = (obj.image_url as Record<string, unknown>).url;
      if (typeof url === "string") return url;
    }
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.b64_json === "string") return `data:image/png;base64,${obj.b64_json}`;
    if (typeof obj.data === "string") return obj.data.startsWith("data:") ? obj.data : `data:image/png;base64,${obj.data}`;
  }
  return null;
}

const dataUrl = extractDataUrl(images[0]);
if (!dataUrl) {
  console.error("Could not parse image item. Raw shape:");
  console.error(JSON.stringify(images[0], null, 2).slice(0, 2000));
  process.exit(1);
}

const base64 = dataUrl.startsWith("data:") ? (dataUrl.split(",")[1] ?? "") : dataUrl;
const buffer = Buffer.from(base64, "base64");

const outputAbs = resolve(output as string);
mkdirSync(dirname(outputAbs), { recursive: true });
writeFileSync(outputAbs, buffer);

console.error(`✓ Saved ${buffer.length} bytes to ${outputAbs}`);
console.log(JSON.stringify({ model, output: outputAbs, bytes: buffer.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
