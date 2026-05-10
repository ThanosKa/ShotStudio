"use client";

import { Button } from "@/components/ui/button";
import type { CreditPackageId } from "@/lib/packages";

export function BuyPackButton({
  packageId,
  label,
  variant = "default",
  busy,
  onBuy,
}: {
  packageId: CreditPackageId;
  label: string;
  variant?: "default" | "outline";
  busy: boolean;
  onBuy: (id: CreditPackageId) => void;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      className="mt-7 h-10 w-full"
      onClick={() => onBuy(packageId)}
      disabled={busy}
    >
      {busy ? "Processing…" : label}
    </Button>
  );
}
