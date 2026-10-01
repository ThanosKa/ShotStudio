import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/marketing/section";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { JsonLd } from "@/components/marketing/json-ld";
import { ScreenshotSizeChecker } from "@/components/marketing/screenshot-size-checker";
import {
  breadcrumbSchema,
  organizationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/marketing/schema";
import { hubMetadata } from "@/lib/marketing/meta";
import {
  APPLE_REQUIREMENTS,
  APPLE_RULES,
  APPLE_SIZES,
  GOOGLE_PLAY_RULES,
  type AppleSize,
} from "@/lib/screenshot-sizes/spec";
import { APP_URL } from "@/lib/utils";

const PATH = "/tools/app-store-screenshot-sizes";
const TITLE = "App Store screenshot size checker (free)";
const DESCRIPTION =
  "Free tool: check screenshots against every App Store and Google Play size, then pad or crop to the one you need. Runs in your browser, no signup.";

export const metadata: Metadata = hubMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

type DisplayGroup = {
  key: string;
  family: string;
  display: string;
  sizes: AppleSize[];
};

/** Group the dataset by family and display for the reference table. */
function groupByDisplay(): DisplayGroup[] {
  const groups = new Map<string, DisplayGroup>();
  for (const size of APPLE_SIZES) {
    const key = `${size.family} ${size.display}`;
    const group = groups.get(key) ?? {
      key,
      family: size.family,
      display: size.display,
      sizes: [],
    };
    group.sizes.push(size);
    groups.set(key, group);
  }
  return [...groups.values()];
}

const ORIENTATIONS: readonly AppleSize["orientation"][] = ["portrait", "landscape"];

const linkClass =
  "text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground";

export default function ScreenshotSizesToolPage() {
  const groups = groupByDisplay();
  const url = `${APP_URL}${PATH}`;
  const { promo } = GOOGLE_PLAY_RULES;

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            webPageSchema({ url, name: TITLE, description: DESCRIPTION }),
            {
              "@type": "WebApplication",
              "@id": `${url}#tool`,
              name: "App Store and Google Play screenshot size checker",
              url,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any (runs in the browser)",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              publisher: { "@id": `${APP_URL}/#organization` },
            },
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Screenshot size checker", url },
            ]),
          ],
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Screenshot size checker" },
        ]}
      />

      <Section
        as="h1"
        eyebrow="Free tool"
        title="App Store and Google Play screenshot size checker"
        description={
          <>
            Drop in your screenshots and see, per image, whether App Store
            Connect and Google Play will accept them. Pad or crop to a required
            size and download a zip. Nothing is uploaded: the check and the
            resize run in your browser. The{" "}
            <Link href="/blog/app-store-screenshot-sizes-2026" className={linkClass}>
              App Store screenshot sizes 2026 guide
            </Link>{" "}
            explains which size to design for first.
          </>
        }
        className="border-t-0"
      >
        <ScreenshotSizeChecker />
      </Section>

      <Section
        eyebrow="The rules"
        title="What each store checks"
        description="Apple matches exact pixel sizes. Google Play checks limits and ratios instead, so the same image can pass one store and fail the other."
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border p-6">
            <h3 className="text-heading-sm font-semibold">App Store Connect</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-lg text-muted-foreground">
              <li>
                {APPLE_RULES.minCount} to {APPLE_RULES.maxCount} screenshots per
                device size, in JPEG or PNG.
              </li>
              <li>No alpha channel or transparency.</li>
              <li>
                The pixel size must match one of the sizes listed below exactly.
              </li>
              {APPLE_REQUIREMENTS.map((r) => (
                <li key={`${r.family}-${r.display}`}>
                  {r.family} {r.display}: {r.text}.
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border p-6">
            <h3 className="text-heading-sm font-semibold">Google Play</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-lg text-muted-foreground">
              <li>JPEG or 24-bit PNG, no alpha.</li>
              <li>
                Each side between {GOOGLE_PLAY_RULES.minSide}px and{" "}
                {GOOGLE_PLAY_RULES.maxSide}px.
              </li>
              <li>
                The longer side can be at most {GOOGLE_PLAY_RULES.maxAspectRatio}
                × the shorter side. That rules out the tall iPhone 1290×2796
                shot as it is; pad it.
              </li>
              <li>
                Up to {GOOGLE_PLAY_RULES.maxPerDeviceType} screenshots per
                device type, and at least {GOOGLE_PLAY_RULES.minTotalScreenshots}{" "}
                across device types to publish.
              </li>
              <li>
                For larger promotion, add at least {promo.minScreenshots}{" "}
                screenshots at 9:16 (min {promo.portrait.width}×
                {promo.portrait.height}) or 16:9 (min {promo.landscape.width}×
                {promo.landscape.height}).
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Sources: Apple&apos;s{" "}
          <a
            href="https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications"
            className="underline underline-offset-4"
            rel="noopener"
          >
            screenshot specifications
          </a>{" "}
          and Google&apos;s{" "}
          <a
            href="https://support.google.com/googleplay/android-developer/answer/9866151"
            className="underline underline-offset-4"
            rel="noopener"
          >
            Play Console screenshot requirements
          </a>
          , checked 1 October 2026. This tool covers iPhone, iPad, and Google
          Play phone and tablet screenshots; Mac, TV, Vision Pro and Watch have
          their own sizes on Apple&apos;s page.
        </p>
      </Section>

      <Section
        eyebrow="Reference"
        title="Every accepted App Store screenshot size"
        description="iPhone and iPad sizes as Apple lists them. When you skip a display size, Apple scales a larger one down for it."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Accepted App Store screenshot sizes by display
            </caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-3 pr-4 font-semibold">Display</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Portrait (px)</th>
                <th scope="col" className="py-3 font-semibold">Landscape (px)</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.key} className="border-b align-top">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    {g.family} {g.display}
                  </th>
                  {ORIENTATIONS.map((orientation) => (
                    <td key={orientation} className="py-3 pr-4 text-muted-foreground">
                      {g.sizes
                        .filter((s) => s.orientation === orientation)
                        .map((s) => (
                          <span
                            key={`${s.width}x${s.height}${s.variant ?? ""}`}
                            className="block"
                          >
                            {s.width}×{s.height}
                            {s.variant ? ` (${s.variant})` : ""}
                          </span>
                        ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-body-lg text-muted-foreground">
          Resizing fixes the size, not the story. ShotStudio turns three raw
          app screenshots into a polished three-shot set at the App Store size
          for a one-time $7: see the{" "}
          <Link href="/pricing" className={linkClass}>
            ShotStudio pricing page
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
