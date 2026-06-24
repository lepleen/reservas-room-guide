import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarClock, Users } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { ReservationDashboard } from "@/features/dashboard/ReservationDashboard";
import { externalReservationsQueryOptions } from "@/features/reservations/queries";
import type { ReservationDTO } from "@/features/reservations/types";
import { ROUTES } from "@/config/routes";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Roomr" },
      { name: "description", content: "Your upcoming and past room reservations." },
    ],
  }),
  component: () => (
    <AuthenticatedLayout roles={["external"]}>
      <DashboardPage />
    </AuthenticatedLayout>
  ),
});

function DashboardPage() {
  const { data: reservations = [] } = useQuery(externalReservationsQueryOptions());
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
    navigate({ to: "/reservations/$id", params: { id: r.id } });
  const goToNew = () => navigate({ to: ROUTES.newReservation });

  return (
    <ReservationDashboard
      reservations={reservations}
      title="Your external events"
      description="A calm overview of everything you have planned."
      stats={stats}
      cta={{ label: "New external reservation", onClick: goToNew }}
      emptyTitle="No events here yet"
      emptyDescription="Start by planning your first reservation."
      emptyCta={{ label: "New external reservation", onClick: goToNew }}
      onReservationClick={goToDetail}
    />
  );
}
