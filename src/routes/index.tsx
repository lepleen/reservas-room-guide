import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { SpacesSection } from "@/components/landing/SpacesSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ContactSection } from "@/components/landing/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roomr — Where Great Ideas Meet Great Spaces" },
      {
        name: "description",
        content:
          "Host meetings, conferences, workshops and corporate events with an intuitive reservation platform built for collaboration.",
      },
      { property: "og:title", content: "Roomr — Corporate space reservations" },
      {
        property: "og:description",
        content: "Reserve professional meeting rooms, workshops and conference halls in seconds.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <SpacesSection />
        <FAQSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
