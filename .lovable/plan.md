## Goal

Wire both reservation forms to the Admin Dashboard via Supabase. Today the forms already INSERT into `public.reservations`, but the admin dashboard, calendar, user dashboard, and detail pages still read from a local `useStore` (localStorage). Newly submitted reservations therefore never appear in Admin. This plan closes that gap with the smallest possible surface change.

## What's already in place (no change needed)

- `public.reservations` table exists with a `kind` column (`'user' | 'internal'`) — this is the reservation type discriminator. Status CHECK already allows `pending | approved | confirmed | rejected | cancelled`. No schema migration required.
- RLS policies already let admins read/update/delete every row and let owners read their own.
- Both form submit handlers (`features/user-reservation/submit.functions.ts`, `features/internal-event/submit.functions.ts`) already insert with the correct `kind` and `status='pending'`.

## What changes

### 1. New server functions (`src/features/admin/reservations.functions.ts`)

- `listReservations()` — `requireSupabaseAuth`, returns all rows ordered by date. RLS naturally scopes: admin sees all, internal sees internal, user sees own. Returns a normalized DTO shape matching the existing `Reservation` type (camelCase).
- `getReservationById({ id })` — single row fetch (for detail pages).
- `updateReservationStatus({ id, status, adminNotes? })` — admin-only (verifies `has_role('admin')`); writes `status`, `admin_notes`, `reviewed_at`.
- `updateReservation({ id, patch })` — admin-only edit of arbitrary editable fields (date/time/room/attendees/notes/etc.); reuses availability check.

### 2. Replace localStorage reads with TanStack Query

- `src/routes/admin.tsx`: swap `useStore()` for `useSuspenseQuery(listReservationsOptions)`. Add a fifth action button "Cancel" for non-pending rows (admin only). The existing Approve/Reject dialog calls `updateReservationStatus` (approved/rejected/cancelled).
- `src/routes/reservations.$id.tsx` and `src/routes/internal.reservations.$id.tsx`: read via `getReservationById`. Surface admin-only edit + status controls inside these pages so "View / Edit" works from the dashboard.
- `src/routes/dashboard.tsx` and `src/routes/calendar.tsx`: switch to the same `listReservations` query so users immediately see their newly submitted reservations.
- After successful submit in both forms, invalidate the `["reservations"]` query key (already redirects to the detail page — keep that UX).

### 3. Field naming

The spec asks for `reservation_type`. The existing column is `kind` with values `user|internal`. To avoid duplicate columns and risky data backfill, **map at the API boundary**: the server functions expose `reservationType: 'external' | 'internal'` in returned DTOs (mapping `kind='user' → 'external'`). No DB migration; the database stays the single source of truth. If you prefer a physical rename, say so and I'll add a migration that renames `kind → reservation_type` and updates the CHECK to `external|internal` plus all references — it's a wider change so I'm defaulting to the mapping approach.

### 4. Cleanup

- Delete `src/lib/store.tsx` once all routes are migrated (or keep just the `findConflicts` helper if other code uses it — I'll inline the rare remaining usage). No design, layout, navigation, auth, or form-UI changes.

## Out of scope (per the request)

Login/auth, homepage, navigation, form layout/styling, existing admin permissions model.

## Verification

- Submit one external + one internal reservation as different users → both appear instantly in `/admin` with `Pending`.
- Admin Approve / Reject / Cancel updates the row and badge; requester sees the new status on their dashboard after refetch.
- Admin "Edit" on the detail page persists and the change shows on the list.
- RLS still blocks non-admins from seeing others' reservations (verified by signing in as a non-admin user).

## Open question

Confirm the field-naming approach: keep `kind` in the DB and expose `reservationType` (external|internal) in the API (default), or physically rename the column to `reservation_type`?  
  
Answer:

I want Supabase to be the single source of truth for all reservation data.

Please proceed with the migration from localStorage/useStore to Supabase-backed queries.

My goal is to manage and audit reservation data directly from Supabase in the future.

Requirements:

- Keep the existing `kind` column.
- Do not create a new `reservation_type` column.
- Expose `reservationType` only at the API/DTO layer if needed.
- Replace all reservation-related localStorage/useStore reads with Supabase queries.
- The Admin Dashboard, Calendar, User Dashboard, and Reservation Detail pages must read directly from Supabase.
- Any reservation created, updated, approved, rejected, confirmed, or cancelled must be immediately reflected across the application through Supabase as the single source of truth.

Please remove any reservation persistence logic that relies on localStorage once the migration is complete.

The final architecture should use Supabase as the authoritative database for all reservation workflows.