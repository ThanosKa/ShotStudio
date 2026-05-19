import type { Metadata } from "next";
import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbSchema } from "@/lib/marketing/schema";
import { CATEGORIES } from "@/data/categories";
import { STYLE_PRESETS } from "@/lib/generation/presets";
import { APP_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "App Store screenshots by app category",
  description:
    "What converts in fitness, finance, productivity, games, and more — with ShotStudio's category-default style preset. Three polished 1290×2796 shots from three raw uploads, $7 one-time.",
  alternates: { canonical: "/screenshots-for" },
  openGraph: {
    title: "App Store screenshots by app category — ShotStudio",
    description:
      "What converts in fitness, finance, productivity, games, and more — with ShotStudio's category-default style preset.",
    url: `${APP_URL}/screenshots-for`,
  },
};

export default function CategoriesHubPage() {
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              {
                name: "Screenshots for",
                url: `${APP_URL}/screenshots-for`,
              },
            ]),
            {
              "@type": "ItemList",
              "@id": `${APP_URL}/screenshots-for#list`,
              name: "App Store screenshots by app category",
              numberOfItems: CATEGORIES.length,
              itemListElement: CATEGORIES.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: c.name,
                url: `${APP_URL}/screenshots-for/${c.slug}`,
              })),
            },
          ],
        }}
      />

      <Section
        as="h1"
        eyebrow="By category"
        title="App Store screenshots by app category"
        description="Different apps need different things from a screenshot. A fitness app sells momentum, a finance app sells trust, a productivity app sells calm. ShotStudio picks the style preset for you based on category — pick yours below to see what converts and what kills the carousel."
        className="border-t-0"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {CATEGORIES.map((c) => {
            const preset = STYLE_PRESETS[c.presetId];
            return (
              <Link
                key={c.slug}
                href={`/screenshots-for/${c.slug}`}
                className="group flex flex-col gap-3 rounded-xl border p-6 transition-colors hover:border-foreground/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                    Default · {preset.label}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="text-heading-sm font-semibold">{c.name}</h3>
                <p className="text-body-lg text-muted-foreground line-clamp-2">
                  {c.lead}
                </p>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Don't see your category?"
        title="Pick the closest one — the preset still applies."
        description="ShotStudio works for any iPhone app shipping to the App Store. The category just helps us pick a starting preset; you can override it on the wizard step. From $7, credits never expire, generations refund automatically on failure."
      >
        <Show
          when="signed-in"
          fallback={
            <SignUpButton mode="modal">
              <button
                type="button"
                className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
              >
                Generate my screenshots
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </SignUpButton>
          }
        >
          <Link
            href="/home"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
          >
            Generate my screenshots
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Show>
      </Section>
    </>
  );
}
