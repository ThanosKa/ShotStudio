import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

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
vi.mock("@/lib/redis", () => ({ redis: null }));
vi.mock("@/lib/billing/checkout", () => ({ runCheckoutFulfillment: vi.fn() }));

function signedRequest(signature?: string) {
  const payload = JSON.stringify({ id: "evt_test", object: "event", type: "customer.updated" });
  const header =
    signature ?? real.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  return new NextRequest("https://example.test/api/webhooks/stripe", {
    method: "POST",
    body: payload,
    headers: { "stripe-signature": header },
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
  });

  it("accepts a correctly signed event where crypto is async only", async () => {
    const { POST } = await import("./route");
    expect((await POST(signedRequest())).status).toBe(200);
  });

  it("rejects a bad signature", async () => {
    const { POST } = await import("./route");
    expect((await POST(signedRequest("t=1,v1=bad"))).status).toBe(400);
  });
});
