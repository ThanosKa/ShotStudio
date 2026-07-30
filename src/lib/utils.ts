import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : plural ?? `${singular}s`;
}

const DEFAULT_APP_URL = "https://shotstudio.dev";

// `??` would let an empty string through, and layout.tsx feeds this to
// `new URL()` — an unset-but-present env var then throws at build time and
// takes every canonical URL with it. Trailing slashes are stripped so callers
// can interpolate `${APP_URL}/path` without doubling the separator.
function resolveAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return DEFAULT_APP_URL;
  try {
    new URL(configured);
  } catch {
    return DEFAULT_APP_URL;
  }
  return configured.replace(/\/+$/, "");
}

export const APP_URL = resolveAppUrl();
