import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { creditPackages } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";

const Body = z.object({
  packageId: z.enum(["starter", "growth", "studio"]),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Invalid body", { status: 400 });

  const [pack] = await db
    .select()
    .from(creditPackages)
    .where(eq(creditPackages.id, parsed.data.packageId))
    .limit(1);

  if (!pack || !pack.active) return new Response("Package unavailable", { status: 404 });
  if (!pack.stripePriceId) return new Response("Package not configured", { status: 503 });

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

  if (!session.url) return new Response("No checkout URL", { status: 500 });

  return Response.json({ checkoutUrl: session.url });
}
