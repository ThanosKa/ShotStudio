import { FAQS } from "@/lib/marketing/faq-data";

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
