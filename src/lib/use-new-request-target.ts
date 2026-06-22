import { useNavRole } from "@/hooks/useNavigation";
import { actionsByRole } from "@/config/actions";

export type NewRequestTarget = { to: string; label: string } | null;

/**
 * Role-aware destination for the "New request" CTA on dashboards.
 * Reads from the shared actions config so routes/labels are not duplicated.
 */
export function useNewRequestTarget(): NewRequestTarget {
  const navRole = useNavRole();
  if (!navRole || navRole === "admin") return null;
  const primary = actionsByRole[navRole].primary;
  return primary ? { to: primary.to, label: primary.label } : null;
}
