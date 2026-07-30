/**
 * Disaster-recovery reconciliation: rebuild `users` and `transactions` in a
 * fresh database from the two systems that still hold authoritative records.
 *
 *   Phase 1 — Clerk  → `users` rows (id + email), credits start at 0.
 *   Phase 2 — Stripe → `transactions` rows of type `purchase`, and the matching
 *                      credit grant, replayed through the SAME `grant()` used
 *                      by the webhook, keyed on the Checkout Session id.
 *
 * Why `grant()` and not raw inserts: `grant()` is idempotent on
 * `transactions.stripe_payment_id` via the PARTIAL unique index, so this script
 * is safe to run repeatedly, and a later duplicate Stripe webhook for the same
 * session is also a no-op. It does NOT send email — customers are not re-mailed
 * about purchases they made months ago.
 *
 * IMPORTANT — this restores PURCHASED credits, not REMAINING credits. Credits
 * that users had already consumed lived only in the lost database. Running this
 * with no adjustment gives every customer back their full lifetime purchase.
 * That is deliberate: over-crediting a handful of paying customers is cheaper
 * than under-crediting them. Use `--since` if you want to limit the window.
 *
 * Usage (requires .env.local with the NEW DATABASE_URL + existing Stripe/Clerk keys):
 *
 *   # 1. Dry run — prints exactly what it would do, writes nothing.
 *   pnpm db:reconcile
 *
 *   # 2. Same, limited to purchases since a date.
 *   pnpm db:reconcile -- --since=2026-01-01
 *
 *   # 3. Apply.
 *   pnpm db:reconcile -- --apply
 */
import { createClerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import { grant } from "@/lib/credits";
import { ensureUser } from "@/lib/db/queries";
import { CREDIT_PACKAGE_LIST, getCreditPackage } from "@/lib/packages";
import { stripe } from "@/lib/stripe";

const APPLY = process.argv.includes("--apply");
const SINCE = (() => {
  const arg = process.argv.find((a) => a.startsWith("--since="));
  if (!arg) return undefined;
  const d = new Date(arg.slice("--since=".length));
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid --since: ${arg}`);
  return Math.floor(d.getTime() / 1000);
})();

function log(...args: unknown[]) {
  console.log(...args);
}

type SessionPlan = {
  sessionId: string;
  createdIso: string;
  userId: string;
  email: string | null;
  packageId: string;
  credits: number;
};

type SkippedSession = {
  sessionId: string;
  createdIso: string;
  reason: string;
};

/** Resolve the package from session metadata, falling back to the line-item price id. */
async function resolvePackageId(
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  const fromMetadata = session.metadata?.packageId ?? null;
  if (fromMetadata && getCreditPackage(fromMetadata)) return fromMetadata;

  // Fallback: the Stripe Price ids are unchanged by the database loss, so a
  // line-item lookup still identifies the pack for sessions written before
  // metadata existed (or where metadata was dropped).
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 10,
  });
  for (const item of lineItems.data) {
    const priceId = typeof item.price === "string" ? item.price : item.price?.id;
    if (!priceId) continue;
    const pack = CREDIT_PACKAGE_LIST.find((p) => p.stripePriceId === priceId);
    if (pack) return pack.id;
  }
  return null;
}

async function phase1BackfillClerkUsers(): Promise<{
  synced: number;
  skipped: number;
}> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("CLERK_SECRET_KEY is not set");
  const clerk = createClerkClient({ secretKey });

  let offset = 0;
  const pageSize = 100;
  let synced = 0;
  let skipped = 0;

  for (;;) {
    const page = await clerk.users.getUserList({ limit: pageSize, offset });
    if (page.data.length === 0) break;

    for (const user of page.data) {
      const email =
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        null;
      if (!email) {
        skipped++;
        log(`  skip  ${user.id} — no email address on the Clerk record`);
        continue;
      }
      if (APPLY) await ensureUser(user.id, email);
      synced++;
      log(`  ${APPLY ? "sync" : "plan"}  ${user.id}  ${email}`);
    }

    offset += page.data.length;
    if (page.data.length < pageSize) break;
  }

  return { synced, skipped };
}

async function phase2ReplayStripePurchases(): Promise<{
  plans: SessionPlan[];
  skipped: SkippedSession[];
}> {
  const plans: SessionPlan[] = [];
  const skipped: SkippedSession[] = [];

  const params: Stripe.Checkout.SessionListParams = { limit: 100 };
  if (SINCE) params.created = { gte: SINCE };

  for await (const session of stripe.checkout.sessions.list(params)) {
    const createdIso = new Date(session.created * 1000).toISOString();

    if (session.payment_status !== "paid") {
      // Unpaid / expired sessions never granted credits — nothing to restore.
      continue;
    }

    const userId =
      session.metadata?.userId ?? session.client_reference_id ?? null;
    if (!userId) {
      skipped.push({
        sessionId: session.id,
        createdIso,
        reason:
          "no userId in metadata or client_reference_id — resolve by hand from customer_details.email",
      });
      continue;
    }

    const packageId = await resolvePackageId(session);
    if (!packageId) {
      skipped.push({
        sessionId: session.id,
        createdIso,
        reason: "could not resolve credit pack from metadata or line items",
      });
      continue;
    }

    const pack = getCreditPackage(packageId);
    if (!pack) {
      skipped.push({
        sessionId: session.id,
        createdIso,
        reason: `unknown package id "${packageId}"`,
      });
      continue;
    }

    plans.push({
      sessionId: session.id,
      createdIso,
      userId,
      email: session.customer_details?.email ?? null,
      packageId: pack.id,
      credits: pack.credits,
    });
  }

  // Oldest first, so the ledger reads chronologically.
  plans.sort((a, b) => a.createdIso.localeCompare(b.createdIso));

  return { plans, skipped };
}

async function main() {
  log(
    APPLY
      ? "MODE: APPLY — this writes to the database in DATABASE_URL"
      : "MODE: DRY RUN — nothing is written. Re-run with --apply to commit.",
  );
  if (SINCE) log(`Window: purchases created on/after ${new Date(SINCE * 1000).toISOString()}`);
  log("");

  log("Phase 1 — Clerk users → users table");
  const clerkResult = await phase1BackfillClerkUsers();
  log(
    `Phase 1 result: ${clerkResult.synced} user(s) ${APPLY ? "synced" : "to sync"}, ${clerkResult.skipped} skipped\n`,
  );

  log("Phase 2 — Stripe paid Checkout Sessions → transactions + credits");
  const { plans, skipped } = await phase2ReplayStripePurchases();

  let granted = 0;
  let failed = 0;
  for (const plan of plans) {
    const label = `  ${plan.createdIso}  ${plan.sessionId}  ${plan.userId}  ${plan.packageId} (+${plan.credits})`;
    if (!APPLY) {
      log(`${label}  [plan]`);
      continue;
    }
    try {
      if (plan.email) await ensureUser(plan.userId, plan.email);
      const balance = await grant(plan.userId, plan.credits, plan.sessionId);
      granted++;
      log(`${label}  → balance ${balance}`);
    } catch (err) {
      failed++;
      log(
        `${label}  !! FAILED: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  log("");
  log("──────── SUMMARY ────────");
  log(`Paid sessions resolved : ${plans.length}`);
  log(`Credits to restore     : ${plans.reduce((n, p) => n + p.credits, 0)}`);
  log(`Distinct customers     : ${new Set(plans.map((p) => p.userId)).size}`);
  if (APPLY) {
    log(`Grants applied         : ${granted}`);
    log(`Grants failed          : ${failed}`);
  }
  if (skipped.length > 0) {
    log("");
    log(`Sessions needing manual review: ${skipped.length}`);
    for (const s of skipped) {
      log(`  ${s.createdIso}  ${s.sessionId}  — ${s.reason}`);
    }
  }
  log("");
  log(
    "NOTE: this restores lifetime PURCHASED credits. Credits already consumed",
  );
  log(
    "      before the database was lost are not deducted — that history is gone.",
  );

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("reconciliation failed:", err);
  process.exit(1);
});
