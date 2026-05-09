import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : plural ?? `${singular}s`;
}

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
