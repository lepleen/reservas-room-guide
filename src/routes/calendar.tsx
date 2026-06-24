import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { CalendarView } from "@/features/calendar/CalendarView";
import { externalReservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Roomr" },
      { name: "description", content: "Month view of your external room reservations." },
    ],
  }),
  component: () => (
    <AuthenticatedLayout roles={["external"]}>
      <CalendarPage />
    </AuthenticatedLayout>
  ),
});

function CalendarPage() {
  const { data: reservations = [] } = useQuery(externalReservationsQueryOptions());
  const navigate = useNavigate();
  const goToDetail = (r: ReservationDTO) =>
    navigate({ to: "/reservations/$id", params: { id: r.id } });

  return (
    <CalendarView
      reservations={reservations}
      title="Calendar"
      description="Your external reservations, at a glance."
      onReservationClick={goToDetail}
    />
  );
}
