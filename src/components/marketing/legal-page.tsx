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
    </div>
  );
}
