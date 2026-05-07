import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

const perHour = Number(process.env.GENERATION_RATE_LIMIT_PER_HOUR ?? 20);

export const generationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(perHour, "1 h"),
  analytics: true,
  prefix: "ratelimit:gen",
});
