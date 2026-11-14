import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { runCheckoutFulfillment } from "@/lib/billing/checkout";

// With no Redis (local dev), nothing guards a repeated delivery: it fulfils
// again, and `grant()` is the only protection against a double credit.

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
vi.mock("@/lib/redis", () => ({ redis: null }));
vi.mock("@/lib/billing/checkout", () => ({ runCheckoutFulfillment: vi.fn() }));

const fulfil = vi.mocked(runCheckoutFulfillment);

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

describe("POST /api/webhooks/stripe without Redis", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
    fulfil.mockReset();
  });

  it("runs fulfilment on every delivery of the same event", async () => {
    const { POST } = await import("./route");
    fulfil.mockResolvedValue({ kind: "already_granted", userId: "u_buy", balance: 5 });

    expect((await POST(checkoutCompleted())).status).toBe(200);
    expect((await POST(checkoutCompleted())).status).toBe(200);

    expect(fulfil).toHaveBeenCalledTimes(2);
  });
});
