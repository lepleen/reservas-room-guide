import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS = [
  { icon: MapPin, label: "Address", value: "1 Innovation Square, Suite 200" },
  { icon: Mail, label: "Email", value: "hello@roomr.app" },
  { icon: Phone, label: "Phone", value: "+1 (555) 010-1234" },
  { icon: Clock, label: "Hours", value: "Mon–Fri · 9:00–18:00" },
];

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-24 py-24 bg-muted/30 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            Let's plan your next event together
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have a question about availability, capacity or services? Our team is here to help —
            or skip ahead and submit a reservation request directly.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link to="/book">
                Book a Space <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {ITEMS.map(({ icon: Icon, label, value }) => (
            <li key={label} className="rounded-xl border border-border bg-card p-5">
              <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center">
                <Icon className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-1 text-sm font-medium">{value}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
