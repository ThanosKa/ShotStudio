import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

if (!hasUpstash && process.env.NODE_ENV === "production") {
  throw new Error(
    "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN must be set in production " +
      "— webhook idempotency and rate limiting depend on it.",
  );
}

export const redis: Redis | null = hasUpstash ? Redis.fromEnv() : null;
