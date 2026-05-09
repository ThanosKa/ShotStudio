import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { describe, expect, test, vi } from "vitest";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/db/queries";
import { transactions, users } from "@/lib/db/schema";
import { sendCreditsPurchasedEmail } from "@/lib/emails/credits-purchased";
import { runCheckoutFulfillment } from "./checkout";

vi.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      retrieve: vi.fn(async () => ({
        latest_charge: { receipt_url: "https://stripe.test/receipt/x" },
      })),
    },
  },
}));

vi.mock("@/lib/emails/credits-purchased", () => ({
  sendCreditsPurchasedEmail: vi.fn(async () => ({
    data: { id: "msg_x" },
    error: null,
  })),
}));

function sessionFor(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    metadata: { userId: "u_buy", packageId: "growth" },
    client_reference_id: null,
    customer_details: { email: "buyer@test", name: "John Doe" },
    payment_intent: "pi_123",
    amount_total: 1700,
    currency: "usd",
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

describe("runCheckoutFulfillment", () => {
  test("ok: grants pack credits, returns new balance, sends receipt email keyed by event id", async () => {
    await ensureUser("u_buy", "u_buy@test");

    const outcome = await runCheckoutFulfillment({
      session: sessionFor(),
      eventId: "evt_1",
    });

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    expect(outcome.creditsGranted).toBe(4);
    expect(outcome.newBalance).toBe(4);
    expect(outcome.emailSent).toBe(true);

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_buy"));
    expect(u.credits).toBe(4);

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "u_buy"));
    expect(txs).toHaveLength(1);
    expect(txs[0].type).toBe("purchase");
    expect(txs[0].stripePaymentId).toBe("cs_test_123");

    expect(vi.mocked(sendCreditsPurchasedEmail)).toHaveBeenCalledTimes(1);
    const arg = vi.mocked(sendCreditsPurchasedEmail).mock.calls[0][0];
    expect(arg.stripeEventId).toBe("evt_1");
    expect(arg.to).toBe("buyer@test");
    expect(arg.creditsAdded).toBe(4);
    expect(arg.newBalance).toBe(4);
    expect(arg.receiptUrl).toBe("https://stripe.test/receipt/x");
  });

  test("unknown_pack: no grant, no email", async () => {
    await ensureUser("u_pkg", "u_pkg@test");
    vi.mocked(sendCreditsPurchasedEmail).mockClear();

    const outcome = await runCheckoutFulfillment({
      session: sessionFor({
        id: "cs_pkg",
        metadata: { userId: "u_pkg", packageId: "enterprise" },
      }),
      eventId: "evt_pkg",
    });

    expect(outcome).toEqual({ kind: "unknown_pack", packageId: "enterprise" });

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_pkg"));
    expect(u.credits).toBe(0);

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "u_pkg"));
    expect(txs).toHaveLength(0);

    expect(vi.mocked(sendCreditsPurchasedEmail)).not.toHaveBeenCalled();
  });

  test("invalid_metadata: missing userId ⇒ no grant, no email", async () => {
    vi.mocked(sendCreditsPurchasedEmail).mockClear();

    const outcome = await runCheckoutFulfillment({
      session: sessionFor({
        id: "cs_meta",
        metadata: { packageId: "growth" },
        client_reference_id: null,
      }),
      eventId: "evt_meta",
    });

    expect(outcome).toEqual({ kind: "invalid_metadata", missing: "userId" });

    const txs = await db.select().from(transactions);
    expect(txs).toHaveLength(0);
    expect(vi.mocked(sendCreditsPurchasedEmail)).not.toHaveBeenCalled();
  });

  test("user_not_ready: User row missing and no checkout email ⇒ caught, no email", async () => {
    vi.mocked(sendCreditsPurchasedEmail).mockClear();

    const outcome = await runCheckoutFulfillment({
      session: sessionFor({
        id: "cs_ghost",
        metadata: { userId: "ghost", packageId: "growth" },
        customer_details: null,
      }),
      eventId: "evt_ghost",
    });

    expect(outcome).toEqual({ kind: "user_not_ready", userId: "ghost" });

    const txs = await db.select().from(transactions);
    expect(txs).toHaveLength(0);
    expect(vi.mocked(sendCreditsPurchasedEmail)).not.toHaveBeenCalled();
  });
});
