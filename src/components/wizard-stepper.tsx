import { cn } from "@/lib/utils";

export const WIZARD_STEPS = ["App", "Screenshots", "Style"] as const;

export function WizardStepper({ current }: { current: number }) {
  return (
    <div className="mx-auto flex w-full max-w-md items-center gap-2">
      {WIZARD_STEPS.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div
            key={label}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              active && "bg-foreground",
              done && "bg-foreground/60",
              !active && !done && "bg-foreground/15",
            )}
            aria-label={`Step ${i + 1}: ${label}${active ? " (current)" : done ? " (done)" : ""}`}
          />
        );
      })}
    </div>
  );
}
