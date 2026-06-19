import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarClock, Plus, Search, Users, Building2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { AuthGuard } from "@/components/AuthGuard";
import { reservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";

export const Route = createFileRoute("/internal/dashboard")({
  head: () => ({
    meta: [
      { title: "Internal dashboard — Roomr" },
      { name: "description", content: "Internal team room reservations." },
    ],
  }),
  component: () => (<AuthGuard roles={["internal", "admin"]}><InternalDashboardPage /></AuthGuard>),
});

type Filter = "upcoming" | "past" | "all";

function InternalDashboardPage() {
  const { data: reservations = [], isLoading, error } = useQuery(reservationsQueryOptions());
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [q, setQ] = useState("");

  const todayISO = new Date().toISOString().slice(0, 10);
  const scoped = useMemo(
    () => reservations.filter((r) => r.reservationType === "internal"),
    [reservations],
  );
  const filtered = useMemo(() => {
    const byTime = scoped.filter((r) => {
      if (filter === "upcoming") return r.date >= todayISO;
      if (filter === "past") return r.date < todayISO;
      return true;
    });
    const term = q.trim().toLowerCase();
    return term
      ? byTime.filter(
          (r) =>
            r.eventName.toLowerCase().includes(term) ||
            r.room.toLowerCase().includes(term),
        )
      : byTime;
  }, [scoped, filter, q, todayISO]);

  const upcomingCount = scoped.filter((r) => r.date >= todayISO).length;
  const totalAttendees = scoped
    .filter((r) => r.date >= todayISO)
    .reduce((s, r) => s + r.attendees, 0);

  return (
    <AppShell>
      <PageHeader
        title="Internal events"
        description="Reservations submitted by the internal team."
        action={
          <Button asChild>
            <Link to="/internal/reservations/new">
              <Plus className="h-4 w-4" /> New internal request
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Upcoming" value={upcomingCount.toString()} icon={CalendarClock} />
        <Stat label="Expected attendees" value={totalAttendees.toLocaleString()} icon={Users} />
        <Stat label="Total internal events" value={scoped.length.toString()} icon={Building2} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-md border border-border bg-card p-1">
          {(["upcoming", "past", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-[6px] capitalize transition-colors",
                filter === f
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events or rooms"
            className="pl-9 w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <h3 className="text-base font-medium">No internal events yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit your first internal reservation.
          </p>
          <Button asChild className="mt-4">
            <Link to="/internal/reservations/new"><Plus className="h-4 w-4" /> New internal request</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <ReservationRow key={r.id} r={r} />
          ))}
        </ul>
      )}
    </AppShell>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ReservationRow({ r }: { r: ReservationDTO }) {
  return (
    <li>
      <Link
        to="/internal/reservations/$id"
        params={{ id: r.id }}
        className="group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors"
      >
        <DateBadge date={r.date} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{r.eventName}</span>
            <StatusBadge status={r.status} />
            <span className="text-[10px] uppercase tracking-wider rounded bg-accent text-accent-foreground px-1.5 py-0.5">
              Internal
            </span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground truncate">
            {r.room} · {r.startTime}–{r.endTime} · {r.attendees} attendees
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    </li>
  );
}

function DateBadge({ date }: { date: string }) {
  const d = new Date(date + "T00:00:00");
  const month = d.toLocaleString(undefined, { month: "short" });
  const day = d.getDate();
  return (
    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-secondary text-foreground">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{month}</span>
      <span className="text-base font-semibold leading-none">{day}</span>
    </div>
  );
}
