import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ReservationForm } from "@/components/ReservationForm";

export const Route = createFileRoute("/internal/reservations/new")({
  head: () => ({
    meta: [
      { title: "New internal reservation — Roomr" },
      { name: "description", content: "Submit an internal-team room reservation request." },
    ],
  }),
  component: () => (
    <AuthGuard roles={["internal", "admin"]}>
      <NewInternalReservationPage />
    </AuthGuard>
  ),
});

function NewInternalReservationPage() {
  return (
    <AppShell>
      <PageHeader
        title="New internal reservation"
        description="Submit a room request on behalf of the internal team."
      />
      <ReservationForm mode="internal" />
    </AppShell>
  );
}
