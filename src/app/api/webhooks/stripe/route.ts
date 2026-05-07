import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { grant } from "@/lib/credits";
import { db } from "@/lib/db";
import { creditPackages, users } from "@/lib/db/schema";
import { sendCreditsPurchasedEmail } from "@/lib/emails/credits-purchased";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe";

const WEBHOOK_SECRET: string = (() => {
  const v = process.env.STRIPE_WEBHOOK_SECRET;
  if (!v) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return v;
})();

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24; // 24h

function formatAmount(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() })
    .format(amountCents / 100);
}

export async function POST(req: NextRequest) {
  const log = logger.child({ action: "stripe_webhook" });

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
  const claimed = await redis.set(idemKey, "1", { nx: true, ex: IDEMPOTENCY_TTL_SECONDS });
  if (claimed !== "OK") {
    scoped.info("duplicate event — already processed");
    return new Response("OK", { status: 200 });
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

      const [pack] = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.id, packageId))
        .limit(1);

      if (!pack) {
        handler.error("unknown package on completed session");
        return new Response("OK", { status: 200 });
      }

      const newBalance = await grant(userId, pack.credits, session.id);
      handler.info({ creditsAdded: pack.credits, newBalance }, "credits granted");

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const email = user?.email ?? session.customer_details?.email ?? null;

      let receiptUrl: string | null = null;
      if (typeof session.payment_intent === "string") {
        try {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ["latest_charge"],
          });
          const charge = pi.latest_charge;
          if (charge && typeof charge !== "string") receiptUrl = charge.receipt_url ?? null;
        } catch (err) {
          handler.warn({ err, paymentIntent: session.payment_intent }, "failed to fetch receipt url");
        }
      }

      if (email) {
        const { data, error } = await sendCreditsPurchasedEmail({
          to: email,
          stripeEventId: event.id,
          firstName: session.customer_details?.name?.split(" ")[0] ?? null,
          packageName: `${pack.name} — ${pack.credits} ${pack.credits === 1 ? "set" : "sets"}`,
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
    await redis.del(idemKey);
    scoped.error({ err }, "stripe webhook handler failed");
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
