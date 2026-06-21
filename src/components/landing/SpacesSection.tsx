import { Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import boardroom from "@/assets/space-boardroom.jpg";
import workshop from "@/assets/space-workshop.jpg";
import auditorium from "@/assets/space-auditorium.jpg";

const SPACES = [
  {
    image: boardroom,
    title: "Executive Boardrooms",
    description: "Premium meeting rooms with integrated AV for leadership reviews and client sessions.",
    capacity: "Up to 16 people",
  },
  {
    image: workshop,
    title: "Workshop & Training Rooms",
    description: "Flexible layouts for hands-on workshops, trainings and collaborative sprints.",
    capacity: "Up to 40 people",
  },
  {
    image: auditorium,
    title: "Conference Halls",
    description: "Large-format venues for keynotes, all-hands and corporate events.",
    capacity: "Up to 300 people",
  },
];

export function SpacesSection() {
  return (
    <section id="spaces" className="scroll-mt-24 py-24 bg-muted/30 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured spaces</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Find the room that fits the moment
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/book">
              Book a space <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SPACES.map((s) => (
            <article
              key={s.title}
              className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground flex-1">{s.description}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {s.capacity}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
