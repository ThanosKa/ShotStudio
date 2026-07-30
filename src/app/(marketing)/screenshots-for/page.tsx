import type { Metadata } from "next";
import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
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
import { CATEGORIES } from "@/data/categories";
import {
  CATEGORY_CLUSTERS,
  categoriesByDemand,
  categoriesInCluster,
  categoryAnchor,
} from "@/data/category-editorial";
import { STYLE_PRESETS } from "@/lib/generation/presets";
import { getAllPostMetas } from "@/lib/blog";
import { hubMetadata } from "@/lib/marketing/meta";
import { APP_URL } from "@/lib/utils";

const TITLE = `App Store screenshot guides for ${CATEGORIES.length} categories`;
const DESCRIPTION = `What converts in fitness, finance, productivity, games, VPN, dating and ${CATEGORIES.length - 6} more categories — and what kills the carousel. Three polished shots from $7.`;

export const metadata: Metadata = hubMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/screenshots-for",
});

export default function CategoriesHubPage() {
  const mostSearched = categoriesByDemand(6);
  const posts = getAllPostMetas().slice(0, 2);

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            webPageSchema({
              url: `${APP_URL}/screenshots-for`,
              name: TITLE,
              description: DESCRIPTION,
            }),
            softwareApplicationSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              {
                name: "Screenshots for",
                url: `${APP_URL}/screenshots-for`,
              },
            ]),
            itemListSchema({
              id: `${APP_URL}/screenshots-for#list`,
              name: "App Store screenshots by app category",
              items: CATEGORIES.map((c) => ({
                name: c.name,
                url: `${APP_URL}/screenshots-for/${c.slug}`,
              })),
            }),
          ],
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "By app category" },
        ]}
      />

      <Section
        as="h1"
        eyebrow="By category"
        title="App Store screenshots by app category"
        description="Different apps need different things from a screenshot. A fitness app sells momentum, a finance app sells trust, a productivity app sells calm. ShotStudio picks the style preset for you based on category — pick yours below for what converts, what kills the carousel, and three headline patterns that work in that vertical."
        className="border-t-0"
      >
        <LinkCards
          columns={3}
          items={mostSearched.map((c) => ({
            href: `/screenshots-for/${c.slug}`,
            label: categoryAnchor(c),
            eyebrow: `Most searched · ${STYLE_PRESETS[c.presetId].label} preset`,
            description: c.lead,
          }))}
        />
      </Section>

      {CATEGORY_CLUSTERS.map((cluster) => {
        const members = categoriesInCluster(cluster.id);
        if (members.length === 0) return null;
        return (
          <Section
            key={cluster.id}
            eyebrow={`${members.length} categories`}
            title={cluster.label}
            description={cluster.blurb}
          >
            <ul className="grid gap-3 md:grid-cols-2">
              {members.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/screenshots-for/${c.slug}`}
                    className="group flex flex-col gap-2 rounded-xl border p-5 transition-colors hover:border-foreground/40"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-heading-sm font-semibold">
                        {categoryAnchor(c)}
                      </span>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                      Default preset · {STYLE_PRESETS[c.presetId].label}
                    </span>
                    <span className="text-body-lg text-muted-foreground line-clamp-2">
                      {c.lead}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <Section
        eyebrow="Before you generate"
        title="Get the spec and the shortlist right"
        description="Two things worth five minutes before you upload anything: the exact App Store screenshot spec, and an honest read on the tools indies compare."
      >
        <LinkCards
          items={[
            ...posts.map((p) => ({
              href: `/blog/${p.slug}`,
              label: p.title,
              eyebrow: p.readingTime,
              description: p.description,
            })),
            {
              href: "/alternatives",
              label: "App Store screenshot tool alternatives",
              eyebrow: "Compare",
              description:
                "AppMockUp, Previewed, Rotato, Shotbot and Screenshots.pro — what each does well and where it stops fitting an indie launch.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Don't see your category?"
        title="Pick the closest one — the preset still applies."
        description={
          <>
            ShotStudio works for any iPhone app shipping to the App Store. The
            category just helps us pick a starting preset; you can override it
            on the wizard step. Credit packs start at $7 on the{" "}
            <Link
              href="/pricing"
              className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              ShotStudio pricing page
            </Link>
            , credits never expire, and generations refund automatically on
            failure.
          </>
        }
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
