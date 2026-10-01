/**
 * Project-local OpenRouter image generation. Calls /v1/images (text-to-image)
 * and saves the returned PNG.
 *
 * Usage:
 *   pnpm tsx scripts/generate-shot.ts \
 *     --prompt "..." \
 *     --output public/showcase/lumen/1.png \
 *     [--model openai/gpt-image-2.5-sunburst] \
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
const model = args.get("model") || "openai/gpt-image-2.5-sunburst";
const aspectRatio = args.get("aspect-ratio");

if (!prompt || !output) {
  console.error("Usage: tsx generate-shot.ts --prompt \"...\" --output path.png [--model id] [--aspect-ratio 9:16]");
  process.exit(1);
}

const outputPath: string = output;
const body: Record<string, unknown> = { model, prompt, n: 1 };
if (aspectRatio) body.aspect_ratio = aspectRatio;

console.error(`→ POST openrouter.ai/api/v1/images`);
console.error(`  model: ${model}`);
console.error(`  aspect: ${aspectRatio ?? "default"}`);
console.error(`  prompt length: ${prompt.length} chars`);

async function main() {
  const res = await fetch("https://openrouter.ai/api/v1/images", {
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

  const json: unknown = await res.json();
  const first =
    typeof json === "object" && json !== null && "data" in json && Array.isArray(json.data)
      ? json.data[0]
      : undefined;
  const base64 =
    typeof first === "object" && first !== null && "b64_json" in first && typeof first.b64_json === "string"
      ? first.b64_json
      : undefined;
  if (!base64) {
    console.error("No image returned.");
    console.error(JSON.stringify(json, null, 2).slice(0, 2000));
    process.exit(1);
  }

  const buffer = Buffer.from(base64, "base64");
  const outputAbs = resolve(outputPath);
  mkdirSync(dirname(outputAbs), { recursive: true });
  writeFileSync(outputAbs, buffer);

  console.error(`✓ Saved ${buffer.length} bytes to ${outputAbs}`);
  console.log(JSON.stringify({ model, output: outputAbs, bytes: buffer.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
