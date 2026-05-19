import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { LandingPricing } from "@/components/marketing/landing-pricing";
import { FAQ } from "@/components/marketing/faq";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  breadcrumbSchema,
  faqPageSchema,
  pricingProductSchema,
} from "@/lib/marketing/schema";
import { APP_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One-time credit packs for App Store screenshot generation. Starter $7, Growth $17, Studio $37. No subscription.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — ShotStudio",
    description:
      "One-time credit packs for App Store screenshots. Starter $7, Growth $17, Studio $37. No subscription.",
    url: `${APP_URL}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            pricingProductSchema(),
            faqPageSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Pricing", url: `${APP_URL}/pricing` },
            ]),
          ],
        }}
      />
      <Section
        as="h1"
        eyebrow="Pricing"
        title="Three packs. Buy what you need."
        description="1 credit = 1 set = 3 polished shots. Credits never expire, failed generations auto-refund, no subscription."
        className="border-t-0"
      >
        <LandingPricing />
        <p className="mt-8 text-sm text-muted-foreground">
          VAT/sales tax is calculated at checkout via Stripe Tax. Coupon codes
          (including 100%-off partnership codes) apply on the Stripe Checkout
          page.
        </p>
      </Section>

      <Section eyebrow="FAQ" title="Frequently asked questions">
        <FAQ />
      </Section>
    </>
  );
}
