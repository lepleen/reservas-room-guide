import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "Who can request a reservation on Roomr?",
    a: "Both external users (visitors, clients, partners) and internal staff can request reservations. Each group has a tailored flow that captures the right details for review.",
  },
  {
    q: "How quickly are requests confirmed?",
    a: "Most requests are reviewed within one business day. Availability is checked automatically when you submit, so conflicts are caught before they reach an administrator.",
  },
  {
    q: "Can I edit or cancel a reservation?",
    a: "Yes. You can update or cancel any of your pending requests from your dashboard, and administrators can adjust approved reservations when plans change.",
  },
  {
    q: "Do you support recurring events and multi-day programs?",
    a: "Roomr handles single sessions, full-day events and longer programs. You can break large agendas into multiple linked reservations to keep ownership clear.",
  },
  {
    q: "Is my organization's data private?",
    a: "Internal and external workspaces are kept separate, and access is enforced at the database level so only authorized users can view a reservation.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-24 py-24 border-t border-border">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">FAQ</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          Answers to common questions
        </h2>

        <Accordion type="single" collapsible className="mt-10">
          {ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
