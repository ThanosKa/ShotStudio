import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/marketing/faq-data";

export function FAQ() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full divide-y border-y"
    >
      {FAQS.map(({ q, a }, index) => (
        <AccordionItem
          key={q}
          value={`item-${index}`}
          className="border-b-0 last:border-b-0"
        >
          <AccordionTrigger className="text-heading-sm font-semibold tracking-tight hover:no-underline">
            {q}
          </AccordionTrigger>
          <AccordionContent className="text-body-lg text-muted-foreground">
            {a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
