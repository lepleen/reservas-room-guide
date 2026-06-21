import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-meeting-room.jpg";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative scroll-mt-20 -mt-16 pt-16 min-h-[88vh] flex items-center overflow-hidden"
    >
      <img
        src={heroImage}
        alt="Modern corporate meeting room with city view"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/30" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
            Corporate space reservations
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Where Great Ideas Meet Great Spaces
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl">
            Host meetings, conferences, workshops and corporate events through an intuitive
            reservation platform designed for collaboration and innovation.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/book">
                Book a Space <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
