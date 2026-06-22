import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { CalendarView } from "@/features/calendar/CalendarView";
import { internalReservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";

export const Route = createFileRoute("/internal/calendar")({
  head: () => ({
    meta: [
      { title: "Internal calendar — Roomr" },
      { name: "description", content: "Month view of internal team reservations." },
    ],
  }),
  component: () => (
    <AuthGuard roles={["internal", "admin"]}>
      <InternalCalendarPage />
    </AuthGuard>
  ),
});

function InternalCalendarPage() {
  const { data: reservations = [] } = useQuery(internalReservationsQueryOptions());
  const navigate = useNavigate();
  const goToDetail = (r: ReservationDTO) =>
    navigate({ to: "/internal/reservations/$id", params: { id: r.id } });

  return (
    <AppShell>
      <CalendarView
        reservations={reservations}
        title="Internal calendar"
        description="Internal team reservations, at a glance."
        onReservationClick={goToDetail}
        reservationBadge={() => (
          <span className="text-[10px] uppercase tracking-wider rounded bg-accent text-accent-foreground px-1.5 py-0.5">
            Internal
          </span>
        )}
      />
    </AppShell>
  );
}
