import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type Target = { to: "/reservations/new" | "/internal/reservations/new"; label: string } | null;

/**
 * Resolves the "New request" destination from the authenticated user's role.
 * - admin → null (no new-request CTA)
 * - internal → /internal/reservations/new
 * - external (default authenticated user) → /reservations/new
 */
export function useNewRequestTarget(): Target {
  const { roles, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  if (roles.includes("admin")) return null;
  if (roles.includes("internal"))
    return { to: "/internal/reservations/new", label: "New internal request" };
  return { to: "/reservations/new", label: "New request" };
}

interface NewRequestButtonProps extends Omit<ButtonProps, "asChild" | "children"> {
  /** Override the default label (icon is always shown). */
  label?: string;
  /** Render compact label (used in tight mobile bars). */
  compact?: boolean;
}

export function NewRequestButton({ label, compact, ...buttonProps }: NewRequestButtonProps) {
  const target = useNewRequestTarget();
  if (!target) return null;
  return (
    <Button asChild {...buttonProps}>
      <Link to={target.to}>
        <Plus className="h-4 w-4" /> {label ?? (compact ? "New" : target.label)}
      </Link>
    </Button>
  );
}
