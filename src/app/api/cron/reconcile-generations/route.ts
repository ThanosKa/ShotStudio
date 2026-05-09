import type { NextRequest } from "next/server";
import { runReconciliation } from "@/lib/generation/reconciler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Wire into vercel.json:
 *   { "crons": [{ "path": "/api/cron/reconcile-generations", "schedule": "*\/10 * * * *" }] }
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return new Response("Cron not configured", { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const summary = await runReconciliation();
  return Response.json(summary);
}
