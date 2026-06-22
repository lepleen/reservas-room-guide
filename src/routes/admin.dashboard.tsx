import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarClock, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ReservationDashboard } from "@/features/dashboard/ReservationDashboard";
import { allReservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "All events — Roomr" },
      { name: "description", content: "Every reservation across the organisation." },
    ],
  }),
  component: () => (
    <AuthGuard roles={["admin"]}>
      <AdminDashboardPage />
    </AuthGuard>
  ),
});

function AdminDashboardPage() {
  const { data: reservations = [] } = useQuery(allReservationsQueryOptions());
  const navigate = useNavigate();

  const todayISO = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => {
    const upcoming = reservations.filter((r) => r.date >= todayISO);
    const totalAttendees = upcoming.reduce((s, r) => s + r.attendees, 0);
    return [
      { label: "Upcoming", value: upcoming.length.toString(), icon: CalendarClock },
      { label: "Expected attendees", value: totalAttendees.toLocaleString(), icon: Users },
      { label: "Total events", value: reservations.length.toString(), icon: ArrowUpRight },
    ];
  }, [reservations, todayISO]);

  const goToDetail = (r: ReservationDTO) =>
    navigate({
      to: r.reservationType === "internal" ? "/internal/reservations/$id" : "/reservations/$id",
      params: { id: r.id },
    });

  return (
    <AppShell>
      <ReservationDashboard
        reservations={reservations}
        title="All events"
        description="Every reservation across the organisation."
        stats={stats}
        emptyTitle="No events yet"
        emptyDescription="Approved and pending reservations will appear here."
        onReservationClick={goToDetail}
        reservationBadge={(r) => (
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5",
              r.reservationType === "internal"
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-foreground",
            )}
          >
            {r.reservationType === "internal" ? "Internal" : "External"}
          </span>
        )}
      />
    </AppShell>
  );
}
