import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bare?: boolean;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  bare = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "border-t",
        bare ? "py-16" : "py-20 md:py-24",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="mb-3 font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h2 className="text-heading font-semibold md:text-heading-lg">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-body-lg text-muted-foreground md:text-heading-sm">
              {description}
            </p>
          )}
        </div>
        <div className={cn(eyebrow || description ? "mt-12" : "mt-10")}>
          {children}
        </div>
      </div>
    </section>
  );
}
