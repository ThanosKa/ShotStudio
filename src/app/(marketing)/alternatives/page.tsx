import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { LinkCards } from "@/components/marketing/link-cards";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  breadcrumbSchema,
  itemListSchema,
  organizationSchema,
  softwareApplicationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/marketing/schema";
import { COMPETITORS } from "@/data/competitors";
import { competitorAnchor } from "@/data/competitor-editorial";
import {
  categoriesByDemand,
  categoryAnchor,
} from "@/data/category-editorial";
import { getAllPostMetas } from "@/lib/blog";
import { hubMetadata } from "@/lib/marketing/meta";
import { APP_URL } from "@/lib/utils";

const TITLE = "App Store screenshot tools compared";
const DESCRIPTION =
  "AppMockUp, Previewed, Rotato, Shotbot, Screenshots.pro — what each does well, where each falls short for a once-a-year launch, and where ShotStudio fits.";

export const metadata: Metadata = hubMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/alternatives",
});

export default function AlternativesHubPage() {
  const featuredCategories = categoriesByDemand(6);
  const comparisonPost = getAllPostMetas().find((p) =>
    p.slug.includes("generators"),
  );

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            webPageSchema({
              url: `${APP_URL}/alternatives`,
              name: TITLE,
              description: DESCRIPTION,
            }),
            softwareApplicationSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Alternatives", url: `${APP_URL}/alternatives` },
            ]),
            itemListSchema({
              id: `${APP_URL}/alternatives#list`,
              name: "App Store screenshot tool alternatives",
              items: COMPETITORS.map((c) => ({
                name: `${c.name} alternatives`,
                url: `${APP_URL}/alternatives/${c.slug}`,
              })),
            }),
          ],
        }}
      />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Alternatives" }]}
      />

      <Section
        as="h1"
        eyebrow="Tool alternatives"
        title="App Store screenshot tool alternatives"
        description="Honest comparisons of the main tools indie iOS developers consider — including ours. Each page covers what the tool does well, where it falls short for the once-or-twice-a-year App Store launch, and which kind of indie still picks it."
        className="border-t-0"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/alternatives/${c.slug}`}
              className="group flex flex-col gap-3 rounded-xl border p-6 transition-colors hover:border-foreground/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  {c.pricingModel}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="text-heading-sm font-semibold">
                {competitorAnchor(c.slug, c.name)}
              </h3>
              <p className="text-body-lg text-muted-foreground line-clamp-2">
                {c.primaryWeakness}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="At a glance"
        title="What each tool costs, and what you still have to do yourself"
        description="Pricing model is the fault line in this category. Everything here outputs the 1290×2796 App Store spec correctly; the difference is whether you're renting the tool and whether you're doing the layout."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-body-lg">
            <thead>
              <tr className="border-b">
                <th className="py-4 pr-6 font-semibold">Tool</th>
                <th className="py-4 pr-6 font-semibold">Pricing</th>
                <th className="py-4 font-semibold">The catch for an indie launch</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-4 pr-6 font-semibold">ShotStudio</td>
                <td className="py-4 pr-6">$7 one-time (2 sets)</td>
                <td className="py-4 text-muted-foreground">
                  Opinionated: fixed three-shot template, iPhone 6.7-inch
                  output only.{" "}
                  <Link
                    href="/pricing"
                    className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    See all three credit packs
                  </Link>
                  .
                </td>
              </tr>
              {COMPETITORS.map((c) => (
                <tr key={c.slug}>
                  <td className="py-4 pr-6 font-semibold">
                    <Link
                      href={`/alternatives/${c.slug}`}
                      className="underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                    >
                      {competitorAnchor(c.slug, c.name)}
                    </Link>
                  </td>
                  <td className="py-4 pr-6 text-muted-foreground">
                    {c.pricingNote}
                  </td>
                  <td className="py-4 text-muted-foreground">
                    {c.primaryWeakness}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Before you pick"
        title="Know what your category's carousel has to prove"
        description="The tool matters less than the shot list. What converts for a fitness app kills a finance app's listing — start from your vertical, then pick the tool."
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
          Full index:{" "}
          <Link
            href="/screenshots-for"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            App Store screenshots by app category
          </Link>
          {comparisonPost && (
            <>
              . Longer read:{" "}
              <Link
                href={`/blog/${comparisonPost.slug}`}
                className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {comparisonPost.title}
              </Link>
            </>
          )}
          .
        </p>
      </Section>
    </>
  );
}
