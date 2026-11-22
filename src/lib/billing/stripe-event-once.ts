import type { Logger } from "pino";
import { redis } from "@/lib/redis";

const PROCESSING_TTL_SECONDS = 120;
const DONE_TTL_SECONDS = 60 * 60 * 24;

export type DeliveryResult<T> =
  | { kind: "ran"; result: T }
  | { kind: "in_progress" }
  | { kind: "duplicate" };

/** Key `stripe:event:<id>`. `processing` 120 s; `done` 24 h only if result.ok.
 *  If work throws: delete the claim and rethrow. Without Redis: just run the work. */
export async function runStripeEventOnce<T extends { ok: boolean }>({
  eventId,
  work,
  log,
}: {
  eventId: string;
  work: () => Promise<T>;
  log: Logger;
}): Promise<DeliveryResult<T>> {
  const idemKey = `stripe:event:${eventId}`;
  if (redis) {
    const claimed = await redis.set(idemKey, "processing", {
      nx: true,
      ex: PROCESSING_TTL_SECONDS,
    });
    if (claimed !== "OK") {
      const state = await redis.get(idemKey);
      if (state === "processing" || state === null) {
        return { kind: "in_progress" };
      }
      return { kind: "duplicate" };
    }
  }

  let result: T;
  try {
    result = await work();
  } catch (err) {
    if (redis) await redis.del(idemKey);
    throw err;
  }

  if (redis) {
    try {
      if (result.ok) {
        await redis.set(idemKey, "done", { ex: DONE_TTL_SECONDS });
      } else {
        await redis.del(idemKey);
      }
    } catch (err) {
      log.warn({ err }, "could not record the event's outcome in redis");
    }
  }
  return { kind: "ran", result };
}
