import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import type { AppRole } from "@/contexts/AuthContext";

interface AuthenticatedLayoutProps {
  roles: AppRole[];
  children: ReactNode;
}

/**
 * Shared layout for protected routes. Combines the AuthGuard role check with
 * the AppShell chrome so individual routes don't repeat both wrappers.
 */
export function AuthenticatedLayout({ roles, children }: AuthenticatedLayoutProps) {
  return (
    <AuthGuard roles={roles}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
