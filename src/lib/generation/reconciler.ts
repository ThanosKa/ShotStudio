import { refund } from "@/lib/credits";
import { reapStalePending } from "@/lib/db/queries";
import { logger } from "@/lib/logger";

export type ReconcileSummary = {
  reaped: number;
  refunded: number;
  refundFailures: number;
};

// Generation route maxDuration is 300s (5 min); anything pending after 7 min
// is provably orphaned (route was killed without running its in-route refund).
const STALE_AFTER_MS = 7 * 60 * 1000;

export async function runReconciliation(): Promise<ReconcileSummary> {
  const log = logger.child({ action: "reconciler" });

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
  let refundFailures = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      refunded += 1;
    } else {
      refundFailures += 1;
      const row = reaped[i];
      log.error(
        { err: r.reason, userId: row.userId, generationId: row.id },
        "refund failed for reaped generation",
      );
    }
  });

  log.info({ reaped: reaped.length, refunded, refundFailures }, "reconciler done");
  return { reaped: reaped.length, refunded, refundFailures };
}
