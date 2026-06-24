import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { CalendarView } from "@/features/calendar/CalendarView";
import { allReservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Admin calendar — Roomr" },
      { name: "description", content: "Month view of every reservation." },
    ],
  }),
  component: () => (
    <AuthenticatedLayout roles={["admin"]}>
      <AdminCalendarPage />
    </AuthenticatedLayout>
  ),
});

function AdminCalendarPage() {
  const { data: reservations = [] } = useQuery(allReservationsQueryOptions());
  const navigate = useNavigate();
  const goToDetail = (r: ReservationDTO) =>
    navigate({
      to: r.reservationType === "internal" ? "/internal/reservations/$id" : "/reservations/$id",
      params: { id: r.id },
    });

  return (
    <CalendarView
      reservations={reservations}
      title="Calendar"
      description="Every reservation across the organisation."
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
  );
}
