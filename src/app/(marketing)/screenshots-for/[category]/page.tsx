import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Show, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { ShowcaseCard } from "@/components/marketing/showcase-card";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  breadcrumbSchema,
  organizationSchema,
  softwareApplicationSchema,
} from "@/lib/marketing/schema";
import { CATEGORIES, getCategoryBySlug } from "@/data/categories";
import { STYLE_PRESETS } from "@/lib/generation/presets";
import { SHOWCASE_SETS } from "@/lib/marketing/showcase";
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
  const title = `App Store screenshots for ${data.name.toLowerCase()}`;
  const description = `What converts in ${data.noun} and what kills the carousel. ShotStudio outputs three polished 1290×2796 shots for your ${data.noun.replace(/ apps$/, "")} app from three raw uploads — from $7, ready for App Store Connect.`;
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
  const related = CATEGORIES.filter((c) => c.slug !== data.slug).slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            softwareApplicationSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Screenshots for", url: `${APP_URL}/screenshots-for` },
              {
                name: data.name,
                url: `${APP_URL}/screenshots-for/${data.slug}`,
              },
            ]),
            {
              "@type": "FAQPage",
              mainEntity: data.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
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
            From $7 · credits never expire →
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

      <Section eyebrow="Related" title="Other categories">
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
              <div className="mt-3 flex items-center justify-between">
                <span className="text-heading-sm font-semibold">
                  {r.name}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/screenshots-for"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See all categories →
          </Link>
        </div>
      </Section>
    </>
  );
}
