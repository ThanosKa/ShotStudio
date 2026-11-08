import type { NextRequest } from "next/server";
import type { Logger } from "pino";
import type Stripe from "stripe";
import { runCheckoutFulfillment } from "@/lib/billing/checkout";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET: string = (() => {
  const v = process.env.STRIPE_WEBHOOK_SECRET;
  if (!v) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return v;
})();

// Two-step claim on `stripe:event:<id>`. "processing" is short-lived, so a
// Worker stopped mid-fulfilment (no catch block runs) frees the event for
// Stripe's retry. "done" is written only after success. `grant()` stays the
// guard against double credit if two deliveries ever overlap.
const PROCESSING_TTL_SECONDS = 120;
const DONE_TTL_SECONDS = 60 * 60 * 24;

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

  const idemKey = `stripe:event:${event.id}`;
  if (redis) {
    const claimed = await redis.set(idemKey, "processing", {
      nx: true,
      ex: PROCESSING_TTL_SECONDS,
    });
    if (claimed !== "OK") {
      // Anything but "processing" is a finished event; "1" is the old format.
      const state = await redis.get(idemKey);
      if (state === "processing" || state === null) {
        scoped.info("event already being processed — letting Stripe retry");
        return new Response("Already processing", { status: 409 });
      }
      scoped.debug("duplicate event — already processed");
      return new Response("OK", { status: 200 });
    }
  }

  let response: Response;
  try {
    response = await handleEvent(event, scoped);
  } catch (err) {
    if (redis) await redis.del(idemKey);
    scoped.error({ err }, "stripe webhook handler failed");
    return new Response("Handler error", { status: 500 });
  }

  if (redis) {
    try {
      if (response.ok) {
        await redis.set(idemKey, "done", { ex: DONE_TTL_SECONDS });
      } else {
        await redis.del(idemKey);
      }
    } catch (err) {
      // The claim expires by itself; a retry then finds grant() already applied.
      scoped.warn({ err }, "could not record the event's outcome in redis");
    }
  }
  return response;
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
