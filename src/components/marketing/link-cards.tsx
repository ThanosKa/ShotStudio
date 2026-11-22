import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type LinkCard = {
  href: string;
  label: string;
  eyebrow?: string;
  description?: string;
};

export function LinkCards({
  items,
  columns = 3,
  className,
}: {
  items: LinkCard[];
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className="group flex flex-col gap-3 rounded-xl border p-5 transition-colors hover:border-foreground/40"
        >
          {item.eyebrow && (
            <span className="font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
              {item.eyebrow}
            </span>
          )}
          <span className="flex items-start justify-between gap-3">
            <span className="text-heading-sm font-semibold">{item.label}</span>
            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </span>
          {item.description && (
            <span className="text-body-lg text-muted-foreground line-clamp-2">
              {item.description}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
