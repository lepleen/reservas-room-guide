import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, Plus, Search, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type Reservation } from "@/lib/store";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Roomr" },
      { name: "description", content: "Your upcoming and past room reservations." },
    ],
  }),
  component: DashboardPage,
});

type Filter = "upcoming" | "past" | "all";

function DashboardPage() {
  const { reservations } = useStore();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [q, setQ] = useState("");

  const todayISO = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => {
    const byTime = reservations.filter((r) => {
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
  }, [reservations, filter, q, todayISO]);

  const upcomingCount = reservations.filter((r) => r.date >= todayISO).length;
  const totalAttendees = reservations
    .filter((r) => r.date >= todayISO)
    .reduce((s, r) => s + r.attendees, 0);

  return (
    <AppShell>
      <PageHeader
        title="Your events"
        description="A calm overview of everything you have planned."
        action={
          <Button asChild>
            <Link to="/reservations/new">
              <Plus className="h-4 w-4" /> New reservation
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Upcoming" value={upcomingCount.toString()} icon={CalendarClock} />
        <Stat label="Expected attendees" value={totalAttendees.toLocaleString()} icon={Users} />
        <Stat label="Total events" value={reservations.length.toString()} icon={ArrowUpRight} />
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
        <EmptyState />
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

function ReservationRow({ r }: { r: Reservation }) {
  return (
    <li>
      <Link
        to="/reservations/$id"
        params={{ id: r.id }}
        className="group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors"
      >
        <DateBadge date={r.date} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{r.eventName}</span>
            <StatusBadge status={r.status} />
            {r.hasLiveBroadcast && (
              <span className="text-[10px] uppercase tracking-wider rounded bg-accent text-accent-foreground px-1.5 py-0.5">
                Broadcast
              </span>
            )}
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

export function StatusBadge({ status }: { status: Reservation["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-secondary text-foreground", Icon: Clock },
    approved: { label: "Approved", cls: "bg-primary/10 text-primary", Icon: CheckCircle2 },
    rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive", Icon: XCircle },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium",
        cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
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

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
      <h3 className="text-base font-medium">No events here yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Start by planning your first reservation.
      </p>
      <Button asChild className="mt-4">
        <Link to="/reservations/new"><Plus className="h-4 w-4" /> New reservation</Link>
      </Button>
    </div>
  );
}