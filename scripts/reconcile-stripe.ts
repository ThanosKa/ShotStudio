import { createClerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import { grant } from "@/lib/credits";
import { createUserIfAbsent, ensureUser, pickUserEmail } from "@/lib/identity/user-sync";
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

async function resolvePackageId(
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  const fromMetadata = session.metadata?.packageId ?? null;
  if (fromMetadata && getCreditPackage(fromMetadata)) return fromMetadata;

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
      const email = pickUserEmail({
        addresses: user.emailAddresses.map((a) => ({ id: a.id, email: a.emailAddress })),
        primaryId: user.primaryEmailAddressId,
      });
      if (!email) {
        skipped++;
        log(`  skip  ${user.id} — no email address on the Clerk record`);
        continue;
      }
      if (APPLY) await ensureUser({ userId: user.id, email });
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
      if (plan.email) await createUserIfAbsent({ userId: plan.userId, email: plan.email });
      const { balance } = await grant({ userId: plan.userId, n: plan.credits, stripePaymentId: plan.sessionId });
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
