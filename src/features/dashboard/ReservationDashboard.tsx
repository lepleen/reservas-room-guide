import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { ReservationDTO } from "@/features/reservations/types";

export type DashboardStat = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
};

export type DashboardCta = {
  label: string;
  onClick: () => void;
};

export type ReservationDashboardProps = {
  reservations: ReservationDTO[];
  title: string;
  description: string;
  stats: DashboardStat[];
  /** Header CTA (e.g. "New external reservation"). Omit for admin. */
  cta?: DashboardCta;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta?: DashboardCta;
  onReservationClick: (reservation: ReservationDTO) => void;
  /** Optional extension point for role-specific badges next to events. */
  reservationBadge?: (reservation: ReservationDTO) => ReactNode;
};

type Filter = "upcoming" | "past" | "all";

/**
 * Presentational reservation list. Owns stat cards, filter tabs, search,
 * empty state, and row layout. No routing, auth, or role knowledge.
 */
export function ReservationDashboard({
  reservations,
  title,
  description,
  stats,
  cta,
  emptyTitle,
  emptyDescription,
  emptyCta,
  onReservationClick,
  reservationBadge,
}: ReservationDashboardProps) {
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
          (r) => r.eventName.toLowerCase().includes(term) || r.room.toLowerCase().includes(term),
        )
      : byTime;
  }, [reservations, filter, q, todayISO]);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          cta ? (
            <Button onClick={cta.onClick}>
              <Plus className="h-4 w-4" /> {cta.label}
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
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
          <h3 className="text-base font-medium">{emptyTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
          {emptyCta && (
            <Button onClick={emptyCta.onClick} className="mt-4">
              <Plus className="h-4 w-4" /> {emptyCta.label}
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onReservationClick(r)}
                className="group w-full text-left flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors"
              >
                <DateBadge date={r.date} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{r.eventName}</span>
                    <StatusBadge status={r.status} />
                    {reservationBadge?.(r)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground truncate">
                    {r.room} · {r.startTime}–{r.endTime} · {r.attendees} attendees
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
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
