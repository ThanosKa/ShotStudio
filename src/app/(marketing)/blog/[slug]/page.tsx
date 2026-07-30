import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Show, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { MdxContent } from "@/components/marketing/mdx-content";
import {
  categoriesByDemand,
  categoryAnchor,
} from "@/data/category-editorial";
import {
  breadcrumbSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/marketing/schema";
import {
  formatPublishedAt,
  getAllPosts,
  getPostBySlug,
} from "@/lib/blog";
import { APP_URL } from "@/lib/utils";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const ogImage = post.heroImage
    ? `${APP_URL}${post.heroImage}`
    : `${APP_URL}/og-default.png`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} — ShotStudio`,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      url: `${APP_URL}/blog/${post.slug}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — ShotStudio`,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const others = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const isHowToCandidate = post.slug === "app-store-screenshot-sizes-2026";

  // Highest-demand category pages, rotated per post so the two posts don't
  // hand identical link blocks to the same three URLs.
  const offset = post.slug.length % 3;
  const relatedCategoryLinks = categoriesByDemand(9).filter(
    (_, i) => i % 3 === offset,
  );

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Blog", url: `${APP_URL}/blog` },
              { name: post.title, url: `${APP_URL}/blog/${post.slug}` },
            ]),
            {
              "@type": "BlogPosting",
              "@id": `${APP_URL}/blog/${post.slug}#article`,
              headline: post.title,
              description: post.description,
              url: `${APP_URL}/blog/${post.slug}`,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              inLanguage: "en-US",
              // Article rich results need a >=1200px-wide image; the icon is
              // 512px square and does not qualify.
              image: [
                post.heroImage
                  ? `${APP_URL}${post.heroImage}`
                  : `${APP_URL}/og-default.png`,
              ],
              author: {
                "@id": `${APP_URL}/#organization`,
              },
              publisher: { "@id": `${APP_URL}/#organization` },
              isPartOf: { "@id": `${APP_URL}/#website` },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${APP_URL}/blog/${post.slug}`,
              },
            },
            ...(isHowToCandidate
              ? [
                  {
                    "@type": "HowTo",
                    name: "Export App Store screenshots at the correct 2026 spec",
                    description:
                      "Submit App Store screenshots that pass review on the first upload — correct resolution, color space, format, and aspect ratio for the iPhone 6.7\" master spec.",
                    totalTime: "PT5M",
                    step: [
                      {
                        "@type": "HowToStep",
                        name: "Resize to 1290×2796 portrait",
                        text: "Export each screenshot at exactly 1290×2796 pixels in portrait orientation. This is the iPhone 6.7\" display master spec Apple uses across the App Store carousel.",
                      },
                      {
                        "@type": "HowToStep",
                        name: "Use sRGB color space",
                        text: "Save in sRGB color space. P3 is allowed but causes subtle saturation differences when the carousel renders at smaller sizes; sRGB is the safe default.",
                      },
                      {
                        "@type": "HowToStep",
                        name: "Flatten transparency, keep PNG or JPEG",
                        text: "Apple rejects images with any alpha-channel pixels. Flatten to a solid background and export as PNG (preferred) or JPEG, under 8 MB per image.",
                      },
                      {
                        "@type": "HowToStep",
                        name: "Don't draw status bar or rounded corners",
                        text: "The App Store applies its own status bar and corner radius. If you draw them yourself, you'll get double-rendering effects.",
                      },
                      {
                        "@type": "HowToStep",
                        name: "Upload 3–10 screenshots per locale",
                        text: "Upload 3 to 10 screenshots per locale via App Store Connect. The first three carry virtually all the conversion weight in the carousel.",
                      },
                    ],
                  },
                ]
              : []),
          ],
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <article className="py-14 md:py-16">
        <div className="mx-auto max-w-2xl px-6">

          <h1 className="text-balance text-heading-lg font-semibold md:text-[44px] md:leading-[1.1] md:tracking-[-1px]">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {formatPublishedAt(post.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readingTime}</span>
          </div>

          {post.heroImage && (
            <div className="mt-10 overflow-hidden rounded-2xl border bg-background">
              <Image
                src={post.heroImage}
                alt={post.title}
                width={1672}
                height={941}
                priority
                unoptimized
                className="block h-auto w-full"
              />
            </div>
          )}

          <div className="mt-10">
            <MdxContent source={post.content} />
          </div>

          <div className="mt-14 rounded-2xl border bg-muted/40 p-8">
            <h2 className="text-heading-sm font-semibold">
              Three uploads in. Three polished shots back.
            </h2>
            <p className="mt-3 max-w-prose text-body-lg text-muted-foreground">
              ShotStudio is the indie iOS developer&rsquo;s screenshot tool — $7
              one-time, AI-picked preset, ready for App Store Connect in under
              a minute.
            </p>
            <Show
              when="signed-in"
              fallback={
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="group mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
                  >
                    Generate my screenshots
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </SignUpButton>
              }
            >
              <Link
                href="/home"
                className="group mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
              >
                Generate my screenshots
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Show>
            <p className="mt-5 text-body-lg text-muted-foreground">
              <Link
                href="/pricing"
                className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
              >
                ShotStudio pricing — $7, $17, $37 one-time
              </Link>{" "}
              · no subscription, credits never expire.
            </p>
          </div>

          <div className="mt-10">
            <p className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
              Keep reading
            </p>
            <ul className="mt-4 space-y-3 text-body-lg">
              <li>
                <Link
                  href="/screenshots-for"
                  className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  App Store screenshots by app category
                </Link>{" "}
                — what converts in your vertical, with headline patterns.
              </li>
              {relatedCategoryLinks.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/screenshots-for/${c.slug}`}
                    className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    {categoryAnchor(c)}
                  </Link>{" "}
                  — {c.whatConverts[0].toLowerCase()}
                </li>
              ))}
              <li>
                <Link
                  href="/alternatives"
                  className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  App Store screenshot tool alternatives
                </Link>{" "}
                — AppMockUp, Previewed, Rotato, Shotbot and Screenshots.pro
                compared honestly.
              </li>
            </ul>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
              More from the blog
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col gap-3 rounded-xl border p-5 transition-colors hover:border-foreground/40"
                >
                  <div className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
                    {formatPublishedAt(p.publishedAt)} · {p.readingTime}
                  </div>
                  <h3 className="text-heading-sm font-semibold">{p.title}</h3>
                  <p className="text-body-lg text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
