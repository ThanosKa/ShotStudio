"use client";

import { useState } from "react";
import { Show, SignUpButton } from "@clerk/nextjs";
import { cn, pluralize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BuyPackButton } from "@/components/marketing/buy-pack-button";
import {
  CREDIT_PACKAGE_LIST,
  type CreditPackageId,
  formatPriceUSD,
} from "@/lib/packages";

type Copy = {
  blurb: string;
  perks: string[];
};

const COPY: Record<CreditPackageId, Copy> = {
  starter: {
    blurb: "Try it. Two sets to find the look.",
    perks: ["2 generation sets", "All 4 style presets", "Credits never expire"],
  },
  growth: {
    blurb: "Iterate on copy or test alternate hero angles.",
    perks: [
      "5 generation sets",
      "All Starter perks",
      "Best per-set value if you A/B copy",
    ],
  },
  studio: {
    blurb: "Indie portfolios and small studios shipping a few apps a year.",
    perks: ["12 generation sets", "All Growth perks", "Lowest per-set price"],
  },
};

export function LandingPricing() {
  const [busy, setBusy] = useState<CreditPackageId | null>(null);

  async function buy(packageId: CreditPackageId) {
    if (busy !== null) return;
    setBusy(packageId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (
        !res.ok ||
        !data ||
        typeof data !== "object" ||
        !("checkoutUrl" in data) ||
        typeof (data as { checkoutUrl: unknown }).checkoutUrl !== "string"
      ) {
        setBusy(null);
        return;
      }
      window.location.assign((data as { checkoutUrl: string }).checkoutUrl);
    } catch {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {CREDIT_PACKAGE_LIST.map((pack) => {
        const copy = COPY[pack.id];
        const price = formatPriceUSD(pack.priceCents);
        return (
          <div
            key={pack.id}
            className={cn(
              "relative flex h-full flex-col rounded-xl border bg-background p-7",
              pack.featured && "border-foreground",
            )}
          >
            {pack.featured && (
              <span className="absolute -top-2.5 left-7 rounded-full bg-foreground px-2.5 py-0.5 font-mono text-caption uppercase tracking-wider text-background">
                Most chosen
              </span>
            )}
            <div className="flex items-baseline justify-between">
              <h3 className="text-heading-sm font-semibold">{pack.name}</h3>
              <span className="font-mono text-caption uppercase tracking-wider text-muted-foreground">
                {pack.credits} {pluralize(pack.credits, "set")}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-heading-lg font-semibold">{price}</span>
              <span className="text-body-lg text-muted-foreground">once</span>
            </div>
            <p className="mt-3 text-body-lg text-muted-foreground">{copy.blurb}</p>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-body-lg">
              {copy.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <span className="mt-[9px] inline-block size-1 shrink-0 rounded-full bg-foreground" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <Show
              when="signed-in"
              fallback={
                <SignUpButton mode="modal">
                  <Button
                    variant={pack.featured ? "default" : "outline"}
                    className="mt-7 h-10 w-full"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              }
            >
              <BuyPackButton
                packageId={pack.id}
                label={`Continue with ${pack.name}`}
                variant={pack.featured ? "default" : "outline"}
                busy={busy !== null}
                onBuy={buy}
              />
            </Show>
          </div>
        );
      })}
    </div>
  );
}
