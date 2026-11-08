import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { runCheckoutFulfillment } from "@/lib/billing/checkout";

const SECRET = "whsec_test_secret";
const real = new Stripe("sk_test_unused");

// A Worker's crypto is async only, so the sync call throws there. Node's would
// pass, which is how this route's bug stayed hidden until real events arrived.
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: () => {
        throw new Error("SubtleCryptoProvider cannot be used in a synchronous context.");
      },
      constructEventAsync: (raw: string, sig: string, secret: string) =>
        real.webhooks.constructEventAsync(raw, sig, secret),
    },
  },
}));

// Just enough of Upstash's `set`/`get`/`del` to keep keys with a TTL against a
// clock the tests move by hand.
const fakeRedis = vi.hoisted(() => {
  const store = new Map<string, { value: unknown; expiresAt: number }>();
  let now = 0;
  const live = (key: string) => {
    const entry = store.get(key);
    if (entry && entry.expiresAt <= now) store.delete(key);
    return store.get(key);
  };
  return {
    reset() {
      store.clear();
      now = 0;
    },
    advanceSeconds(seconds: number) {
      now += seconds * 1000;
    },
    ttlSeconds(key: string) {
      const entry = live(key);
      return entry ? (entry.expiresAt - now) / 1000 : null;
    },
    client: {
      async set(key: string, value: unknown, opts: { nx?: boolean; ex: number }) {
        if (opts.nx && live(key)) return null;
        store.set(key, { value, expiresAt: now + opts.ex * 1000 });
        return "OK";
      },
      async get(key: string) {
        return live(key)?.value ?? null;
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

function signedRequest(opts: { signature?: string; id?: string; type?: string } = {}) {
  const payload = JSON.stringify({
    id: opts.id ?? "evt_test",
    object: "event",
    type: opts.type ?? "customer.updated",
    data: { object: { id: "cs_test", object: "checkout.session" } },
  });
  const header =
    opts.signature ?? real.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  return new NextRequest("https://example.test/api/webhooks/stripe", {
    method: "POST",
    body: payload,
    headers: { "stripe-signature": header },
  });
}

const checkoutCompleted = () =>
  signedRequest({ id: "evt_paid", type: "checkout.session.completed" });

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
    fakeRedis.reset();
    fulfil.mockReset();
  });

  it("accepts a correctly signed event where crypto is async only", async () => {
    const { POST } = await import("./route");
    expect((await POST(signedRequest())).status).toBe(200);
  });

  it("rejects a bad signature", async () => {
    const { POST } = await import("./route");
    expect((await POST(signedRequest({ signature: "t=1,v1=bad" }))).status).toBe(400);
  });

  it("fulfils a retry of a delivery that was cut off mid-way", async () => {
    const { POST } = await import("./route");
    // The first delivery never finishes: the Worker is stopped inside fulfilment,
    // so neither its success path nor its catch block runs.
    fulfil.mockReturnValueOnce(new Promise(() => {}));
    void POST(checkoutCompleted());
    await vi.waitFor(() => expect(fulfil).toHaveBeenCalledTimes(1));

    // Stripe's first retry comes minutes later at the earliest.
    fakeRedis.advanceSeconds(5 * 60);
    fulfil.mockResolvedValueOnce(OK_OUTCOME);
    const retry = await POST(checkoutCompleted());

    expect(retry.status).toBe(200);
    expect(fulfil).toHaveBeenCalledTimes(2);
  });

  it("does not fulfil an event twice once it succeeded", async () => {
    const { POST } = await import("./route");
    fulfil.mockResolvedValue(OK_OUTCOME);

    expect((await POST(checkoutCompleted())).status).toBe(200);
    fakeRedis.advanceSeconds(60 * 60);
    expect((await POST(checkoutCompleted())).status).toBe(200);

    expect(fulfil).toHaveBeenCalledTimes(1);
  });

  it("asks Stripe to retry later while the same event is still being fulfilled", async () => {
    const { POST } = await import("./route");
    let finish!: () => void;
    fulfil.mockReturnValueOnce(
      new Promise((resolve) => (finish = () => resolve(OK_OUTCOME))),
    );
    const first = POST(checkoutCompleted());
    await vi.waitFor(() => expect(fulfil).toHaveBeenCalledTimes(1));

    const second = await POST(checkoutCompleted());

    expect(second.status).toBeGreaterThanOrEqual(400);
    expect(fulfil).toHaveBeenCalledTimes(1);
    finish();
    expect((await first).status).toBe(200);
  });

  it("lets Stripe retry an event whose fulfilment threw", async () => {
    const { POST } = await import("./route");
    fulfil.mockRejectedValueOnce(new Error("db down"));
    expect((await POST(checkoutCompleted())).status).toBe(500);

    fulfil.mockResolvedValueOnce(OK_OUTCOME);
    expect((await POST(checkoutCompleted())).status).toBe(200);
    expect(fulfil).toHaveBeenCalledTimes(2);
  });

  it("still answers 200 when the success mark cannot be written", async () => {
    const { POST } = await import("./route");
    fulfil.mockResolvedValue(OK_OUTCOME);
    const set = fakeRedis.client.set;
    fakeRedis.client.set = vi.fn(async (key, value, opts) => {
      if (value === "done") throw new Error("redis down");
      return set(key, value, opts);
    });
    try {
      expect((await POST(checkoutCompleted())).status).toBe(200);
    } finally {
      fakeRedis.client.set = set;
    }
  });
});
