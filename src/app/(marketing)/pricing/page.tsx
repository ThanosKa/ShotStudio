import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { LandingPricing } from "@/components/marketing/landing-pricing";
import { FAQ } from "@/components/marketing/faq";

export const metadata: Metadata = {
  title: "Pricing — ShotStudio",
  description:
    "One-time credit packs for App Store screenshot generation. Starter $7, Growth $17, Studio $37. No subscription.",
};

export default function PricingPage() {
  return (
    <>
      <Section
        eyebrow="Pricing"
        title="Three packs. Buy what you need."
        description="One credit = one polished four-shot set. Failed generations refund automatically. Credits never expire."
        className="border-t-0"
      >
        <LandingPricing />
        <p className="mt-8 text-sm text-muted-foreground">
          VAT/sales tax is calculated at checkout via Stripe Tax. Coupon codes
          (including 100%-off partnership codes) apply on the Stripe Checkout
          page.
        </p>
      </Section>

      <Section eyebrow="FAQ" title="Common questions">
        <FAQ />
      </Section>
    </>
  );
}
