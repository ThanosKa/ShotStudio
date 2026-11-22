export const CREDIT_PACKAGE_IDS = ["starter", "growth", "studio"] as const;
export type CreditPackageId = (typeof CREDIT_PACKAGE_IDS)[number];

export type CreditPackage = {
  id: CreditPackageId;
  name: string;
  credits: number;
  priceCents: number;
  stripePriceId: string | undefined;
  featured?: boolean;
  /** Short phrase shown after the Set count on the pricing card. */
  purpose?: string;
};

export const CREDIT_PACKAGES: Record<CreditPackageId, CreditPackage> = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 2,
    priceCents: 700,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  growth: {
    id: "growth",
    name: "Growth",
    credits: 5,
    priceCents: 1700,
    purpose: "for iterating",
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
    featured: true,
  },
  studio: {
    id: "studio",
    name: "Studio",
    credits: 12,
    priceCents: 3700,
    purpose: "for portfolios",
    stripePriceId: process.env.STRIPE_PRICE_STUDIO,
  },
};

export const CREDIT_PACKAGE_LIST: CreditPackage[] = CREDIT_PACKAGE_IDS.map(
  (id) => CREDIT_PACKAGES[id],
);

export function formatPriceUSD(priceCents: number): string {
  const dollars = priceCents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

function isCreditPackageId(id: string): id is CreditPackageId {
  return CREDIT_PACKAGE_IDS.some((packageId) => packageId === id);
}

export function getCreditPackage(id: string): CreditPackage | null {
  if (isCreditPackageId(id)) {
    return CREDIT_PACKAGES[id];
  }
  return null;
}

/** One Credit is one Set, so the count comes from the pack's own Credits. */
export function packBlurb(pack: Pick<CreditPackage, "credits" | "purpose">): string {
  const sets = `${pack.credits} ${pack.credits === 1 ? "set" : "sets"}`;
  return pack.purpose ? `${sets} — ${pack.purpose}` : sets;
}
