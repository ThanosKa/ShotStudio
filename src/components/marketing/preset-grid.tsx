import { ShowcaseCard } from "@/components/marketing/showcase-card";
import { SHOWCASE_SETS } from "@/lib/marketing/showcase";

const PICKS = [
  { presetId: "soft_bright", defaults: "wellness, lifestyle, social" },
  { presetId: "dark_premium", defaults: "finance, crypto, dev tools" },
  { presetId: "clean_minimal", defaults: "productivity, education" },
  { presetId: "bold_playful", defaults: "games, creator tools" },
] as const;

export function PresetGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {PICKS.map(({ presetId, defaults }) => {
        const example = SHOWCASE_SETS.find((s) => s.preset === presetId)!;
        return (
          <div key={presetId} className="space-y-3">
            <ShowcaseCard set={example} />
            <p className="px-1 text-sm text-muted-foreground">
              <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">
                Default for
              </span>{" "}
              {defaults}
            </p>
          </div>
        );
      })}
    </div>
  );
}
