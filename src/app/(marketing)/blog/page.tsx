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
  webPageSchema,
  websiteSchema,
} from "@/lib/marketing/schema";
import { formatPublishedAt, getAllPostMetas } from "@/lib/blog";
import { hubMetadata } from "@/lib/marketing/meta";
import { APP_URL } from "@/lib/utils";

const TITLE = "App Store screenshot notes for indie devs";
const DESCRIPTION =
  "Specs, tool comparisons, and the App Store Connect gotchas nobody warns you about. Written by the indie devs building ShotStudio — bias clearly labelled.";

export const metadata: Metadata = hubMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPostMetas();

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            organizationSchema(),
            websiteSchema(),
            {
              ...webPageSchema({
                url: `${APP_URL}/blog`,
                name: TITLE,
                description: DESCRIPTION,
              }),
              "@type": "Blog",
            },
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Blog", url: `${APP_URL}/blog` },
            ]),
            itemListSchema({
              id: `${APP_URL}/blog#list`,
              name: "ShotStudio blog posts",
              items: posts.map((post) => ({
                name: post.title,
                url: `${APP_URL}/blog/${post.slug}`,
              })),
            }),
          ],
        }}
      />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <Section
        as="h1"
        eyebrow="Blog"
        title="Notes on App Store screenshots, listing conversion, and indie iOS shipping."
        description="Specs, comparisons, and the parts of App Store Connect nobody warned you about. Written by the team building ShotStudio — biased, but with the bias clearly labeled."
        className="border-t-0"
      >
        {posts.length === 0 ? (
          <p className="text-body-lg text-muted-foreground">
            New posts coming soon.
          </p>
        ) : (
          <ul className="divide-y border-y">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 py-7 transition-colors hover:bg-muted/30 md:flex-row md:items-baseline md:justify-between md:gap-10"
                >
                  <div className="flex-1">
                    <h2 className="text-heading-sm font-semibold transition-colors group-hover:text-foreground/80">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-body-lg text-muted-foreground line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground md:flex-col md:items-end md:gap-1">
                    <time dateTime={post.publishedAt}>
                      {formatPublishedAt(post.publishedAt)}
                    </time>
                    <span aria-hidden className="md:hidden">·</span>
                    <span>{post.readingTime}</span>
                    <ArrowRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 md:block" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        eyebrow="Start here"
        title="The three pages people actually came for"
        description="Most readers land here from a spec question or a tool question. These are the shortest routes to an answer."
      >
        <LinkCards
          items={[
            {
              href: "/screenshots-for",
              label: "App Store screenshots by app category",
              eyebrow: "What converts",
              description:
                "Dos, don'ts and headline patterns per vertical — fitness, finance, VPN, dating, indie games and more.",
            },
            {
              href: "/alternatives",
              label: "App Store screenshot tool alternatives",
              eyebrow: "Compare",
              description:
                "AppMockUp, Previewed, Rotato, Shotbot and Screenshots.pro, with the honest case for each.",
            },
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
    </>
  );
}
