import { useAuth } from "@/contexts/AuthContext";
import { navigationByRole } from "@/config/navigation";
import { actionsByRole } from "@/config/actions";
import type { NavRole, RoleNavigation, RoleActions } from "@/config/navigation/types";

/**
 * Single source of truth for mapping the authenticated user's roles to a
 * presentation-layer NavRole. Auth/DB role values are not modified.
 * Unauthenticated visitors fall through to "external" to preserve the
 * existing shell layout for guests.
 */
export function useNavRole(): NavRole {
  const { roles } = useAuth();
  if (roles.includes("admin")) return "admin";
  if (roles.includes("internal")) return "internal";
  return "external";
}

export function useNavigation(role: NavRole): RoleNavigation {
  return navigationByRole[role];
}

export function useRoleActions(role: NavRole): RoleActions {
  return actionsByRole[role];
}
