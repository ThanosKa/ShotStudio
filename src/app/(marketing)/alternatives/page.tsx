import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbSchema } from "@/lib/marketing/schema";
import { COMPETITORS } from "@/data/competitors";
import { APP_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "App Store screenshot tool alternatives",
  description:
    "Honest comparisons of the main App Store screenshot tools — AppMockUp, Previewed, Rotato, Shotbot, Screenshots.pro — and where ShotStudio fits.",
  alternates: { canonical: "/alternatives" },
  openGraph: {
    title: "App Store screenshot tool alternatives — ShotStudio",
    description:
      "Honest comparisons of the main App Store screenshot tools and where ShotStudio fits.",
    url: `${APP_URL}/alternatives`,
  },
};

export default function AlternativesHubPage() {
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Alternatives", url: `${APP_URL}/alternatives` },
            ]),
            {
              "@type": "ItemList",
              "@id": `${APP_URL}/alternatives#list`,
              name: "App Store screenshot tool alternatives",
              numberOfItems: COMPETITORS.length,
              itemListElement: COMPETITORS.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${c.name} alternatives`,
                url: `${APP_URL}/alternatives/${c.slug}`,
              })),
            },
          ],
        }}
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
                {c.name} alternatives
              </h3>
              <p className="text-body-lg text-muted-foreground line-clamp-2">
                {c.primaryWeakness}
              </p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
