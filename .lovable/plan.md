## Goal

Ensure every signed-in user sees a "New request" button that routes to the correct form for their role, and hide it for admins.

## Current state (`src/components/AppShell.tsx`)

- Desktop sidebar nav already includes the correct entry per role:
  - user → `/reservations/new` ("New request")
  - internal → `/internal/reservations/new` ("New internal request")
  - admin → no new-request link (correct)
- Mobile top bar incorrectly shows a "New" button for admin (links to `/admin` "Review", but there is no consistent "new request" CTA pattern, and the admin branch should simply have no CTA).
- The role-switcher buttons in the sidebar call `setRole(r)`, which is undefined → runtime error (`ReferenceError: setRole is not defined`). This is dead/legacy code from before roles were derived from `useAuth()`.

## Changes

### 1. `src/components/AppShell.tsx` — mobile top bar

- Keep the "New" CTA for `user` (→ `/reservations/new`) and `internal` (→ `/internal/reservations/new`).
- For `admin`, render no right-side CTA button (remove the Review shortcut to match the "no new request for admin" rule and keep the bar clean — admin still has full nav via the sidebar / future mobile menu).

### 2. `src/components/AppShell.tsx` — remove broken role switcher

- Delete the three role-switcher buttons block (the one calling `setRole`). Role comes from `useAuth()` now; manual switching is not supported and currently crashes on click.

### 3. No other files touched

- Sidebar desktop nav already matches the requested behavior.
- Routes `/reservations/new` and `/internal/reservations/new` already exist and remain unchanged.
- No backend, auth, or reservation logic changes.

## Out of scope

- Adding a global FAB or duplicating the CTA on dashboards (sidebar + mobile top bar are sufficient).
- Reworking admin mobile navigation beyond removing the misleading CTA.  
  
  
Changes:  
The routing changes look correct, but I'd like to keep the scope focused on the "New Request" behavior.
  Please adjust the plan as follows:
  - Update **every "New Request" CTA** across the application (desktop sidebar, mobile header, dashboard actions, empty states, or any other location where it appears) so they all follow the same role-based behavior.
  - Determine the destination from the authenticated user's role instead of duplicating route logic in multiple components.
  - External User → `/reservations/new`
  - Internal User → `/internal/reservations/new`
  - Admin → do not render a "New Request" button anywhere in the UI.
  - When the button is hidden for admins, the layout should automatically collapse without leaving empty spacing.
  - Verify that users cannot access another role's reservation page by manually entering the URL. Unauthorized access should follow the application's existing authorization behavior.
  For this change, **do not modify the role-switcher code** or perform unrelated refactoring. If there is dead or broken code (`setRole`), we'll address that in a separate task to keep this change isolated and easier to review.