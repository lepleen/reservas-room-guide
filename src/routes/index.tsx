import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roomr — Event reservations made simple" },
      {
        name: "description",
        content: "Plan rooms, AV, schedules, and registrations in one minimalist workspace.",
      },
      { property: "og:title", content: "Roomr — Event reservations" },
      {
        property: "og:description",
        content: "Plan rooms, AV, schedules, and registrations in one place.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Roomr</span>
          </Link>
          <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Creat account
          </Link>
          <QuickLink to="/admin" icon={ShieldCheck} label="Admin review" />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-24 pb-12 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Event operations</p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
          Estou atualizando o projeto diariamente, fique a vontade para me enviar feedbacks.
          <br />
        </h1>
        <img src="../src/img/g2.png" alt="" />
        <h6 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
          (doug é careca 😜)
        </h6>
        <p className="mt-5 text-base text-muted-foreground max-w-xl mx-auto">
          Submit room reservation requests with rooms, AV, catering, schedules and speakers.
          Administrators review and decide — no accounts required to explore.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 grid sm:grid-cols-2 gap-4">
        <RoleCard
          icon={UserRound}
          title="I'm a user"
          description="Browse events, fill the reservation form, and submit a request to the administrator."
          cta="User"
          to="/dashboard"
        />
        <RoleCard
          icon={Building2}
          title="I'm an internal user"
          description="Submit room requests on behalf of internal teams in a fully separated workspace."
          cta="Internal user"
          to="/internal/dashboard"
        />

        {/*
        <RoleCard
          icon={ShieldCheck}
          title="I'm an administrator"
          description="Review submitted requests and approve or reject them."
          cta="Open admin panel"
          to="/admin"
        />
        */}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 grid sm:grid-cols-4 gap-3">
        {/* <QuickLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <QuickLink to="/reservations/new" icon={Plus} label="New reservation" />
        <QuickLink to="/internal/dashboard" icon={Building2} label="Internal panel" />
        <QuickLink to="/admin" icon={ShieldCheck} label="Admin review" /> */}
      </section>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
  cta,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
      <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground flex-1">{description}</p>
      <Button asChild className="mt-5 w-fit">
        <Link to={to}>
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-border bg-card px-4 py-3 text-sm flex items-center justify-between hover:border-primary/40 transition-colors"
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
