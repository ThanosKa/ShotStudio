import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

const perHour = Number(process.env.GENERATION_RATE_LIMIT_PER_HOUR ?? 20);

type Limiter = {
  limit: (key: string) => Promise<{ success: boolean; reset: number }>;
};

export const generationRateLimit: Limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(perHour, "1 h"),
      analytics: true,
      prefix: "ratelimit:gen",
    })
  : {
      async limit() {
        return { success: true, reset: 0 };
      },
    };
