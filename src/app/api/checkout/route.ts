import type { NextRequest } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/billing/checkout";
import { jsonError } from "@/lib/http";
import { CREDIT_PACKAGE_IDS } from "@/lib/packages";
import { checkoutRateLimit } from "@/lib/ratelimit";
import { withAuthenticatedUser } from "@/lib/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  packageId: z.enum(CREDIT_PACKAGE_IDS),
});

export async function POST(req: NextRequest) {
  return withAuthenticatedUser(
    { action: "checkout", rateLimit: checkoutRateLimit },
    async ({ userId, email, log }) => {
      const parsed = Body.safeParse(await req.json().catch(() => null));
      if (!parsed.success) return jsonError(400, "Invalid request body");

      try {
        const outcome = await createCheckoutSession({
          userId,
          packageId: parsed.data.packageId,
          email,
        });

        switch (outcome.kind) {
          case "ok":
            log.info({ packageId: parsed.data.packageId }, "checkout session created");
            return Response.json({ checkoutUrl: outcome.checkoutUrl });
          case "unknown_pack":
            return jsonError(404, "Package unavailable");
          case "pack_unconfigured":
            return jsonError(503, "Package not configured");
        }
      } catch (err) {
        log.error({ err }, "checkout failed");
        return jsonError(500, "Checkout failed. Please try again.");
      }
    },
  );
}
