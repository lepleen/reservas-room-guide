import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { UserReservationForm } from "@/features/user-reservation/UserReservationForm";

export const Route = createFileRoute("/reservations/new")({
  head: () => ({
    meta: [
      { title: "New reservation — Roomr" },
      { name: "description", content: "Plan a new room reservation with full event details." },
    ],
  }),
  component: () => (
    <AuthenticatedLayout roles={["external"]}>
      <NewReservationPage />
    </AuthenticatedLayout>
  ),
});

function NewReservationPage() {
  return (
    <>
      <PageHeader
        title="New reservation"
        description="Capture everything needed for a smooth event."
      />
      <UserReservationForm />
    </>
  );
}
