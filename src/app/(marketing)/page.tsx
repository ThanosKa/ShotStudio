import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { Section } from "@/components/marketing/section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PresetGrid } from "@/components/marketing/preset-grid";
import { LandingPricing } from "@/components/marketing/landing-pricing";
import { FAQ } from "@/components/marketing/faq";
import { FadeIn } from "@/components/marketing/fade-in";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/marketing/schema";

export const metadata: Metadata = {
  title: {
    absolute: "ShotStudio — App Store screenshots in under a minute",
  },
  description:
    "Three raw mobile screenshots in, three polished App Store shots out — in under a minute. One-time pay, never stored.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            softwareApplicationSchema(),
            faqPageSchema(),
          ],
        }}
      />
      <Hero />

      <Section
        id="how-it-works"
        eyebrow="How it works"
        title="Three inputs, one minute, three polished shots."
        description="The flow is opinionated on purpose. Three uploads in, three polished App Store shots out — no design tools, no templates."
      >
        <FadeIn>
          <HowItWorks />
        </FadeIn>
      </Section>

      <Section
        eyebrow="Style presets"
        title="Four presets. Auto-picked from your category."
        description="No 5-page style wizard. Pick a category, get a preset, override if you want. Each preset bundles palette, type, backdrop, and prompt voice."
      >
        <FadeIn>
          <PresetGrid />
        </FadeIn>
      </Section>

      <Section
        id="pricing"
        eyebrow="Pricing"
        title="Pay once. Use whenever."
        description="Credits never expire. Failed generations refund automatically. No subscription, no upsell."
      >
        <FadeIn>
          <LandingPricing />
        </FadeIn>
      </Section>

      <Section
        eyebrow="FAQ"
        title="The short version."
      >
        <FadeIn>
          <FAQ />
        </FadeIn>
      </Section>
    </>
  );
}
