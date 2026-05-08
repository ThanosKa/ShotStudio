import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { Section } from "@/components/marketing/section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PresetGrid } from "@/components/marketing/preset-grid";
import { LandingPricing } from "@/components/marketing/landing-pricing";
import { FAQ } from "@/components/marketing/faq";
import { FadeIn } from "@/components/marketing/fade-in";

export const metadata: Metadata = {
  title: "ShotStudio — App Store screenshots in under a minute",
  description:
    "Drop in three raw mobile screenshots. ShotStudio returns a polished four-shot App Store set, powered by gpt-image-2. One-time pay, no subscription, never stored.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />

      <Section
        id="how-it-works"
        eyebrow="How it works"
        title="Three inputs, one minute, four shots."
        description="The flow is opinionated on purpose. The 4-shot template is what App Store A/B tests keep choosing — we just make it fast to ship."
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
