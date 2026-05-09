import { auth, currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { CREDIT_PACKAGE_IDS, getCreditPackage } from "@/lib/packages";
import { checkoutRateLimit, rateLimitHeaders } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  packageId: z.enum(CREDIT_PACKAGE_IDS),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function jsonError(status: number, error: string, init?: ResponseInit) {
  return Response.json({ error }, { status, ...init });
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.child({ action: "checkout", requestId });

  const { userId } = await auth();
  if (!userId) return jsonError(401, "Unauthorized");

  const rl = await checkoutRateLimit.limit(userId);
  if (!rl.success) {
    return jsonError(429, "Too many checkout attempts — please wait a moment.", {
      headers: {
        ...rateLimitHeaders(rl),
        "Retry-After": String(Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000))),
      },
    });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Invalid request body");

  if (!process.env.STRIPE_SECRET_KEY) {
    log.warn("STRIPE_SECRET_KEY not set — checkout disabled");
    return jsonError(503, "Checkout is not configured yet.");
  }

  try {
    const pack = getCreditPackage(parsed.data.packageId);

    if (!pack) return jsonError(404, "Package unavailable");
    if (!pack.stripePriceId) return jsonError(503, "Package not configured");

    const { stripe } = await import("@/lib/stripe");
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pack.stripePriceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      success_url: `${APP_URL}/home?purchase=success`,
      cancel_url: `${APP_URL}/pricing?purchase=cancelled`,
      metadata: {
        userId,
        packageId: pack.id,
        credits: String(pack.credits),
      },
    });

    if (!session.url) return jsonError(500, "No checkout URL");
    return Response.json({ checkoutUrl: session.url });
  } catch (err) {
    log.error({ err, userId }, "checkout failed");
    return jsonError(500, "Checkout failed. Please try again.");
  }
}
