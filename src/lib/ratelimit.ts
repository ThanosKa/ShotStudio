import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { redis } from "./redis";

const perHour = z.coerce
  .number()
  .int()
  .positive()
  .default(20)
  .parse(process.env.GENERATION_RATE_LIMIT_PER_HOUR);

const checkoutPerHour = z.coerce
  .number()
  .int()
  .positive()
  .default(10)
  .parse(process.env.CHECKOUT_RATE_LIMIT_PER_HOUR);

export type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type Limiter = {
  limit: (key: string) => Promise<LimitResult>;
};

function buildLimiter(opts: {
  perWindow: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
  prefix: string;
}): Limiter {
  if (!redis) {
    // dev / no-Upstash fallback — redis.ts already throws in production
    return {
      async limit() {
        return {
          success: true,
          limit: opts.perWindow,
          remaining: opts.perWindow,
          reset: 0,
        };
      },
    };
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.perWindow, opts.window),
    analytics: true,
    prefix: opts.prefix,
    // Cache hot denials in-process so a hammering client doesn't hit Redis.
    ephemeralCache: new Map(),
    // If Redis is slow, fail-open after 1s so users don't see 500s.
    timeout: 1000,
  });
}

export const generationRateLimit = buildLimiter({
  perWindow: perHour,
  window: "1 h",
  prefix: "ratelimit:gen",
});

export const checkoutRateLimit = buildLimiter({
  perWindow: checkoutPerHour,
  window: "1 h",
  prefix: "ratelimit:checkout",
});

/** Standard rate-limit response headers, per draft-ietf-httpapi-ratelimit-headers. */
export function rateLimitHeaders(r: LimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(Math.ceil(r.reset / 1000)),
  };
}
