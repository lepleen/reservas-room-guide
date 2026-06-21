import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLES = [
  {
    icon: UserRound,
    title: "External User",
    description:
      "For visitors, clients, partners, or external organizations requesting a reservation.",
    cta: "Continue as External User",
    to: "/dashboard",
  },
  {
    icon: Building2,
    title: "Internal User",
    description:
      "For employees and internal staff creating reservations for meetings, events, or corporate activities.",
    cta: "Continue as Internal User",
    to: "/internal/dashboard",
  },
] as const;

export function RoleGateway() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reservation gateway</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          Choose how you'd like to continue
        </h1>
        <p className="mt-4 text-muted-foreground">
          Select the option that best describes you. You'll be taken to the right reservation flow
          for your role.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {ROLES.map(({ icon: Icon, title, description, cta, to }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-7 flex flex-col">
            <div className="h-11 w-11 rounded-md bg-secondary flex items-center justify-center mb-5">
              <Icon className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{description}</p>
            <Button asChild className="mt-6 w-fit">
              <Link to={to}>
                {cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
