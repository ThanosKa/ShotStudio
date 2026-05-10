import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

const PRODUCT_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Examples", href: "/#examples" },
];

const EXPLORE_LINKS = [
  { label: "By category", href: "/screenshots-for" },
  { label: "Alternatives", href: "/alternatives" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

type FooterColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

const COLUMNS: FooterColumn[] = [
  { heading: "Product", links: PRODUCT_LINKS },
  { heading: "Explore", links: EXPLORE_LINKS },
  { heading: "Legal", links: LEGAL_LINKS },
];

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark size="md" />
            <p className="mt-4 max-w-xs text-body-lg text-muted-foreground">
              App Store screenshots in under a minute. One-time pay, never stored.
            </p>
            <a
              href="mailto:hello@shotstudio.app"
              className="mt-5 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              hello@shotstudio.app
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h4 className="text-sm font-semibold text-foreground">
                  {column.heading}
                </h4>
                <ul className="mt-4 space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
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
            © {new Date().getFullYear()} ShotStudio. App Store screenshots, one set at a time.
          </p>
          <p>Made for indie iOS developers.</p>
        </div>
      </div>
    </footer>
  );
}
