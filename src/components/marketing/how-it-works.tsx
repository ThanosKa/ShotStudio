const STEPS = [
  {
    n: "01",
    title: "Upload three screenshots",
    body: "Drop your hero feature, your differentiator, and one more. PNG or JPEG, up to 10 MB each. They never touch our disk.",
  },
  {
    n: "02",
    title: "Tell us the basics",
    body: "App name, a one-sentence pitch, and a category. We write the headline and auto-pick the style preset; you can override it.",
  },
  {
    n: "03",
    title: "Download three polished shots",
    body: "Three device-framed shots at 1290×2796 — one per source screen you uploaded, exactly what App Store Connect expects.",
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
      {STEPS.map((step) => (
        <div key={step.n} className="bg-background p-8">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Step {step.n}
          </div>
          <h3 className="mt-6 text-xl font-semibold tracking-tight">
            {step.title}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
