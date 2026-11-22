import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { describe, expect, test, vi } from "vitest";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/identity/user-sync";
import { transactions, users } from "@/lib/db/schema";
import { sendCreditsPurchasedEmail } from "@/lib/emails/credits-purchased";
import { stripe } from "@/lib/stripe";
import { createCheckoutSession, runCheckoutFulfillment } from "./checkout";

vi.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      retrieve: vi.fn(async () => ({
        latest_charge: { receipt_url: "https://stripe.test/receipt/x" },
      })),
    },
    checkout: {
      sessions: {
        create: vi.fn(async () => ({
          id: "cs_new_1",
          url: "https://checkout.stripe.test/c/cs_new_1",
        })),
      },
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
    await ensureUser({ userId: "u_buy", email: "u_buy@test" });

    const outcome = await runCheckoutFulfillment({
      session: sessionFor(),
      eventId: "evt_1",
    });

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    expect(outcome.creditsGranted).toBe(5);
    expect(outcome.newBalance).toBe(5);
    expect(outcome.emailSent).toBe(true);

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_buy"));
    expect(u.credits).toBe(5);

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
    expect(arg.creditsAdded).toBe(5);
    expect(arg.newBalance).toBe(5);
  });

  test("already_granted: a replayed session grants nothing and sends no second email", async () => {
    await ensureUser({ userId: "u_buy", email: "u_buy@test" });
    await runCheckoutFulfillment({ session: sessionFor(), eventId: "evt_1" });
    vi.mocked(sendCreditsPurchasedEmail).mockClear();

    const outcome = await runCheckoutFulfillment({ session: sessionFor(), eventId: "evt_1" });

    expect(outcome.kind).toBe("already_granted");
    expect(vi.mocked(sendCreditsPurchasedEmail)).not.toHaveBeenCalled();
    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_buy"));
    expect(u.credits).toBe(5);
  });

  test("unknown_pack: no grant, no email", async () => {
    await ensureUser({ userId: "u_pkg", email: "u_pkg@test" });
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

describe("createCheckoutSession", () => {
  test("ok: builds Stripe session with userId metadata, returns checkout url", async () => {
    vi.mocked(stripe.checkout.sessions.create).mockClear();

    const outcome = await createCheckoutSession({
      userId: "u_pay",
      packageId: "growth",
      email: "u_pay@test",
    });

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    expect(outcome.checkoutUrl).toBe("https://checkout.stripe.test/c/cs_new_1");

    expect(vi.mocked(stripe.checkout.sessions.create)).toHaveBeenCalledTimes(1);
    const arg = vi.mocked(stripe.checkout.sessions.create).mock.calls[0][0]!;
    expect(arg.mode).toBe("payment");
    expect(arg.client_reference_id).toBe("u_pay");
    expect(arg.customer_email).toBe("u_pay@test");
    expect(arg.metadata).toMatchObject({ userId: "u_pay", packageId: "growth" });
    expect(arg.line_items?.[0]).toMatchObject({
      price: "price_test_growth",
      quantity: 1,
    });
  });

  test("unknown_pack: no Stripe call", async () => {
    vi.mocked(stripe.checkout.sessions.create).mockClear();

    const outcome = await createCheckoutSession({
      userId: "u_pay",
      packageId: "enterprise",
      email: "u_pay@test",
    });

    expect(outcome).toEqual({ kind: "unknown_pack", packageId: "enterprise" });
    expect(vi.mocked(stripe.checkout.sessions.create)).not.toHaveBeenCalled();
  });
});

describe("runCheckoutFulfillment and the User Email", () => {
  function paidWith(email: string) {
    return sessionFor({
      customer_details: { email, name: "John Doe" } as Stripe.Checkout.Session["customer_details"],
    });
  }

  async function userRow(userId: string) {
    const [u] = await db
      .select({ email: users.email, credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));
    return u;
  }

  test("an existing User who pays with another email gets the Credits and keeps their email", async () => {
    await ensureUser({ userId: "u_buy", email: "a@test" });
    vi.mocked(sendCreditsPurchasedEmail).mockClear();

    const outcome = await runCheckoutFulfillment({
      session: paidWith("b@test"),
      eventId: "evt_other_email",
    });

    expect(outcome).toMatchObject({ kind: "ok", creditsGranted: 5, newBalance: 5 });
    expect(await userRow("u_buy")).toEqual({ email: "a@test", credits: 5 });

    expect(vi.mocked(sendCreditsPurchasedEmail)).toHaveBeenCalledTimes(1);
    const arg = vi.mocked(sendCreditsPurchasedEmail).mock.calls[0][0];
    expect(arg.to).toBe("b@test");
    expect(arg.stripeEventId).toBe("evt_other_email");
  });

  test("an existing User who pays with another User's email gets the Credits and neither email changes", async () => {
    await ensureUser({ userId: "u_buy", email: "a@test" });
    await ensureUser({ userId: "u_other", email: "b@test" });

    const outcome = await runCheckoutFulfillment({
      session: paidWith("b@test"),
      eventId: "evt_clash_existing",
    });

    expect(outcome).toMatchObject({ kind: "ok", creditsGranted: 5, newBalance: 5 });
    expect(await userRow("u_buy")).toEqual({ email: "a@test", credits: 5 });
    expect(await userRow("u_other")).toEqual({ email: "b@test", credits: 0 });
  });

  test("with no User row and a free Stripe email, the row is created with that email and the Credits are Granted", async () => {
    const outcome = await runCheckoutFulfillment({
      session: paidWith("new@test"),
      eventId: "evt_new_row",
    });

    expect(outcome).toMatchObject({ kind: "ok", creditsGranted: 5, newBalance: 5 });
    expect(await userRow("u_buy")).toEqual({ email: "new@test", credits: 5 });
  });

  test("with no User row and a Stripe email owned by another User, the outcome is user_not_ready and nothing is written", async () => {
    await ensureUser({ userId: "u_other", email: "b@test" });
    vi.mocked(sendCreditsPurchasedEmail).mockClear();

    const outcome = await runCheckoutFulfillment({
      session: paidWith("b@test"),
      eventId: "evt_clash_absent",
    });

    expect(outcome).toEqual({ kind: "user_not_ready", userId: "u_buy" });
    expect(await userRow("u_buy")).toBeUndefined();
    expect(await userRow("u_other")).toEqual({ email: "b@test", credits: 0 });
    expect(await db.select().from(transactions)).toHaveLength(0);
    expect(vi.mocked(sendCreditsPurchasedEmail)).not.toHaveBeenCalled();
  });

  test("once User Sync has created the buyer's row, Stripe's retry Grants the Credits", async () => {
    await ensureUser({ userId: "u_other", email: "b@test" });
    const session = paidWith("b@test");
    await runCheckoutFulfillment({ session, eventId: "evt_retry" });

    await ensureUser({ userId: "u_buy", email: "a@test" });
    const retry = await runCheckoutFulfillment({ session, eventId: "evt_retry" });

    expect(retry).toMatchObject({ kind: "ok", creditsGranted: 5, newBalance: 5 });
    expect(await userRow("u_buy")).toEqual({ email: "a@test", credits: 5 });
    expect(await userRow("u_other")).toEqual({ email: "b@test", credits: 0 });
  });
});
