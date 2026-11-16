import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { runCheckoutFulfillment } from "@/lib/billing/checkout";

// Characterization of the Delivery Claim's edge cases that route.test.ts does
// not cover: the stored values, key and expiry times, and the retry paths.

const SECRET = "whsec_test_secret";
const real = new Stripe("sk_test_unused");

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEventAsync: (raw: string, sig: string, secret: string) =>
        real.webhooks.constructEventAsync(raw, sig, secret),
    },
  },
}));

// A fake that also records every write, so the key, value and expiry can be read.
const fakeRedis = vi.hoisted(() => {
  const store = new Map<string, { value: unknown; ex: number }>();
  const sets: { key: string; value: unknown; opts: { nx?: boolean; ex: number } }[] = [];
  return {
    store,
    sets,
    reset() {
      store.clear();
      sets.length = 0;
    },
    client: {
      async set(key: string, value: unknown, opts: { nx?: boolean; ex: number }) {
        sets.push({ key, value, opts });
        if (opts.nx && store.has(key)) return null;
        store.set(key, { value, ex: opts.ex });
        return "OK";
      },
      async get(key: string) {
        return store.get(key)?.value ?? null;
      },
      async del(key: string) {
        return store.delete(key) ? 1 : 0;
      },
    },
  };
});
vi.mock("@/lib/redis", () => ({ redis: fakeRedis.client }));
vi.mock("@/lib/billing/checkout", () => ({ runCheckoutFulfillment: vi.fn() }));

const fulfil = vi.mocked(runCheckoutFulfillment);
const OK_OUTCOME = {
  kind: "ok",
  userId: "u_buy",
  creditsGranted: 5,
  newBalance: 5,
  emailSent: true,
} as const;
const KEY = "stripe:event:evt_paid";

function checkoutCompleted() {
  const payload = JSON.stringify({
    id: "evt_paid",
    object: "event",
    type: "checkout.session.completed",
    data: { object: { id: "cs_test", object: "checkout.session" } },
  });
  return new NextRequest("https://example.test/api/webhooks/stripe", {
    method: "POST",
    body: payload,
    headers: {
      "stripe-signature": real.webhooks.generateTestHeaderString({
        payload,
        secret: SECRET,
      }),
    },
  });
}

describe("POST /api/webhooks/stripe, Delivery Claim", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
    fakeRedis.reset();
    fulfil.mockReset();
  });

  it("answers 200 without fulfilment when the claim holds the old value 1", async () => {
    const { POST } = await import("./route");
    fakeRedis.store.set(KEY, { value: "1", ex: 86_400 });

    expect((await POST(checkoutCompleted())).status).toBe(200);
    expect(fulfil).not.toHaveBeenCalled();
  });

  it("answers exactly 409 when a live processing claim exists", async () => {
    const { POST } = await import("./route");
    fakeRedis.store.set(KEY, { value: "processing", ex: 120 });

    expect((await POST(checkoutCompleted())).status).toBe(409);
    expect(fulfil).not.toHaveBeenCalled();
  });

  it("deletes the claim on user_not_ready so Stripe's retry runs fulfilment", async () => {
    const { POST } = await import("./route");
    fulfil.mockResolvedValueOnce({ kind: "user_not_ready", userId: "u_buy" });

    expect((await POST(checkoutCompleted())).status).toBe(500);
    expect(fakeRedis.store.has(KEY)).toBe(false);

    fulfil.mockResolvedValueOnce(OK_OUTCOME);
    expect((await POST(checkoutCompleted())).status).toBe(200);
    expect(fulfil).toHaveBeenCalledTimes(2);
  });

  it("claims stripe:event:<id> as processing for 120 seconds, then marks done for 86400", async () => {
    const { POST } = await import("./route");
    fulfil.mockResolvedValueOnce(OK_OUTCOME);

    expect((await POST(checkoutCompleted())).status).toBe(200);

    expect(fakeRedis.sets).toEqual([
      { key: KEY, value: "processing", opts: { nx: true, ex: 120 } },
      { key: KEY, value: "done", opts: { ex: 86_400 } },
    ]);
  });
});
