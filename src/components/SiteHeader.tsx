import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "spaces", label: "Spaces" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sectionHref = (id: string) => (onLanding ? `#${id}` : `/#${id}`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-200",
        scrolled || !onLanding
          ? "border-b border-border bg-background/85 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Roomr</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={sectionHref(s.id)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {s.label}
            </a>
          ))}
          <Button asChild className="ml-2">
            <Link to="/book">Book a Space</Link>
          </Button>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/book">Book a Space</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <SheetClose asChild key={s.id}>
                    <a
                      href={sectionHref(s.id)}
                      className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/40 transition-colors"
                    >
                      {s.label}
                    </a>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link to="/book" className="mt-2">
                    <Button className="w-full">Book a Space</Button>
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
