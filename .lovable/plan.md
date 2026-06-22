# Per-Role Navigation Refactor (final)

Architectural refactor only. UI, spacing, icons, typography, and responsive behavior remain identical. Auth/DB role values are not touched.

## Folder structure

```
src/
  config/
    routes.ts                 # shared route constants
    navigation/
      types.ts                # NavRole, NavItem, RoleNavigation, RoleConfig
      admin.ts internal.ts external.ts
      index.ts                # navigationByRole
    actions/
      admin.ts internal.ts external.ts
      index.ts                # actionsByRole
  hooks/
    useNavigation.ts          # useNavigation, useRoleActions, useNavRole
  lib/
    use-new-request-target.ts # refactored to read actions config
  components/
    AppShell.tsx              # generic shell; no nav arrays
```

## Shared route constants

### `src/config/routes.ts`
Single source of truth for every route used by navigation/actions:
```ts
export const ROUTES = {
  admin: "/admin",
  calendar: "/calendar",
  dashboard: "/dashboard",
  internalDashboard: "/internal/dashboard",
  newReservation: "/reservations/new",
  newInternalReservation: "/internal/reservations/new",
} as const;
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
```
All navigation and action configs import from this file — no hardcoded route strings elsewhere in `src/config/**`.

## Types (extensible)

### `src/config/navigation/types.ts`
```ts
export type NavRole = "admin" | "internal" | "external";

export type NavItem = {
  id: string;        // e.g. "internal.events"
  label: string;
  icon: LucideIcon;
  to: AppRoute;
};

export type RoleNavigation = {
  panelLabel: string;
  items: NavItem[];
};

export type ActionItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: AppRoute;
};

export type RoleActions = {
  primary?: ActionItem;
  // future: secondary?: ActionItem[];
};

// Forward-compatible umbrella — not used by AppShell today, but lets each
// role grow with permissions / feature flags / dashboard config without
// another refactor.
export type RoleConfig = {
  navigation: RoleNavigation;
  actions: RoleActions;
  // future fields (optional, additive):
  // permissions?: string[];
  // featureFlags?: Record<string, boolean>;
  // dashboard?: { defaultView?: string };
  // layout?: { sidebar?: "expanded" | "collapsed" };
};
```

`navigationByRole` and `actionsByRole` remain as today (small, focused maps consumed by hooks). When a role needs additional config, add the property to `RoleConfig` and a sibling `<role>.config.ts` — no AppShell change required.

## Per-role configs

`src/config/navigation/{admin,internal,external}.ts` — `RoleNavigation` with same labels/icons as today, routes via `ROUTES.*`. Items use stable IDs (`admin.review`, `admin.calendar`, `admin.all-events`, `internal.events`, `internal.calendar`, `internal.new-request`, `external.my-events`, `external.calendar`, `external.new-request`).

`src/config/actions/{admin,internal,external}.ts` — `RoleActions.primary` matching today's mobile CTA (admin: ShieldCheck/"Review"/`ROUTES.admin`; internal: Plus/"New"/`ROUTES.newInternalReservation`; external: Plus/"New"/`ROUTES.newReservation`).

## Single role-mapping source of truth

### `src/hooks/useNavigation.ts`
```ts
import { useAuth } from "@/contexts/AuthContext";

export function useNavRole(): NavRole | null {
  const { roles, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  if (roles.includes("admin")) return "admin";
  if (roles.includes("internal")) return "internal";
  return "external";
}

export function useNavigation(role: NavRole) { return navigationByRole[role]; }
export function useRoleActions(role: NavRole) { return actionsByRole[role]; }
```

`useNavRole` is the ONLY role → NavRole mapping in the project. `AppShell`, `useNewRequestTarget`, and any future role-aware UI consume it.

## Edits

### `src/components/AppShell.tsx`
- Remove inline `nav` array, `panelLabel` ternary, three-branch mobile CTA, `useNewRequestTarget` import, and the local `role` ternary.
- Replace with:
  ```ts
  const navRole = useNavRole();
  if (!navRole) { /* render existing guest sidebar/topbar branches unchanged */ }
  const { panelLabel, items } = useNavigation(navRole);
  const { primary } = useRoleActions(navRole);
  ```
- Sidebar maps `items` with identical JSX, classes, active-state logic, icons; keys by `item.id`.
- Mobile top bar renders one `<Link>` from `primary` with the exact wrapper classes used today. If `primary` is undefined, render nothing.
- Guest (unauthenticated) sidebar footer and "Sign in" link stay exactly as today.

### `src/lib/use-new-request-target.ts` — refactored, kept
Consumed by `dashboard.tsx` and `internal.dashboard.tsx` (unchanged). Now reads from the same role mapping and action config:
```ts
export function useNewRequestTarget() {
  const navRole = useNavRole();
  if (!navRole || navRole === "admin") return null;
  const primary = actionsByRole[navRole].primary;
  return primary ? { to: primary.to, label: primary.label } : null;
}
```
No duplicated routes, no duplicated role resolution.

## Out of scope
Auth, DB role values, permissions enforcement, routes themselves, reservation logic, dashboards, server functions, styling, sidebar width, spacing, icons, typography, mobile layout.
