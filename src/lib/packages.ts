export const CREDIT_PACKAGE_IDS = ["starter", "growth", "studio"] as const;
export type CreditPackageId = (typeof CREDIT_PACKAGE_IDS)[number];

export type CreditPackage = {
  id: CreditPackageId;
  name: string;
  credits: number;
  priceCents: number;
  stripePriceId: string | undefined;
  featured?: boolean;
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
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
    featured: true,
  },
  studio: {
    id: "studio",
    name: "Studio",
    credits: 12,
    priceCents: 3700,
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

export function getCreditPackage(id: string): CreditPackage | null {
  if ((CREDIT_PACKAGE_IDS as readonly string[]).includes(id)) {
    return CREDIT_PACKAGES[id as CreditPackageId];
  }
  return null;
}
