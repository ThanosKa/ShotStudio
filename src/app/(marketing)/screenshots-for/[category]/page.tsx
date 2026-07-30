import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Show, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { LinkCards } from "@/components/marketing/link-cards";
import { ShowcaseCard } from "@/components/marketing/showcase-card";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  breadcrumbSchema,
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/marketing/schema";
import { categorySnippet } from "@/lib/marketing/meta";
import { CATEGORIES, getCategoryBySlug } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import {
  categoryAnchor,
  clusterOf,
  competitorSlugsForCategory,
  getCategoryEditorial,
  relatedCategories,
} from "@/data/category-editorial";
import { competitorAnchor } from "@/data/competitor-editorial";
import { STYLE_PRESETS } from "@/lib/generation/presets";
import { SHOWCASE_SETS } from "@/lib/marketing/showcase";
import { getAllPostMetas } from "@/lib/blog";
import { APP_URL } from "@/lib/utils";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const data = getCategoryBySlug(category);
  if (!data) return {};
  const { title, description } = categorySnippet(data);
  return {
    title,
    description,
    alternates: { canonical: `/screenshots-for/${data.slug}` },
    openGraph: {
      title: `${title} — ShotStudio`,
      description,
      url: `${APP_URL}/screenshots-for/${data.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = getCategoryBySlug(category);
  if (!data) notFound();

  const preset = STYLE_PRESETS[data.presetId];
  const example = SHOWCASE_SETS.find((s) => s.preset === data.presetId);
  // Sibling links used to be `CATEGORIES.filter(not-self).slice(0, 6)`, which
  // handed every one of the 40 category pages the *same* first six siblings.
  // Two indexing consequences: 34 of 40 category URLs received zero inbound
  // sibling links (the hub was their only internal link), and the "Related"
  // block was byte-identical across all 40 pages, adding to the duplicate mass
  // that put these URLs in GSC's "Crawled - currently not indexed" bucket.
  // `relatedCategories` fixes both: cluster siblings first (relevant), then a
  // rotating ring window so every category is linked from several others and
  // every block is unique per page.
  const related = relatedCategories(data.slug, 6);
  const cluster = clusterOf(data.slug);
  const editorial = getCategoryEditorial(data.slug);
  const comparedTools = competitorSlugsForCategory(data.slug)
    .map((slug) => COMPETITORS.find((c) => c.slug === slug))
    .filter((c): c is (typeof COMPETITORS)[number] => Boolean(c));
  const posts = getAllPostMetas().slice(0, 2);
  const url = `${APP_URL}/screenshots-for/${data.slug}`;
  const { title, description } = categorySnippet(data);

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            webPageSchema({
              url,
              name: title,
              description,
              primaryImage: `${url}/opengraph-image`,
            }),
            softwareApplicationSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Screenshots for", url: `${APP_URL}/screenshots-for` },
              { name: data.name, url },
            ]),
            faqPageSchema(data.faq),
          ],
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "By app category", href: "/screenshots-for" },
          { label: data.name },
        ]}
      />

      <Section
        as="h1"
        eyebrow={`For ${data.noun}`}
        title={`App Store screenshots for ${data.name.toLowerCase()}`}
        description={data.lead}
        className="border-t-0"
      >
        <div className="flex flex-wrap items-center gap-3">
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
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ShotStudio pricing — from $7, credits never expire →
          </Link>
        </div>
      </Section>

      <Section
        eyebrow="What converts"
        title={`What works for ${data.noun}`}
      >
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {data.whatConverts.map((point, i) => (
            <div key={i} className="bg-background p-7">
              <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                Do {String(i + 1).padStart(2, "0")}
              </div>
              <p className="mt-4 text-body-lg">{point}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {data.whatHurts.map((point, i) => (
            <div key={i} className="bg-background p-7">
              <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                Don&rsquo;t {String(i + 1).padStart(2, "0")}
              </div>
              <p className="mt-4 text-body-lg text-muted-foreground">{point}</p>
            </div>
          ))}
        </div>
      </Section>

      {editorial && (
        <Section
          eyebrow="Headline patterns"
          title={`Headlines that work on ${data.noun}`}
          description={`The hero headline does more conversion work than the artwork behind it. These three patterns are the ones that keep landing for ${data.noun} — an outcome with a number in it, a single daily moment, and a promise the buyer can picture. ShotStudio writes yours from your one-line pitch, then every line is click-to-edit on the preview.`}
        >
          <ol className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
            {editorial.headlineExamples.map((headline, i) => (
              <li key={headline} className="bg-background p-7">
                <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  Shot {String(i + 1).padStart(2, "0")}
                </div>
                <p className="mt-4 text-heading-sm font-semibold">
                  &ldquo;{headline}&rdquo;
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-body-lg text-muted-foreground">
            Same rule everywhere in the carousel:{" "}
            <Link
              href="/blog/app-store-screenshot-sizes-2026"
              className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              shot 1 sells the outcome, shot 2 shows the workflow, shot 3 shows
              the differentiator
            </Link>
            .
          </p>
        </Section>
      )}

      {example && (
        <Section
          eyebrow={`Preset · ${preset.label}`}
          title={`The ${preset.label.toLowerCase()} preset, applied`}
          description={`ShotStudio defaults ${data.noun} to the ${preset.label} personality preset. Voice: ${preset.voice}. Typography: ${preset.typography}. Theme and palette are sampled from your uploads, so the marketing matches your actual app — override the personality on the wizard step if you want a different one.`}
        >
          <div className="max-w-xl">
            <ShowcaseCard set={example} />
          </div>
        </Section>
      )}

      <Section
        eyebrow="Workflow"
        title="Three uploads in. Three polished shots back."
        description="Drop three raw simulator screenshots, name your app, write a one-line pitch. ShotStudio writes the headline, picks the preset, and returns three 1290×2796 shots ready for App Store Connect — in under a minute."
      >
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Upload three screenshots",
              body: "Hero feature, differentiator, one more. PNG or JPEG, up to 10 MB. Never written to disk.",
            },
            {
              n: "02",
              title: `Name your ${data.noun.replace(/ apps$/, "")} app`,
              body: `App name, one-sentence pitch. Example: "${data.pitchExample}" — we write the headline and pick the preset.`,
            },
            {
              n: "03",
              title: "Download three polished shots",
              body: "1290×2796 sRGB PNGs, no watermark. Click-to-edit any text on the preview before exporting.",
            },
          ].map((step) => (
            <div key={step.n} className="bg-background p-7">
              <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                Step {step.n}
              </div>
              <h3 className="mt-4 text-heading-sm font-semibold">
                {step.title}
              </h3>
              <p className="mt-3 text-body-lg text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="FAQ" title={`${data.name} screenshot questions`}>
        <div className="divide-y border-y">
          {data.faq.map(({ q, a }) => (
            <div key={q} className="py-6">
              <h3 className="text-heading-sm font-semibold">{q}</h3>
              <p className="mt-3 text-body-lg text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Tools compared"
        title={`What ${data.noun} usually get built in`}
        description={`Most indies shipping ${data.noun} reach for a template editor or a monthly subscription first. Both work — here's the honest read on when they're the better call and when a $7 one-time set is.`}
      >
        <LinkCards
          columns={3}
          items={[
            ...comparedTools.map((c) => ({
              href: `/alternatives/${c.slug}`,
              label: competitorAnchor(c.slug, c.name),
              eyebrow: c.pricingModel,
              description: c.primaryWeakness,
            })),
            {
              href: "/pricing",
              label: "ShotStudio pricing — $7, $17, $37 one-time",
              eyebrow: "No subscription",
              description:
                "1 credit = 1 set = 3 polished 1290×2796 shots. Credits never expire; failed generations refund automatically.",
            },
          ]}
        />
      </Section>

      {posts.length > 0 && (
        <Section
          eyebrow="Read next"
          title="Before you upload anything"
          description={`Get the spec right first — a ${data.noun.replace(/ apps$/, " app")} listing gets rejected for the same three reasons as everyone else's.`}
        >
          <LinkCards
            columns={2}
            items={posts.map((p) => ({
              href: `/blog/${p.slug}`,
              label: p.title,
              eyebrow: p.readingTime,
              description: p.description,
            }))}
          />
        </Section>
      )}

      <Section
        eyebrow="Related categories"
        title={
          cluster
            ? `More on ${cluster.label.toLowerCase()}`
            : "Other app categories"
        }
        description={cluster?.blurb}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/screenshots-for/${r.slug}`}
              className="group rounded-xl border p-5 transition-colors hover:border-foreground/40"
            >
              <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                For {r.noun}
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <span className="text-heading-sm font-semibold">
                  {categoryAnchor(r)}
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-body-lg text-muted-foreground">
          Nothing close enough? Browse{" "}
          <Link
            href="/screenshots-for"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            App Store screenshots by app category
          </Link>{" "}
          — all {CATEGORIES.length} of them, grouped by what the carousel has to
          prove.
        </p>
      </Section>
    </>
  );
}
