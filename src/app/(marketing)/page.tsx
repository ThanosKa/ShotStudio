import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { Section } from "@/components/marketing/section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { LandingPricing } from "@/components/marketing/landing-pricing";
import { FAQ } from "@/components/marketing/faq";
import { FadeIn } from "@/components/marketing/fade-in";
import { JsonLd } from "@/components/marketing/json-ld";
import { LinkCards } from "@/components/marketing/link-cards";
import {
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/marketing/schema";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import {
  categoriesByDemand,
  categoryAnchor,
} from "@/data/category-editorial";
import { competitorAnchor } from "@/data/competitor-editorial";
import { getAllPostMetas } from "@/lib/blog";

export const metadata: Metadata = {
  title: {
    absolute: "ShotStudio — App Store screenshots in under a minute",
  },
  description:
    "Three raw mobile screenshots in, three polished App Store shots out — in under a minute. One-time pay, never stored.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  const featuredCategories = categoriesByDemand(9);
  const posts = getAllPostMetas().slice(0, 3);

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
        title="How do you make App Store screenshots without a designer?"
        description="ShotStudio is a one-time-pay App Store screenshot generator for indie iOS developers. Upload three raw mobile screenshots, add your app name and a one-line pitch, and get three polished 1290×2796 shots back in about a minute. No design tool, no template gallery, nothing to learn. The flow is opinionated on purpose."
      >
        <FadeIn>
          <HowItWorks />
        </FadeIn>
      </Section>

      <Section
        id="by-category"
        eyebrow="By app type"
        title="What converts in your category"
        description="A fitness app sells momentum, a finance app sells trust, an indie game sells a vibe in 200ms. Each category page has the dos, the don'ts, three headline patterns that work, and the personality preset ShotStudio picks by default."
      >
        <FadeIn>
          <LinkCards
            items={featuredCategories.map((c) => ({
              href: `/screenshots-for/${c.slug}`,
              label: categoryAnchor(c),
              eyebrow: `For ${c.noun}`,
              description: c.lead,
            }))}
          />
        </FadeIn>
        <p className="mt-6 text-body-lg text-muted-foreground">
          Or browse{" "}
          <Link
            href="/screenshots-for"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            App Store screenshots by app category
          </Link>{" "}
          — all {CATEGORIES.length} verticals, from VPN app screenshots to
          indie game screenshots.
        </p>
      </Section>

      <Section
        id="pricing"
        eyebrow="Pricing"
        title="How much does ShotStudio cost?"
        description="$7 once for two sets, $17 for five, $37 for twelve. There is no subscription. 1 credit = 1 set = 3 polished shots, credits never expire, regenerating a single shot costs nothing, and failed generations return the credit automatically."
      >
        <FadeIn>
          <LandingPricing />
        </FadeIn>
        <p className="mt-8 text-body-lg text-muted-foreground">
          Full breakdown on the{" "}
          <Link
            href="/pricing"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            ShotStudio pricing page
          </Link>{" "}
          — what each credit pack includes, how VAT is handled at checkout, and
          why there is no subscription.
        </p>
      </Section>

      <Section
        eyebrow="Switching"
        title="Already paying for a screenshot tool?"
        description="Most tools in this category bill monthly for a job indies do once or twice a year, and most still hand you a template editor. Honest comparisons — including where each tool is genuinely the better pick."
      >
        <FadeIn>
          <LinkCards
            items={COMPETITORS.map((c) => ({
              href: `/alternatives/${c.slug}`,
              label: competitorAnchor(c.slug, c.name),
              eyebrow: c.pricingModel,
              description: c.primaryWeakness,
            }))}
          />
        </FadeIn>
        <p className="mt-6 text-body-lg text-muted-foreground">
          Start with{" "}
          <Link
            href="/alternatives"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            App Store screenshot tool alternatives
          </Link>{" "}
          if you&rsquo;re still shortlisting, or{" "}
          <Link
            href="/pricing"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            compare it against $7 one-time credit packs
          </Link>
          .
        </p>
      </Section>

      {posts.length > 0 && (
        <Section
          eyebrow="Guides"
          title="Get the spec right before you generate"
          description="The App Store screenshot rules that actually get listings rejected, and an honest read on the tools indies compare."
        >
          <FadeIn>
            <LinkCards
              items={posts.map((p) => ({
                href: `/blog/${p.slug}`,
                label: p.title,
                eyebrow: p.readingTime,
                description: p.description,
              }))}
            />
          </FadeIn>
        </Section>
      )}

      <Section
        eyebrow="FAQ"
        title="Frequently asked questions"
      >
        <FadeIn>
          <FAQ />
        </FadeIn>
      </Section>
    </>
  );
}
