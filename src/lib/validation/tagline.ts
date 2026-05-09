import { z } from "zod";

export const TAGLINE_MIN_WORDS = 5;
export const TAGLINE_MAX_WORDS = 10;

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export const taglineSchema = z
  .string()
  .min(1)
  .refine((s) => {
    const w = wordCount(s);
    return w >= TAGLINE_MIN_WORDS && w <= TAGLINE_MAX_WORDS;
  }, `Tagline must be ${TAGLINE_MIN_WORDS}–${TAGLINE_MAX_WORDS} words`);
