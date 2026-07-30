import Link from "next/link";
import { cn } from "@/lib/utils";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Last updated · {updated}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
      <article
        className={cn(
          "mt-10 space-y-6 text-base leading-relaxed text-foreground/90",
          "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
          "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold",
          "[&_p]:text-foreground/80",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-foreground/80 [&_ul]:space-y-1.5",
          "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground",
        )}
      >
        {children}
      </article>

      {/*
        /privacy and /terms outrank /pricing by ~20 positions in Search Console
        while passing their equity nowhere. These contextual links push it back
        toward the money page instead of leaving legal as a dead end.
      */}
      <aside className="mt-14 border-t pt-8 text-sm text-muted-foreground">
        <p>
          Looking for the product rather than the legal copy?{" "}
          <Link
            href="/pricing"
            className="text-foreground underline underline-offset-4"
          >
            ShotStudio pricing — $7, $17, $37 one-time
          </Link>
          , or see what converts in your vertical on{" "}
          <Link
            href="/screenshots-for"
            className="text-foreground underline underline-offset-4"
          >
            App Store screenshots by app category
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
