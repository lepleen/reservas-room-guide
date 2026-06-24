import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarClock, Users } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { ReservationDashboard } from "@/features/dashboard/ReservationDashboard";
import { internalReservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";
import { ROUTES } from "@/config/routes";

export const Route = createFileRoute("/internal/dashboard")({
  head: () => ({
    meta: [
      { title: "Internal dashboard — Roomr" },
      { name: "description", content: "Internal team room reservations." },
    ],
  }),
  component: () => (
    <AuthenticatedLayout roles={["internal", "admin"]}>
      <InternalDashboardPage />
    </AuthenticatedLayout>
  ),
});

function InternalDashboardPage() {
  const { data: reservations = [] } = useQuery(internalReservationsQueryOptions());
  const navigate = useNavigate();

  const todayISO = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => {
    const upcoming = reservations.filter((r) => r.date >= todayISO);
    const totalAttendees = upcoming.reduce((s, r) => s + r.attendees, 0);
    return [
      { label: "Upcoming", value: upcoming.length.toString(), icon: CalendarClock },
      { label: "Expected attendees", value: totalAttendees.toLocaleString(), icon: Users },
      { label: "Total internal events", value: reservations.length.toString(), icon: Building2 },
    ];
  }, [reservations, todayISO]);

  const goToDetail = (r: ReservationDTO) =>
    navigate({ to: "/internal/reservations/$id", params: { id: r.id } });
  const goToNew = () => navigate({ to: ROUTES.newInternalReservation });

  return (
    <ReservationDashboard
      reservations={reservations}
      title="Your Internal events"
      description="Reservations submitted by the internal team."
      stats={stats}
      cta={{ label: "New internal request", onClick: goToNew }}
      emptyTitle="No internal events yet"
      emptyDescription="Submit your first internal reservation."
      emptyCta={{ label: "New internal request", onClick: goToNew }}
      onReservationClick={goToDetail}
      reservationBadge={() => (
        <span className="text-[10px] uppercase tracking-wider rounded bg-accent text-accent-foreground px-1.5 py-0.5">
          Internal
        </span>
      )}
    />
  );
}
