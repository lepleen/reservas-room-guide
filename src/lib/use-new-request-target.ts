import { useAuth } from "@/contexts/AuthContext";

export type NewRequestTarget =
  | { to: "/reservations/new" | "/internal/reservations/new"; label: string }
  | null;

/**
 * Centralized role-based destination for the "New request" action.
 * - admin → null (admins don't create their own reservations)
 * - internal → /internal/reservations/new
 * - external (default authenticated user) → /reservations/new
 */
export function useNewRequestTarget(): NewRequestTarget {
  const { roles, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  if (roles.includes("admin")) return null;
  if (roles.includes("internal"))
    return { to: "/internal/reservations/new", label: "New internal request" };
  return { to: "/reservations/new", label: "New external reservation" };
}
