import Image from "next/image";
import type { ShowcaseSet } from "@/lib/marketing/showcase";

/**
 * One showcase set rendered as a single composite marketing image.
 * The image already contains the hero card + 3 feature phones + headlines —
 * we just frame it in a card and let it speak for itself.
 */
export function ShowcaseCard({ set }: { set: ShowcaseSet }) {
  return (
    <figure
      aria-label={`${set.app} — ${set.tagline}`}
      className="relative w-[840px] shrink-0 overflow-hidden rounded-2xl"
    >
      <Image
        src={set.image}
        alt={`${set.app} App Store screenshot set — ${set.tagline}`}
        width={1600}
        height={1067}
        unoptimized
        priority={false}
        className="block h-auto w-full"
      />
    </figure>
  );
}
