import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { COMPETITORS } from "@/data/competitors";
import { categoriesByDemand, categoryAnchor } from "@/data/category-editorial";
import { competitorAnchor } from "@/data/competitor-editorial";
import { getAllPostMetas } from "@/lib/blog";

type FooterLink = { label: string; href: string };

const PRODUCT_LINKS: FooterLink[] = [
  { label: "Pricing — $7 one-time, no subscription", href: "/pricing" },
  { label: "How ShotStudio works", href: "/#how-it-works" },
  { label: "Example screenshot sets", href: "/#examples" },
];

const FOOTER_CATEGORY_COUNT = 5;
const FOOTER_COMPETITOR_COUNT = 3;

export function MarketingFooter() {
  const categoryLinks: FooterLink[] = categoriesByDemand(
    FOOTER_CATEGORY_COUNT,
  ).map((c) => ({
    label: categoryAnchor(c),
    href: `/screenshots-for/${c.slug}`,
  }));
  categoryLinks.push({
    label: "All app categories",
    href: "/screenshots-for",
  });

  const competitorLinks: FooterLink[] = COMPETITORS.slice(
    0,
    FOOTER_COMPETITOR_COUNT,
  ).map((c) => ({
    label: competitorAnchor(c.slug, c.name),
    href: `/alternatives/${c.slug}`,
  }));
  competitorLinks.push({
    label: "All screenshot tool alternatives",
    href: "/alternatives",
  });

  const posts = getAllPostMetas().slice(0, 2);
  const learnLinks: FooterLink[] = [
    ...posts.map((p) => ({ label: p.title, href: `/blog/${p.slug}` })),
    { label: "All posts", href: "/blog" },
  ];

  const columns: { heading: string; links: FooterLink[] }[] = [
    { heading: "Product", links: PRODUCT_LINKS },
    { heading: "By app category", links: categoryLinks },
    { heading: "Compare tools", links: competitorLinks },
    { heading: "Learn", links: learnLinks },
  ];

  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Wordmark size="md" />
            <p className="mt-4 max-w-xs text-body-lg text-muted-foreground">
              App Store screenshots in under a minute. One-time pay, never
              stored.
            </p>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Three raw uploads in, three polished 1290×2796 shots back.{" "}
              <Link
                href="/pricing"
                className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Credit packs start at $7
              </Link>
              .
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-9">
            {columns.map((column) => (
              <div key={column.heading}>
                <h4 className="text-sm font-semibold text-foreground">
                  {column.heading}
                </h4>
                <ul className="mt-4 space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} ShotStudio. App Store screenshots, one
            set at a time. Made for indie iOS developers.
          </p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <li>
              <a
                href="mailto:kazakis.th@gmail.com"
                className="transition-colors hover:text-foreground"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="https://x.com/KazakisThanos"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                X
              </a>
            </li>
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
