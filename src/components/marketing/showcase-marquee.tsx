import { Marquee } from "@/components/ui/marquee";
import { SHOWCASE_SETS } from "@/lib/marketing/showcase";
import { ShowcaseCard } from "@/components/marketing/showcase-card";

export function ShowcaseMarquee() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 1%, black 99%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 1%, black 99%, transparent)",
      }}
    >
      <Marquee pauseOnHover className="[--duration:60s] [--gap:1.25rem] py-2">
        {SHOWCASE_SETS.map((set) => (
          <ShowcaseCard key={set.id} set={set} />
        ))}
      </Marquee>
    </div>
  );
}
