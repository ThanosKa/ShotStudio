import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { grant } from "@/lib/credits";
import { ensureUser } from "@/lib/db/queries";
import { sendCreditsPurchasedEmail } from "@/lib/emails/credits-purchased";
import { logger } from "@/lib/logger";
import { getCreditPackage } from "@/lib/packages";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe";
import { pluralize } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET: string = (() => {
  const v = process.env.STRIPE_WEBHOOK_SECRET;
  if (!v) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return v;
})();

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24;

function formatAmount(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() })
    .format(amountCents / 100);
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.child({ action: "stripe_webhook", requestId });

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    log.warn("missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, WEBHOOK_SECRET);
  } catch (err) {
    log.error({ err }, "stripe signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  const scoped = log.child({ eventId: event.id, eventType: event.type });

  const idemKey = `stripe:event:${event.id}`;
  if (redis) {
    const claimed = await redis.set(idemKey, "1", { nx: true, ex: IDEMPOTENCY_TTL_SECONDS });
    if (claimed !== "OK") {
      scoped.info("duplicate event — already processed");
      return new Response("OK", { status: 200 });
    }
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id ?? null;
      const packageId = session.metadata?.packageId ?? null;
      const handler = scoped.child({ sessionId: session.id, userId, packageId });

      if (!userId || !packageId) {
        handler.error("missing userId or packageId on completed session");
        return new Response("OK", { status: 200 });
      }

      const pack = getCreditPackage(packageId);

      if (!pack) {
        handler.error("unknown package on completed session");
        return new Response("OK", { status: 200 });
      }

      // Kick off the receipt-URL fetch in parallel with our DB writes — it
      // doesn't depend on the user/grant work and otherwise adds 200–500ms to
      // the critical path.
      const piPromise: Promise<Stripe.PaymentIntent | null> =
        typeof session.payment_intent === "string"
          ? stripe.paymentIntents
              .retrieve(session.payment_intent, { expand: ["latest_charge"] })
              .catch((err) => {
                handler.warn({ err, paymentIntent: session.payment_intent }, "failed to fetch receipt url");
                return null;
              })
          : Promise.resolve(null);

      // Close the Clerk-vs-Stripe webhook race: if the Clerk user.created event
      // hasn't been processed yet, ensureUser() upserts a row so grant() can
      // attach credits.
      const checkoutEmail = session.customer_details?.email ?? null;
      if (checkoutEmail) await ensureUser(userId, checkoutEmail);

      const newBalance = await grant(userId, pack.credits, session.id);
      handler.info({ creditsAdded: pack.credits, newBalance }, "credits granted");

      const pi = await piPromise;
      const charge = pi?.latest_charge;
      const receiptUrl =
        charge && typeof charge !== "string" ? charge.receipt_url ?? null : null;

      if (checkoutEmail) {
        const { data, error } = await sendCreditsPurchasedEmail({
          to: checkoutEmail,
          stripeEventId: event.id,
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
          handler.error({ err: error }, "purchase email failed");
        } else {
          handler.info({ emailId: data?.id }, "purchase email sent");
        }
      } else {
        handler.warn("no email available for purchase confirmation");
      }
    } else {
      scoped.debug("unhandled event type");
    }
  } catch (err) {
    if (redis) await redis.del(idemKey);
    scoped.error({ err }, "stripe webhook handler failed");
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
