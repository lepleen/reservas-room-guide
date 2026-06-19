## Goal

Add per-room, time-overlap availability validation to both reservation flows (External User and Internal Event), with frontend hints, a friendly "Request availability" dialog, and authoritative backend enforcement.

## Architecture analysis (current state)

- **Status storage**: `public.reservations.status text CHECK IN ('pending','approved','rejected')`. Needs `confirmed` + `cancelled` added.
- **Availability today**: none. Both forms accept any date/time. `findConflicts` exists in `src/lib/store.tsx` but is unused by the new Supabase-backed flows.
- **Calendar component**: `src/routes/calendar.tsx` is read-only visualization. Date pickers in forms are plain `<input type="date">` / `<input type="time">` — there is no calendar picker to disable dates on.
- **Submit path**: `src/features/user-reservation/submit.functions.ts` and `src/features/internal-event/submit.functions.ts` both `INSERT` into `reservations` with no conflict check.
- **Room**: derived from `setupOptionId` via `getSetupOption(...).room` — stored as `reservations.room`.

## Plan

### 1. Database (one migration)

- Drop the existing status CHECK; add a new CHECK allowing `pending | approved | confirmed | rejected | cancelled`.
- Add an EXCLUSION constraint to atomically prevent overlapping bookings in the same room with a blocking status — the only race-safe option:
  ```sql
  CREATE EXTENSION IF NOT EXISTS btree_gist;
  ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_no_overlap
    EXCLUDE USING gist (
      room WITH =,
      date WITH =,
      tsrange(
        (date::text || ' ' || start_time::text)::timestamp,
        (date::text || ' ' || end_time::text)::timestamp,
        '[)'
      ) WITH &&
    ) WHERE (status IN ('pending','approved','confirmed'));
  ```
- Add a helper SQL function `public.find_conflicts(_room text, _date date, _start time, _end time, _exclude uuid default null)` returning conflicting rows (blocking statuses only). Used by server functions and clients via RPC.
- `GRANT EXECUTE ON FUNCTION public.find_conflicts(...) TO authenticated;`

### 2. Server functions

- New `src/features/shared/availability.functions.ts`:
  - `checkAvailability({ room, date, startTime, endTime, excludeId? })` — calls `find_conflicts`; returns `{ available, conflicts: [{ id, eventName, startTime, endTime, status }] }`.
- `createUserReservation` and `createInternalEvent`: call `checkAvailability` before insert; if conflicts, throw a typed error. The DB exclusion constraint is the final guard against races; translate Postgres `23P01` to a friendly message.

### 3. Forms (both User + Internal, identical logic in their own files — no cross-coupling)

- After `room + date + startTime + endTime` are all set and times pass basic validation, call `checkAvailability` (debounced, via TanStack Query keyed on those four values).
- Show inline status under the time fields:
  - Green "Time slot available."
  - Red "This time conflicts with: &nbsp; (HH:MM–HH:MM)." + button **"Request availability"**.
- Disable Submit when conflicts exist or query is pending.
- Server submission still validates; show error toast on failure.

### 4. "Request availability" dialog (shared, presentation-only)

- New `src/components/RequestAvailabilityDialog.tsx`: shadcn `Dialog` with a short explanation and a single **Send email** button that opens a `mailto:` link.
- Email is sent to a configurable address read from `import.meta.env.VITE_AVAILABILITY_REQUEST_EMAIL` with fallback `availability@example.com` (temporary generic address per user request — added to `.env`).
- Subject: `Reservation Availability Request`
- Body: pre-filled with the requested room, date, time interval, and placeholder fields (Name / Company / Phone / Email) — kept as a plain template string so it's easy to swap later for a waitlist table.
- Designed as a thin abstraction: `onRequest({ room, date, startTime, endTime })` — future waitlist/notification implementations replace only this handler.

### 5. Calendar route (`/calendar`)

- Out of scope for blocking, since blocking is now per-room time interval, not full days. Leave existing visualization unchanged.

## Out of scope

- Admin status-update UI (status changes already free the slot automatically via the exclusion constraint + query refetch).
- Replacing native date/time inputs with a richer picker.
- Real waitlist persistence (left as a future swap-in behind the dialog handler).

## Files touched

- **New migration**: `supabase/migrations/<ts>_reservation_availability.sql`
- **New**: `src/features/shared/availability.functions.ts`, `src/components/RequestAvailabilityDialog.tsx`
- **Edit**: `src/features/user-reservation/UserReservationForm.tsx`, `src/features/user-reservation/submit.functions.ts`, `src/features/internal-event/InternalEventForm.tsx`, `src/features/internal-event/submit.functions.ts`, `.env`

## Verification

- Typecheck clean.
- Manual: create reservation in Atlas Hall 09:00–12:00 → try overlapping in same room (blocked, dialog opens) → try same time in Nova Auditorium (allowed) → try 13:00–15:00 in Atlas (allowed) → cancel original via SQL (`UPDATE reservations SET status='cancelled'`) → previously blocked slot becomes available.  
  
  
When editing an existing reservation, the reservation being edited must not be considered a conflict.
  Availability must be recalculated immediately whenever the user changes:
  - Room
  - Date
  - Start Time
  - End Time
  The system must reject reservations where:
  - Start Time equals End Time.
  - Start Time is after End Time.
  No fallback email address should be used.
  The request email address must be configured through environment variables.
  Availability validation must use the application's configured timezone.
  If reservation editing is supported, conflict detection must ignore the current reservation using its unique identifier.