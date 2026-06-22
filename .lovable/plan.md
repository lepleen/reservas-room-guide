## Problem
The previous refactor replaced explicit `<Button>`/`<Link>` JSX with the shared `<NewRequestButton>` component. This altered the original UI (labels like "New external reservation" became generic "New request", sidebar nav lost its "New request" entry, etc.). The intent was only to make the destination role-aware, not to change UI.

## Solution
Restore the original UI verbatim and centralize only the destination resolution in a single hook. Delete `NewRequestButton.tsx` since nothing will import it after restoration.

### 1. Centralized hook — `src/lib/use-new-request-target.ts` (new)
Single source of truth for role-based destination:

```ts
import { useAuth } from "@/contexts/AuthContext";

export type NewRequestTarget =
  | { to: "/reservations/new" | "/internal/reservations/new"; label: string }
  | null;

export function useNewRequestTarget(): NewRequestTarget {
  const { roles, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  if (roles.includes("admin")) return null;
  if (roles.includes("internal"))
    return { to: "/internal/reservations/new", label: "New internal request" };
  return { to: "/reservations/new", label: "New external reservation" };
}
```

Note: labels here drive only the **sidebar nav entry** (which originally used these exact strings). Dashboard buttons keep their own hardcoded original labels.

### 2. `src/components/AppShell.tsx` — restore original
- Restore the original `nav` array exactly:
  - admin: Review requests, Calendar, All events
  - internal: Internal events, Calendar, **New internal request** (Plus icon)
  - external: My events, Calendar, **New request** (Plus icon)
- Drive the "new request" sidebar entry's `to` via `useNewRequestTarget()` so admin gets no entry and the other two get the right route. Internal/external nav arrays use `target.to` and `target.label`.
- Restore mobile top bar exactly as before — three explicit `<Link>` branches (admin/internal/external) with original styling. Internal/external `to` come from `target.to`.
- Remove `NewRequestButton` import.

### 3. `src/routes/dashboard.tsx` — restore original
- Restore `import { Button } from "@/components/ui/button"` and `Plus` icon.
- PageHeader action: original `<Button asChild><Link to={target?.to ?? "/reservations/new"}><Plus className="h-4 w-4" /> New external reservation</Link></Button>`.
- `EmptyState`: restore original `<Button asChild className="mt-4"><Link …><Plus /> New external reservation</Link></Button>`.
- Replace `NewRequestButton` import with `useNewRequestTarget` from `@/lib/use-new-request-target`. Pass `target` into `EmptyState` as prop (or call the hook inside it).
- For admin viewing `/dashboard`, `target` is `null` — keep original behavior by falling back to `/reservations/new` (matches pre-refactor: admin saw the button too).

### 4. `src/routes/internal.dashboard.tsx` — restore original
- Same pattern: restore `Button`/`Plus` imports, restore both original buttons with label "New internal request", use `useNewRequestTarget()` only to resolve `to` (fallback `/internal/reservations/new`).

### 5. Delete `src/components/NewRequestButton.tsx`
After the edits, no file imports it. Remove via `rm`.

### Files touched
- create: `src/lib/use-new-request-target.ts`
- edit: `src/components/AppShell.tsx`, `src/routes/dashboard.tsx`, `src/routes/internal.dashboard.tsx`
- delete: `src/components/NewRequestButton.tsx`

## Out of scope
- No reservation logic, data, layout, label, icon, or styling changes beyond restoring originals.
- No other screens touched.