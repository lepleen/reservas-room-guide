import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/AuthGuard";
import { reservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Roomr" },
      { name: "description", content: "Month view of every room reservation." },
    ],
  }),
  component: () => (
    <AuthGuard>
      <CalendarPage />
    </AuthGuard>
  ),
});

function CalendarPage() {
  const { data: reservations, isLoading, error } = useQuery(reservationsQueryOptions());
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, ReservationDTO[]>();
    for (const r of reservations) {
      if (!map.has(r.date)) map.set(r.date, []);
      map.get(r.date)!.push(r);
    }
    return map;
  }, [reservations]);

  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const firstOfMonth = new Date(cursor.y, cursor.m, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(cursor.y, cursor.m, 1 - startWeekday);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const todayISO = new Date().toISOString().slice(0, 10);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const selectedEvents = selected ? (byDate.get(selected) ?? []) : [];

  const detailHref = (r: ReservationDTO) =>
    r.reservationType === "internal" ? "/internal/reservations/$id" : "/reservations/$id";

  return (
    <AppShell>
      <PageHeader
        title="Calendar"
        description="Every reservation, at a glance."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { ...c, m: c.m - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-44 text-center text-sm font-medium capitalize">{monthName}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { ...c, m: c.m + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const n = new Date();
                setCursor({ y: n.getFullYear(), m: n.getMonth() });
              }}
            >
              Today
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/40">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6">
          {days.map((d, i) => {
            const key = iso(d);
            const inMonth = d.getMonth() === cursor.m;
            const isToday = key === todayISO;
            const isSelected = key === selected;
            const events = byDate.get(key) ?? [];
            return (
              <button
                type="button"
                key={i}
                onClick={() => setSelected(key)}
                className={cn(
                  "min-h-[92px] border-r border-b border-border p-2 text-left flex flex-col gap-1 transition-colors",
                  !inMonth && "bg-muted/30 text-muted-foreground",
                  isSelected && "ring-2 ring-primary ring-inset",
                  "hover:bg-secondary/40",
                  (i + 1) % 7 === 0 && "border-r-0",
                  i >= 35 && "border-b-0",
                )}
              >
                <span
                  className={cn(
                    "text-xs inline-flex items-center justify-center h-5 w-5 rounded-full",
                    isToday && "bg-primary text-primary-foreground font-semibold",
                  )}
                >
                  {d.getDate()}
                </span>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={cn(
                        "truncate text-[10.5px] leading-tight rounded px-1 py-0.5",
                        e.status === "approved" || e.status === "confirmed"
                          ? "bg-primary/15 text-primary"
                          : e.status === "rejected" || e.status === "cancelled"
                            ? "bg-destructive/10 text-destructive line-through"
                            : "bg-secondary text-foreground",
                      )}
                      title={`${e.eventName} (${e.startTime}–${e.endTime})`}
                    >
                      {e.startTime} {e.eventName}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-muted-foreground">+{events.length - 3} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold mb-3">
            {new Date(selected + "T00:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reservations on this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents
                .slice()
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((r) => (
                  <li key={r.id}>
                    <Link
                      to={detailHref(r)}
                      params={{ id: r.id }}
                      className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors"
                    >
                      <span className="font-mono text-xs text-muted-foreground w-24">
                        {r.startTime}–{r.endTime}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{r.eventName}</span>
                          <StatusBadge status={r.status} />
                          {r.reservationType === "internal" && (
                            <span className="text-[10px] uppercase tracking-wider rounded bg-accent text-accent-foreground px-1.5 py-0.5">
                              Internal
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.room} · {r.attendees} attendees
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </AppShell>
  );
}
