import { describe, expect, it, vi } from "vitest";
import { keepRequestAliveUntil } from "@/lib/db";

// Upstash returns its analytics write as `pending`. A Worker drops unfinished
// work when the response ends unless it goes to waitUntil.
const analyticsWrite = vi.hoisted(() => Promise.resolve("recorded"));
vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static slidingWindow() {
      return {};
    }
    async limit() {
      return { success: true, limit: 20, remaining: 19, reset: 0, pending: analyticsWrite };
    }
  }
  return { Ratelimit };
});
vi.mock("@/lib/redis", () => ({ redis: {} }));

describe("rate limiter on a Worker", () => {
  it("keeps Upstash's pending analytics write alive past the response", async () => {
    const { generationRateLimit } = await import("./ratelimit");

    const result = await generationRateLimit.limit("u_1");

    expect(result.success).toBe(true);
    expect(vi.mocked(keepRequestAliveUntil)).toHaveBeenCalledWith(analyticsWrite);
  });
});
