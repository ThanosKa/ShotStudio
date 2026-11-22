import type { Logger } from "pino";
import { describe, expect, it, vi } from "vitest";
import { runStripeEventOnce } from "@/lib/billing/stripe-event-once";

// Without Redis (local dev) nothing guards a repeated delivery: every one runs.
vi.mock("@/lib/redis", () => ({ redis: null }));

const log = { warn: vi.fn() } as unknown as Logger;

describe("runStripeEventOnce without Redis", () => {
  it("runs the work for both of two deliveries of the same event", async () => {
    const work = vi.fn().mockResolvedValue({ ok: true });

    const first = await runStripeEventOnce({ eventId: "evt_1", work, log });
    const second = await runStripeEventOnce({ eventId: "evt_1", work, log });

    expect(first).toEqual({ kind: "ran", result: { ok: true } });
    expect(second).toEqual({ kind: "ran", result: { ok: true } });
    expect(work).toHaveBeenCalledTimes(2);
  });
});
