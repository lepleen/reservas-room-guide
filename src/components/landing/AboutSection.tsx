import { CalendarCheck, Users, Clock, Building2, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  { icon: CalendarCheck, title: "Easy Reservations", body: "Book the right space in seconds with real-time availability and instant confirmations." },
  { icon: Building2, title: "Professional Spaces", body: "Curated rooms equipped for meetings, conferences, workshops and large-scale events." },
  { icon: Clock, title: "Flexible Booking", body: "Reserve by the hour or for full-day programs — plans adapt as your agenda evolves." },
  { icon: Users, title: "Business Collaboration", body: "Bring internal teams and external partners together in one unified workspace." },
  { icon: Sparkles, title: "Efficient Scheduling", body: "Automatic conflict detection keeps every booking accurate and friction-free." },
];

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24 py-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">About Roomr</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            One platform for every corporate space
          </h2>
          <p className="mt-4 text-muted-foreground">
            Roomr centralizes corporate space reservations and gives every team a modern experience
            for organizing meetings, conferences, workshops and business events — from quick syncs
            to multi-day programs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-secondary-foreground" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
