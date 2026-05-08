export const CREDIT_PACKAGE_IDS = ["starter", "growth", "studio"] as const;
export type CreditPackageId = (typeof CREDIT_PACKAGE_IDS)[number];

export type CreditPackage = {
  id: CreditPackageId;
  name: string;
  credits: number;
  priceCents: number;
  stripePriceId: string | undefined;
};

export const CREDIT_PACKAGES: Record<CreditPackageId, CreditPackage> = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 1,
    priceCents: 700,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  growth: {
    id: "growth",
    name: "Growth",
    credits: 4,
    priceCents: 1700,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },
  studio: {
    id: "studio",
    name: "Studio",
    credits: 10,
    priceCents: 3700,
    stripePriceId: process.env.STRIPE_PRICE_STUDIO,
  },
};

export function getCreditPackage(id: string): CreditPackage | null {
  if ((CREDIT_PACKAGE_IDS as readonly string[]).includes(id)) {
    return CREDIT_PACKAGES[id as CreditPackageId];
  }
  return null;
}
