"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseApiError } from "@/lib/http";
import type { CreditPackageId } from "@/lib/packages";

export function BuyPackButton({
  packageId,
  label,
  variant = "default",
}: {
  packageId: CreditPackageId;
  label: string;
  variant?: "default" | "outline";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) throw new Error(parseApiError(res.status, data, "Checkout failed"));
      if (
        !data ||
        typeof data !== "object" ||
        !("checkoutUrl" in data) ||
        typeof (data as { checkoutUrl: unknown }).checkoutUrl !== "string"
      ) {
        throw new Error("Checkout response missing redirect URL.");
      }
      window.location.href = (data as { checkoutUrl: string }).checkoutUrl;
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Checkout failed.");
    }
  }

  return (
    <div className="mt-7">
      <Button
        type="button"
        variant={variant}
        className="h-10 w-full"
        onClick={buy}
        disabled={busy}
      >
        {busy ? "Redirecting…" : label}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
