import type { NextRequest } from "next/server";
import { refund } from "@/lib/credits";
import { reapStalePending } from "@/lib/db/queries";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Generation route maxDuration is 300s (5 min); anything pending after 7 min is
// provably orphaned (route was killed without running its in-route refund path).
const STALE_AFTER_MS = 7 * 60 * 1000;

/**
 * Reaps generations stuck in `pending` past the route's maxDuration and refunds
 * the credit. Auth via Vercel Cron's `Authorization: Bearer ${CRON_SECRET}` header.
 *
 * Wire into vercel.json:
 *   { "crons": [{ "path": "/api/cron/reconcile-generations", "schedule": "*\/10 * * * *" }] }
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return new Response("Cron not configured", { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const requestId = crypto.randomUUID();
  const log = logger.child({ action: "cron.reconcile_generations", requestId });

  const cutoff = new Date(Date.now() - STALE_AFTER_MS);
  const reaped = await reapStalePending(cutoff);

  const results = await Promise.allSettled(
    reaped.map((row) =>
      refund(row.userId, 1, {
        reason: "reconciler_timeout",
        generationId: row.id,
      }),
    ),
  );

  let refunded = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      refunded += 1;
    } else {
      const row = reaped[i];
      log.error(
        { err: r.reason, userId: row.userId, generationId: row.id },
        "refund failed for reaped generation",
      );
    }
  });

  log.info({ reaped: reaped.length, refunded }, "reconciler done");
  return Response.json({ reaped: reaped.length, refunded });
}
