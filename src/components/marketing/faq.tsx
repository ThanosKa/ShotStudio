const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is this a subscription?",
    a: "No. Credit packs are one-time purchases. Buy what you need; what you don't use stays in your account.",
  },
  {
    q: "Where are my screenshots stored?",
    a: "Nowhere. Uploads are passed to the model in-memory and dropped after generation. Outputs are returned to your browser only — there's no images table, no S3 bucket, no thumbnail cache.",
  },
  {
    q: "What if a generation fails?",
    a: "We retry the failing shot once automatically. If it still doesn't deliver four valid images, your credit is refunded — no support ticket needed.",
  },
  {
    q: "Can I edit the text after?",
    a: "Yes. Every text element on every shot is click-to-edit on the preview screen, and you can regenerate any single shot for free until you're happy.",
  },
  {
    q: "What sizes do I get?",
    a: "Four PNGs at 1290×2796, the App Store iPhone 6.7\" portrait spec — sRGB, no transparency, no watermark.",
  },
  {
    q: "Do you offer refunds?",
    a: "All sales are final, per the Terms. We refund credits automatically on failed generations; we don't process discretionary refunds beyond that.",
  },
];

export function FAQ() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2">
      {FAQS.map(({ q, a }) => (
        <div key={q} className="bg-background p-7">
          <h3 className="text-base font-semibold tracking-tight">{q}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{a}</p>
        </div>
      ))}
    </div>
  );
}
