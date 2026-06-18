import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ReservationForm } from "@/components/ReservationForm";

export const Route = createFileRoute("/reservations/new")({
  head: () => ({
    meta: [
      { title: "New reservation — Roomr" },
      { name: "description", content: "Plan a new room reservation with full event details." },
    ],
  }),
  component: () => (
    <AuthGuard>
      <NewReservationPage />
    </AuthGuard>
  ),
});

function NewReservationPage() {
  return (
    <AppShell>
      <PageHeader
        title="New reservation"
        description="Capture everything needed for a smooth event."
      />
      <ReservationForm mode="external" />
    </AppShell>
  );
}
