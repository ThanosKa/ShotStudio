import { z } from "zod";

export const PITCH_MIN_CHARS = 10;
export const PITCH_MAX_CHARS = 200;
export const AUDIENCE_MAX_CHARS = 120;

export const pitchSchema = z
  .string()
  .trim()
  .min(PITCH_MIN_CHARS, `Pitch must be at least ${PITCH_MIN_CHARS} characters.`)
  .max(PITCH_MAX_CHARS, `Pitch must be ${PITCH_MAX_CHARS} characters or fewer.`);

export const audienceSchema = z
  .string()
  .trim()
  .max(AUDIENCE_MAX_CHARS, `Audience must be ${AUDIENCE_MAX_CHARS} characters or fewer.`)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));
