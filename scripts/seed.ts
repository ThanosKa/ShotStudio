import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditPackages } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

const PACKS = [
  {
    id: "starter",
    name: "Starter",
    credits: 1,
    priceCents: 700,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? null,
    active: true,
  },
  {
    id: "growth",
    name: "Growth",
    credits: 4,
    priceCents: 1700,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH ?? null,
    active: true,
  },
  {
    id: "studio",
    name: "Studio",
    credits: 10,
    priceCents: 3700,
    stripePriceId: process.env.STRIPE_PRICE_STUDIO ?? null,
    active: true,
  },
];

async function main() {
  await db
    .insert(creditPackages)
    .values(PACKS)
    .onConflictDoUpdate({
      target: creditPackages.id,
      set: {
        name: sql`excluded.name`,
        credits: sql`excluded.credits`,
        priceCents: sql`excluded.price_cents`,
        stripePriceId: sql`excluded.stripe_price_id`,
        active: sql`excluded.active`,
      },
    });

  const rows = await db.select().from(creditPackages);
  logger.info({ rows }, "credit_packages seeded");
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "seed failed");
  process.exit(1);
});
