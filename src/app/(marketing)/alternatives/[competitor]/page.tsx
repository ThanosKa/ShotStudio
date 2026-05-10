import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, X } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  breadcrumbSchema,
  organizationSchema,
} from "@/lib/marketing/schema";
import { COMPETITORS, getCompetitorBySlug } from "@/data/competitors";
import { APP_URL } from "@/lib/utils";

export async function generateStaticParams() {
  return COMPETITORS.map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const data = getCompetitorBySlug(competitor);
  if (!data) return {};
  const title = `${data.name} alternatives for App Store screenshots`;
  const description = `Honest take on why indie iOS developers leave ${data.name}, where ${data.name} is still the right pick, and what ShotStudio does differently — $7 one-time, never stored, AI-picked preset.`;
  return {
    title,
    description,
    alternates: { canonical: `/alternatives/${data.slug}` },
    openGraph: {
      title: `${title} — ShotStudio`,
      description,
      url: `${APP_URL}/alternatives/${data.slug}`,
    },
  };
}

export default async function CompetitorAlternativesPage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const data = getCompetitorBySlug(competitor);
  if (!data) notFound();

  const others = COMPETITORS.filter((c) => c.slug !== data.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Alternatives", url: `${APP_URL}/alternatives` },
              {
                name: `${data.name} alternatives`,
                url: `${APP_URL}/alternatives/${data.slug}`,
              },
            ]),
          ],
        }}
      />

      <Section
        eyebrow={`${data.name} alternatives`}
        title={`${data.name} alternatives — what indies actually pick`}
        description={`${data.name} is ${data.positioning.toLowerCase()} ${data.primaryWeakness} If you're looking for an alternative for the once-or-twice-a-year App Store launch, here's an honest take on what fits.`}
        className="border-t-0"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/sign-up"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
          >
            Try ShotStudio for $7
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See pricing →
          </Link>
        </div>
      </Section>

      <Section
        eyebrow={`Why people leave ${data.name}`}
        title={`Where ${data.name} falls short for indie launches`}
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {data.featureGaps.map((gap) => (
            <li
              key={gap}
              className="flex gap-3 rounded-xl border bg-background p-5"
            >
              <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="text-body-lg">{gap}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="ShotStudio"
        title="Same job, different model"
        description="ShotStudio is built for the indie iOS developer doing this once or twice a year. Three raw uploads in, three polished 1290×2796 shots back, in under a minute. AI picks the preset from your category and writes the headline from your pitch — you bring the screenshots and the app name."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {[
            "$7 one-time entry — credits never expire, no subscription anywhere on the site.",
            "Auto-refund on failed generations — credits return automatically when retries can't produce a valid shot.",
            "Zero image persistence — uploads pass through memory to the model and are dropped. No images table, no S3.",
            "Category-aware preset auto-selection — no scrolling a 200-template gallery to start.",
            "AI-written headline from your one-line pitch — you don't bring the copywriting.",
            "Click-to-edit text on the preview — adjust before you export.",
          ].map((point) => (
            <li
              key={point}
              className="flex gap-3 rounded-xl border bg-background p-5"
            >
              <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
              <span className="text-body-lg">{point}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Side by side" title={`ShotStudio vs ${data.name}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-body-lg">
            <thead>
              <tr className="border-b">
                <th className="py-4 pr-6 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  &nbsp;
                </th>
                <th className="py-4 pr-6 font-semibold">ShotStudio</th>
                <th className="py-4 font-semibold">{data.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-4 pr-6 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  Pricing model
                </td>
                <td className="py-4 pr-6">One-time credit packs</td>
                <td className="py-4">{data.pricingModel}</td>
              </tr>
              <tr>
                <td className="py-4 pr-6 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  Entry price
                </td>
                <td className="py-4 pr-6">$7 (2 sets)</td>
                <td className="py-4 text-muted-foreground">
                  {data.pricingNote}
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-6 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  Output spec
                </td>
                <td className="py-4 pr-6">1290×2796, sRGB, no watermark</td>
                <td className="py-4 text-muted-foreground">Varies by template</td>
              </tr>
              <tr>
                <td className="py-4 pr-6 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  AI-written headlines
                </td>
                <td className="py-4 pr-6">Yes — from your pitch</td>
                <td className="py-4 text-muted-foreground">No</td>
              </tr>
              <tr>
                <td className="py-4 pr-6 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  Image persistence
                </td>
                <td className="py-4 pr-6">None — never written to disk</td>
                <td className="py-4 text-muted-foreground">Stored on their servers</td>
              </tr>
              <tr>
                <td className="py-4 pr-6 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                  Refund on failure
                </td>
                <td className="py-4 pr-6">Auto-refund of credits</td>
                <td className="py-4 text-muted-foreground">Manual support ticket</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow={`When ${data.name} wins`}
        title={`When ${data.name} is still the right pick`}
        description={data.whenTheyAreRight}
      >
        <div className="rounded-xl border bg-muted/40 p-6">
          <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
            What {data.name} does well
          </div>
          <ul className="mt-4 space-y-3">
            {data.honestStrengths.map((strength) => (
              <li key={strength} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0 text-foreground" />
                <span className="text-body-lg">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="Other options" title="Other alternatives worth knowing">
        <div className="grid gap-3 md:grid-cols-3">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/alternatives/${c.slug}`}
              className="group rounded-xl border p-5 transition-colors hover:border-foreground/40"
            >
              <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                {c.pricingModel}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-heading-sm font-semibold">
                  {c.name} alternatives
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/alternatives"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See all alternatives →
          </Link>
        </div>
      </Section>
    </>
  );
}
