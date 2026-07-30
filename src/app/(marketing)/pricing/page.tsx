import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/marketing/section";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { LinkCards } from "@/components/marketing/link-cards";
import { LandingPricing } from "@/components/marketing/landing-pricing";
import { FAQ } from "@/components/marketing/faq";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  breadcrumbSchema,
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/marketing/schema";
import { CATEGORIES } from "@/data/categories";
import {
  categoriesByDemand,
  categoryAnchor,
} from "@/data/category-editorial";
import { APP_URL } from "@/lib/utils";

const TITLE = "ShotStudio pricing — $7 one-time, no subscription";
const DESCRIPTION =
  "Three credit packs, one-time pay: Starter $7 / 2 sets, Growth $17 / 5, Studio $37 / 12. Credits never expire. Failed generations refund automatically.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${APP_URL}/pricing`,
  },
};

export default function PricingPage() {
  const featuredCategories = categoriesByDemand(6);

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            webPageSchema({
              url: `${APP_URL}/pricing`,
              name: TITLE,
              description: DESCRIPTION,
            }),
            softwareApplicationSchema(),
            faqPageSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Pricing", url: `${APP_URL}/pricing` },
            ]),
          ],
        }}
      />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
      />

      <Section
        as="h1"
        eyebrow="Pricing"
        title="ShotStudio pricing — three one-time packs, no subscription"
        description="ShotStudio costs $7 once for 2 sets, $17 for 5 sets, or $37 for 12 sets. There is no subscription and no recurring charge. 1 credit = 1 set = 3 polished 1290×2796 shots. Credits never expire, regenerating a single shot inside a set is free, and failed generations return the credit automatically."
        className="border-t-0"
      >
        <LandingPricing />
        <p className="mt-8 text-sm text-muted-foreground">
          VAT/sales tax is calculated at checkout via Stripe Tax. Coupon codes
          (including 100%-off partnership codes) apply on the Stripe Checkout
          page.
        </p>
      </Section>

      <Section
        eyebrow="What you get for it"
        title="What $7 actually buys in your category"
        description="One credit is one set: three polished 1290×2796 shots, one per screen you upload. What those three shots should say depends entirely on what you're shipping."
      >
        <LinkCards
          items={featuredCategories.map((c) => ({
            href: `/screenshots-for/${c.slug}`,
            label: categoryAnchor(c),
            eyebrow: `For ${c.noun}`,
            description: c.lead,
          }))}
        />
        <p className="mt-6 text-body-lg text-muted-foreground">
          All {CATEGORIES.length} verticals:{" "}
          <Link
            href="/screenshots-for"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            App Store screenshots by app category
          </Link>
          . Comparing us against a subscription tool?{" "}
          <Link
            href="/alternatives"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            App Store screenshot tool alternatives
          </Link>{" "}
          has the honest version.
        </p>
      </Section>

      <Section eyebrow="FAQ" title="Frequently asked questions">
        <FAQ />
      </Section>
    </>
  );
}
