"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PricingCards } from "@/components/pricing-cards";

export function BuyCreditsButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="size-4" aria-hidden />
          Buy credits
        </Button>
      </DialogTrigger>
      <DialogContent className="dark bg-background text-foreground sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Buy more credits</DialogTitle>
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
