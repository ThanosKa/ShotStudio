import { eq } from "drizzle-orm";
import type { Logger } from "pino";
import type Stripe from "stripe";
import { grant } from "@/lib/credits";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ensureUser } from "@/lib/db/queries";
import { sendCreditsPurchasedEmail } from "@/lib/emails/credits-purchased";
import { logger } from "@/lib/logger";
import { getCreditPackage } from "@/lib/packages";
import { stripe } from "@/lib/stripe";
import { APP_URL, pluralize } from "@/lib/utils";

export type CreateCheckoutSessionInput = {
  userId: string;
  packageId: string;
  email: string | null;
};

export type CreateCheckoutSessionOutcome =
  | { kind: "ok"; checkoutUrl: string }
  | { kind: "unknown_pack"; packageId: string }
  | { kind: "pack_unconfigured"; packageId: string };

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CreateCheckoutSessionOutcome> {
  const pack = getCreditPackage(input.packageId);
  if (!pack) return { kind: "unknown_pack", packageId: input.packageId };
  if (!pack.stripePriceId) {
    return { kind: "pack_unconfigured", packageId: input.packageId };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: pack.stripePriceId, quantity: 1 }],
    customer_email: input.email ?? undefined,
    client_reference_id: input.userId,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    success_url: `${APP_URL}/home?purchase=success`,
    cancel_url: `${APP_URL}/pricing?purchase=cancelled`,
    metadata: {
      userId: input.userId,
      packageId: pack.id,
    },
  });

  if (!session.url) throw new Error("Stripe returned a session with no url");
  return { kind: "ok", checkoutUrl: session.url };
}

export type CheckoutFulfillmentInput = {
  session: Stripe.Checkout.Session;
  eventId: string;
};

export type CheckoutFulfillmentOutcome =
  | {
      kind: "ok";
      userId: string;
      creditsGranted: number;
      newBalance: number;
      emailSent: boolean;
    }
  | { kind: "invalid_metadata"; missing: "userId" | "packageId" }
  | { kind: "unknown_pack"; packageId: string }
  | { kind: "user_not_ready"; userId: string };

function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

async function fetchReceiptUrl(
  paymentIntentId: string | null,
  log: Logger,
): Promise<string | null> {
  if (!paymentIntentId) return null;
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    const charge = pi.latest_charge;
    return charge && typeof charge !== "string"
      ? charge.receipt_url ?? null
      : null;
  } catch (err) {
    log.warn({ err, paymentIntentId }, "failed to fetch receipt url");
    return null;
  }
}

export async function runCheckoutFulfillment(
  input: CheckoutFulfillmentInput,
): Promise<CheckoutFulfillmentOutcome> {
  const { session, eventId } = input;
  const userId = session.metadata?.userId ?? session.client_reference_id ?? null;
  const packageId = session.metadata?.packageId ?? null;
  const log = logger.child({
    action: "checkout_fulfillment",
    sessionId: session.id,
    eventId,
    userId,
    packageId,
  });

  if (!userId) return { kind: "invalid_metadata", missing: "userId" };
  if (!packageId) return { kind: "invalid_metadata", missing: "packageId" };

  const pack = getCreditPackage(packageId);
  if (!pack) return { kind: "unknown_pack", packageId };

  const checkoutEmail = session.customer_details?.email ?? null;
  if (checkoutEmail) {
    await ensureUser(userId, checkoutEmail);
  } else {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!existing) {
      log.warn("user row absent and no checkout email — Clerk webhook race");
      return { kind: "user_not_ready", userId };
    }
  }

  const piPromise = fetchReceiptUrl(
    typeof session.payment_intent === "string" ? session.payment_intent : null,
    log,
  );

  const newBalance = await grant(userId, pack.credits, session.id);
  log.info({ creditsAdded: pack.credits, newBalance }, "credits granted");

  const receiptUrl = await piPromise;

  let emailSent = false;
  if (checkoutEmail) {
    const { data, error } = await sendCreditsPurchasedEmail({
      to: checkoutEmail,
      stripeEventId: eventId,
      firstName: session.customer_details?.name?.split(" ")[0] ?? null,
      packageName: `${pack.name} — ${pack.credits} ${pluralize(pack.credits, "set")}`,
      creditsAdded: pack.credits,
      newBalance,
      amountFormatted: formatAmount(
        session.amount_total ?? pack.priceCents,
        session.currency ?? "usd",
      ),
      receiptUrl,
    });
    if (error) {
      log.error({ err: error }, "purchase email failed");
    } else {
      emailSent = true;
      log.info({ emailId: data?.id }, "purchase email sent");
    }
  } else {
    log.warn("no email available for purchase confirmation");
  }

  return {
    kind: "ok",
    userId,
    creditsGranted: pack.credits,
    newBalance,
    emailSent,
  };
}
