import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbSchema } from "@/lib/marketing/schema";
import { formatPublishedAt, getAllPostMetas } from "@/lib/blog";
import { APP_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from ShotStudio on App Store screenshots, listing conversion, and shipping iOS apps as an indie. Specs, comparisons, and what actually moves the needle in the carousel.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "ShotStudio Blog — App Store screenshots, indie iOS notes",
    description:
      "Notes from ShotStudio on App Store screenshots, listing conversion, and shipping iOS apps as an indie.",
    url: `${APP_URL}/blog`,
  },
};

export default function BlogIndexPage() {
  const posts = getAllPostMetas();

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbSchema([
              { name: "Home", url: APP_URL },
              { name: "Blog", url: `${APP_URL}/blog` },
            ]),
          ],
        }}
      />

      <Section
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
    </>
  );
}
