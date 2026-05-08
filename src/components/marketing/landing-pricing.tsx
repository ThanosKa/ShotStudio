import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Pack = {
  id: "starter" | "growth" | "studio";
  name: string;
  price: number;
  sets: number;
  blurb: string;
  perks: string[];
  featured?: boolean;
};

const PACKS: Pack[] = [
  {
    id: "starter",
    name: "Starter",
    price: 7,
    sets: 1,
    blurb: "Shipping a single app. One polished set, done.",
    perks: ["1 generation set", "All 4 style presets", "Free per-shot regenerates"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 17,
    sets: 4,
    blurb: "Iterate on copy or test alternate hero angles.",
    perks: [
      "4 generation sets",
      "Same as Starter",
      "Best per-set value if you A/B copy",
    ],
    featured: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: 37,
    sets: 10,
    blurb: "Indie portfolios and small studios shipping a few apps a year.",
    perks: ["10 generation sets", "Same as Growth", "Stays in your account, no expiry"],
  },
];

export function LandingPricing({
  ctaHref = "/sign-up",
}: {
  ctaHref?: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PACKS.map((pack) => (
        <div
          key={pack.id}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-background p-7",
            pack.featured && "border-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)]",
          )}
        >
          {pack.featured && (
            <span className="absolute -top-2.5 left-7 rounded-full bg-foreground px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-background">
              Most chosen
            </span>
          )}
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold tracking-tight">{pack.name}</h3>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {pack.sets} {pack.sets === 1 ? "set" : "sets"}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold tracking-tight">
              ${pack.price}
            </span>
            <span className="text-sm text-muted-foreground">once</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{pack.blurb}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {pack.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2">
                <span className="mt-[7px] inline-block size-1 shrink-0 rounded-full bg-foreground" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            variant={pack.featured ? "default" : "outline"}
            className="mt-7 h-10 w-full"
          >
            <Link href={ctaHref}>
              Buy {pack.name} — ${pack.price}
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
