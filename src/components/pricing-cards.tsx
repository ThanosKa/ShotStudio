"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PACKS = [
  { id: "starter", name: "Starter", credits: 1, price: "$7", blurb: "One App Store set" },
  { id: "growth", name: "Growth", credits: 4, price: "$17", blurb: "Four sets — for iterating" },
  { id: "studio", name: "Studio", credits: 10, price: "$37", blurb: "Ten sets — for portfolios" },
] as const;

type PackId = (typeof PACKS)[number]["id"];

export function PricingCards() {
  const [busy, setBusy] = useState<PackId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(packageId: PackId) {
    setError(null);
    setBusy(packageId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Checkout failed (${res.status})`;
        throw new Error(msg);
      }
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
        {PACKS.map((p) => (
          <Card key={p.id} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{p.name}</CardTitle>
              <CardDescription>{p.blurb}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-8 pb-6">
              <div>
                <div className="text-4xl font-semibold tracking-tight">
                  {p.price}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {p.credits} {p.credits === 1 ? "credit" : "credits"}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => buy(p.id)}
                disabled={busy !== null}
              >
                {busy === p.id ? "Redirecting…" : "Buy"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
    </div>
  );
}
