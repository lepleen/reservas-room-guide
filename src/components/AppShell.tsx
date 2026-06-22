import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { CalendarDays, LogOut, Sparkles } from "lucide-react";
import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavRole, useNavigation, useRoleActions } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { user: authUser, profile, signOut } = useAuth();
  const user = authUser
    ? { name: profile?.full_name || authUser.email || "Account", email: authUser.email ?? "" }
    : null;
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navRole = useNavRole();
  const { panelLabel, items } = useNavigation(navRole);
  const { primary } = useRoleActions(navRole);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar px-4 py-6">
        <Link to="/" className="flex items-center gap-2 px-2 mb-6">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Roomr</div>
            <div className="text-xs text-muted-foreground">{panelLabel}</div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.to ||
              (item.to !== "/dashboard" && item.to !== "/" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border pt-4 mt-4">
          {user ? (
            <>
              <div className="px-3 py-2">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                  } catch {
                    /* noop */
                  }
                  navigate({ to: "/auth" });
                }}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <div className="px-3 py-2">
              <div className="text-xs text-muted-foreground">Browsing as guest</div>
              <Link to="/auth" className="text-xs text-primary hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 border-b border-border bg-background px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Roomr</span>
        </Link>
        {primary ? (
          <Link
            to={primary.to}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <primary.icon className="h-3.5 w-3.5" /> {primary.label}
          </Link>
        ) : null}
      </div>

      <main className="flex-1 md:pt-0 pt-14 min-w-0">
        <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <CalendarDays className="hidden h-5 w-5 text-muted-foreground" />
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
