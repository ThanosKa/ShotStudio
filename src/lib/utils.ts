import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pluralize({
  n,
  singular,
  plural,
}: {
  n: number;
  singular: string;
  plural?: string;
}): string {
  return n === 1 ? singular : plural ?? `${singular}s`;
}

const DEFAULT_APP_URL = "https://shotstudio.dev";

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
