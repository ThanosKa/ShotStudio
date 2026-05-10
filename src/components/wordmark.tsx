import { cn } from "@/lib/utils";

const SIZES = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl",
} as const;

type Size = keyof typeof SIZES;

export function Wordmark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex font-bold tracking-tight whitespace-nowrap",
        SIZES[size],
        className,
      )}
      aria-label="ShotStudio"
    >
      <span className="text-[#fb923c]">Shot</span>
      <span>Studio</span>
    </span>
  );
}
