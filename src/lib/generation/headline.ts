import type { Logger } from "pino";
import { generateText } from "@/lib/openrouter";

const HEADLINE_MODEL = "anthropic/claude-haiku-4.5";

const SYSTEM_PROMPT = `You write App Store screenshot headlines.
Given an app's name, what it does, and (optionally) who it's for, return ONE bold, punchy headline of 2-7 words.
Constraints:
- Sentence case or Title Case, never SHOUTING.
- No quotes, no trailing period unless multiple short clauses.
- Concrete, not abstract. No filler ("the", "a", "your" sparingly).
- Output the headline only — no preamble, no alternatives, no quotes.`;

export type HeadlineInput = {
  appName: string;
  pitch: string;
  audience?: string;
  category: string;
};

function sanitize(raw: string): string {
  return raw
    .trim()
    .replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, "")
    .split("\n")[0]
    .trim();
}

export async function synthesizeHeadline(
  input: HeadlineInput,
  log: Logger,
): Promise<string> {
  const userPrompt = [
    `App name: ${input.appName}`,
    `Category: ${input.category}`,
    `What it does: ${input.pitch}`,
    input.audience ? `Audience: ${input.audience}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const raw = await generateText({
      model: HEADLINE_MODEL,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxTokens: 30,
      temperature: 0.8,
      timeoutMs: 12_000,
    });
    const headline = sanitize(raw);
    if (!headline) throw new Error("empty headline");
    log.info({ headline }, "headline synthesized");
    return headline;
  } catch (err) {
    log.warn({ err }, "headline synthesis failed; falling back to app name");
    return input.appName;
  }
}
