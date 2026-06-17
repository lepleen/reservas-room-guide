import { createFileRoute, Navigate } from "@tanstack/react-router";

// Legacy alias — superseded by the unified /auth page.
export const Route = createFileRoute("/signin")({
  component: () => <Navigate to="/auth" replace />,
});
