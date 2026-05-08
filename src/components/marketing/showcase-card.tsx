import type { ShowcaseSet } from "@/lib/marketing/showcase";
import { cn } from "@/lib/utils";

const PRESET_STYLES: Record<
  ShowcaseSet["preset"],
  {
    label: string;
    canvas: string;
    title: string;
    sub: string;
    chip: string;
    phone: string;
    phoneInner: string;
    accent: string;
  }
> = {
  soft_bright: {
    label: "Soft & Bright",
    canvas: "bg-[#fff3e6]",
    title: "text-[#3b2516]",
    sub: "text-[#6b4a2b]",
    chip: "border-[#e8caa8] text-[#6b4a2b]",
    phone: "bg-white border-[#f0d9b5]",
    phoneInner: "bg-[#fde9cf]",
    accent: "bg-[#f9b44a]",
  },
  dark_premium: {
    label: "Dark & Premium",
    canvas: "bg-[#0e0e10]",
    title: "text-zinc-100",
    sub: "text-zinc-400",
    chip: "border-zinc-700 text-zinc-300",
    phone: "bg-zinc-900 border-zinc-700",
    phoneInner: "bg-zinc-800",
    accent: "bg-[#f5d36b]",
  },
  clean_minimal: {
    label: "Clean & Minimal",
    canvas: "bg-[#f6f6f4]",
    title: "text-zinc-900",
    sub: "text-zinc-500",
    chip: "border-zinc-300 text-zinc-600",
    phone: "bg-white border-zinc-200",
    phoneInner: "bg-zinc-100",
    accent: "bg-zinc-900",
  },
  bold_playful: {
    label: "Bold & Playful",
    canvas: "bg-[#ff5a3c]",
    title: "text-white",
    sub: "text-white/80",
    chip: "border-white/40 text-white",
    phone: "bg-white border-white",
    phoneInner: "bg-[#ffe1d6]",
    accent: "bg-[#0a0a0a]",
  },
};

function PhonePreview({
  variant,
  phone,
  phoneInner,
  accent,
  caption,
  hero = false,
}: {
  variant: "hero" | "feature";
  phone: string;
  phoneInner: string;
  accent: string;
  caption: string;
  hero?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "h-32 w-[68px] rounded-[10px] border p-1 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
          phone,
        )}
      >
        <div
          className={cn(
            "relative flex h-full w-full flex-col gap-1 overflow-hidden rounded-[7px] p-1.5",
            phoneInner,
          )}
        >
          {hero ? (
            <>
              <div className={cn("h-1 w-7 rounded-full", accent)} />
              <div className="mt-0.5 h-1.5 w-12 rounded-sm bg-current opacity-70" />
              <div className="h-1 w-9 rounded-sm bg-current opacity-30" />
              <div className="mt-auto h-12 rounded-md bg-current opacity-10" />
            </>
          ) : (
            <>
              <div className="h-1 w-6 rounded-full bg-current opacity-30" />
              <div className="h-1.5 w-10 rounded-sm bg-current opacity-60" />
              <div className="mt-1 grid grid-cols-2 gap-1">
                <div className="h-3 rounded-sm bg-current opacity-15" />
                <div className="h-3 rounded-sm bg-current opacity-15" />
                <div className="h-3 rounded-sm bg-current opacity-15" />
                <div className="h-3 rounded-sm bg-current opacity-15" />
              </div>
              <div className={cn("mt-auto h-1 w-5 rounded-full", accent)} />
            </>
          )}
        </div>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">
        {variant === "hero" ? "01" : caption}
      </span>
    </div>
  );
}

export function ShowcaseCard({ set }: { set: ShowcaseSet }) {
  const styles = PRESET_STYLES[set.preset];
  return (
    <figure
      className={cn(
        "relative w-[420px] shrink-0 overflow-hidden rounded-2xl border",
        styles.canvas,
      )}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <div className={cn("text-sm font-semibold tracking-tight", styles.title)}>
            {set.app}
          </div>
          <div className={cn("text-xs", styles.sub)}>{set.category}</div>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            styles.chip,
          )}
        >
          {styles.label}
        </span>
      </div>
      <div className={cn("px-5 pt-3 pb-2 text-base font-medium leading-snug", styles.title)}>
        {set.tagline}
      </div>
      <div className="flex items-end justify-between gap-2 px-5 pb-5 pt-2">
        <PhonePreview
          variant="hero"
          phone={styles.phone}
          phoneInner={styles.phoneInner}
          accent={styles.accent}
          caption="01"
          hero
        />
        {set.shots.map((s, i) => (
          <PhonePreview
            key={s}
            variant="feature"
            phone={styles.phone}
            phoneInner={styles.phoneInner}
            accent={styles.accent}
            caption={`0${i + 2}`}
          />
        ))}
      </div>
    </figure>
  );
}
