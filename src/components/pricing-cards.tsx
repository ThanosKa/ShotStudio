"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseApiError } from "@/lib/http";
import {
  CREDIT_PACKAGE_LIST,
  type CreditPackageId,
  formatPriceUSD,
} from "@/lib/packages";
import { pluralize } from "@/lib/utils";

const BLURBS: Record<CreditPackageId, string> = {
  starter: "One App Store set",
  growth: "Four sets — for iterating",
  studio: "Ten sets — for portfolios",
};

export function PricingCards() {
  const [busy, setBusy] = useState<CreditPackageId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(packageId: CreditPackageId) {
    setError(null);
    setBusy(packageId);
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
      setBusy(null);
      setError(err instanceof Error ? err.message : "Checkout failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {CREDIT_PACKAGE_LIST.map((p) => (
          <Card key={p.id} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-heading-sm">{p.name}</CardTitle>
              <CardDescription>{BLURBS[p.id]}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-8 pb-6">
              <div>
                <div className="text-heading-lg font-semibold">
                  {formatPriceUSD(p.priceCents)}
                </div>
                <div className="mt-1 text-body-lg text-muted-foreground">
                  {p.credits} {pluralize(p.credits, "credit")}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => buy(p.id)}
                disabled={busy !== null}
              >
                {busy === p.id ? "Redirecting" : "Buy"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
    </div>
  );
}
