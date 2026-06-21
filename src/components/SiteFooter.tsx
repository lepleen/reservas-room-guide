import { Link } from "@tanstack/react-router";
import { Sparkles, Github, Linkedin, Twitter } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Roomr</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            A modern reservation platform for meetings, conferences, workshops and corporate events.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Quick links</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="/#home" className="hover:text-foreground">Home</a></li>
            <li><a href="/#about" className="hover:text-foreground">About</a></li>
            <li><a href="/#spaces" className="hover:text-foreground">Spaces</a></li>
            <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>
            <li><Link to="/book" className="hover:text-foreground">Book a Space</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1 Innovation Square, Suite 200</li>
            <li>hello@roomr.app</li>
            <li>+1 (555) 010-1234</li>
            <li>Mon–Fri · 9:00–18:00</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms & Conditions</a></li>
          </ul>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {year} Roomr. All rights reserved.</span>
          <span>Built for great spaces and great teams.</span>
        </div>
      </div>
    </footer>
  );
}
