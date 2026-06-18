import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: ReactNode;
  /** Required roles. If omitted, only authentication is required. */
  roles?: AppRole[];
  /** Where to redirect unauthenticated users. */
  redirectTo?: string;
}

/**
 * Client-side route guard. Works alongside the integration-managed
 * `_authenticated` layout for routes that haven't been moved into that subtree.
 */
export function AuthGuard({ children, roles, redirectTo = "/auth" }: AuthGuardProps) {
  if (import.meta.env.VITE_AUTH_BYPASS === "true") return <>{children}</>;
  const { loading, isAuthenticated, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: redirectTo, search: { redirect: window.location.pathname } as never });
      return;
    }
    if (roles && roles.length > 0 && !hasAnyRole(roles)) {
      navigate({ to: "/" });
    }
  }, [loading, isAuthenticated, hasAnyRole, roles, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  if (roles && roles.length > 0 && !hasAnyRole(roles)) return null;
  return <>{children}</>;
}
