import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { InternalEventForm } from "@/features/internal-event/InternalEventForm";

export const Route = createFileRoute("/internal/reservations/new")({
  head: () => ({
    meta: [
      { title: "New internal reservation — Roomr" },
      { name: "description", content: "Submit an internal-team room reservation request." },
    ],
  }),
  component: () => (
    <AuthenticatedLayout roles={["internal", "admin"]}>
      <NewInternalReservationPage />
    </AuthenticatedLayout>
  ),
});

function NewInternalReservationPage() {
  return (
    <>
      <PageHeader
        title="New internal reservation"
        description="Submit a room request on behalf of the internal team."
      />
      <InternalEventForm />
    </>
  );
}
