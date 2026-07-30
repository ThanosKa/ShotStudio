import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  /** Omit on the current page. */
  href?: string;
};

/**
 * Visible breadcrumb trail. Every deep page gets free, descriptive internal
 * links back to its hub and the homepage — the cheapest fix for a site where
 * category and comparison pages sit on a single inbound link.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-6xl px-6 pt-8 md:pt-10"
    >
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="size-3" />}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
