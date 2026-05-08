"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingCards } from "@/components/pricing-cards";

export function BuyCreditsPanel() {
  return (
    <Dialog open modal={false}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="dark bg-background text-foreground sm:max-w-5xl"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Buy credits to begin</DialogTitle>
          <DialogDescription>
            Each credit gets you a polished 4-image App Store screenshot set.
            Credits never expire. Failed generations refund automatically.
          </DialogDescription>
        </DialogHeader>
        <PricingCards />
      </DialogContent>
    </Dialog>
  );
}
