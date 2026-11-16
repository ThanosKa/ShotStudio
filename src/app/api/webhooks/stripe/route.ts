import type { NextRequest } from "next/server";
import type { Logger } from "pino";
import type Stripe from "stripe";
import { runCheckoutFulfillment } from "@/lib/billing/checkout";
import { type DeliveryResult, runStripeEventOnce } from "@/lib/billing/stripe-event-once";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET: string = (() => {
  const v = process.env.STRIPE_WEBHOOK_SECRET;
  if (!v) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return v;
})();

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
    event = await stripe.webhooks.constructEventAsync(raw, sig, WEBHOOK_SECRET);
  } catch (err) {
    log.error({ err }, "stripe signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  const scoped = log.child({ eventId: event.id, eventType: event.type });

  // Only an error from the handler (or from deleting its claim) is logged here;
  // a Redis error while claiming leaves the route unlogged, as it always has.
  let handlerFailed = false;
  let delivery: DeliveryResult<Response>;
  try {
    delivery = await runStripeEventOnce(
      event.id,
      () =>
        handleEvent(event, scoped).catch((err: unknown) => {
          handlerFailed = true;
          throw err;
        }),
      scoped,
    );
  } catch (err) {
    if (!handlerFailed) throw err;
    scoped.error({ err }, "stripe webhook handler failed");
    return new Response("Handler error", { status: 500 });
  }

  switch (delivery.kind) {
    case "in_progress":
      scoped.info("event already being processed — letting Stripe retry");
      return new Response("Already processing", { status: 409 });
    case "duplicate":
      scoped.debug("duplicate event — already processed");
      return new Response("OK", { status: 200 });
    case "ran":
      return delivery.result;
  }
}

async function handleEvent(event: Stripe.Event, scoped: Logger): Promise<Response> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const outcome = await runCheckoutFulfillment({
      session,
      eventId: event.id,
    });

    switch (outcome.kind) {
      case "ok":
        scoped.info(
          {
            userId: outcome.userId,
            creditsGranted: outcome.creditsGranted,
            newBalance: outcome.newBalance,
            emailSent: outcome.emailSent,
          },
          "checkout fulfilled",
        );
        return new Response("OK", { status: 200 });
      case "already_granted":
        scoped.info({ userId: outcome.userId }, "checkout already fulfilled");
        return new Response("OK", { status: 200 });
      case "invalid_metadata":
        scoped.error({ missing: outcome.missing }, "missing session metadata");
        return new Response("OK", { status: 200 });
      case "unknown_pack":
        scoped.error({ packageId: outcome.packageId }, "unknown package");
        return new Response("OK", { status: 200 });
      case "user_not_ready":
        scoped.warn({ userId: outcome.userId }, "user not ready — letting Stripe retry");
        return new Response("User not ready", { status: 500 });
    }
  } else {
    scoped.debug("unhandled event type");
  }

  return new Response("OK", { status: 200 });
}
