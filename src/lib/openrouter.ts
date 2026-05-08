const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

const ENDPOINT = "https://openrouter.ai/api/v1";
const MODEL = "openai/gpt-5.4-image-2";

export type ImageGenerationInput = {
  prompt: string;
  size: "1024x1024" | "1024x1536" | "1536x1024";
  referenceImages?: string[];
};

export async function generateImage(input: ImageGenerationInput): Promise<string> {
  const res = await fetch(`${ENDPOINT}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "ShotStudio",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: input.prompt,
      size: input.size,
      n: 1,
      quality: "high",
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  }

  const data: { data: Array<{ b64_json: string }> } = await res.json();
  const b64 = data.data[0]?.b64_json;
  if (!b64) throw new Error("OpenRouter returned no image");
  return b64;
}
