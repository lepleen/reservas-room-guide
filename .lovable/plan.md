
Reusing all existing availability infrastructure (`find_conflicts` RPC, GIST exclusion constraint, `useAvailability` hook, `AvailabilityStatus` badge, backend pre-check + `23P01` race handling). Backend stays the single source of truth — no business rules duplicated on the frontend.

## Changes

### 1. Conflict modal (rewrite `src/components/RequestAvailabilityDialog.tsx`)
- Title **Room Currently Unavailable**, spec copy.
- Required email field (zod `email()`), **Notify Me** button + Cancel.
- New shared type `AvailabilityRequest`:
  ```ts
  type AvailabilityRequest = {
    email: string;
    requesterName?: string;
    reservationType: "external" | "internal";
    roomId: string;
    roomName: string;
    reservationDate: string;   // YYYY-MM-DD
    startTime: string;         // HH:mm
    endTime: string;           // HH:mm
  };
  ```
- On valid submit, the modal calls `onNotifyRequested(request: AvailabilityRequest)` with the full object, shows a success toast, and closes. **No persistence yet.**
- Drops the mailto flow and the `VITE_AVAILABILITY_REQUEST_EMAIL` read.

### 2. Form wiring — `UserReservationForm.tsx` + `InternalEventForm.tsx`
- Each form owns the modal state and a single `pendingAvailabilityRequest: AvailabilityRequest | null` slot (ready for next feature's waitlist insert; survives modal close).
- Each form builds the partial request payload (everything except `email`) from current form values (`reservationType`, `roomId = setupOptionId`, `roomName = setup.room`, date/times, `requesterName` from `organizerName` when present). The modal contributes `email`.
- `AvailabilityStatus` becomes presentation-only (green/red badge + spinner); the "Request availability" action moves to the form layer.
- Submit button disabled while `availability.isFetching` OR while a known conflict exists. Submit handler also re-guards: if `availability.data?.conflicts.length > 0` → open modal, abort. Backend remains authoritative.
- If the server fn throws with `code === "ROOM_UNAVAILABLE"` → open the same modal (covers races).

### 3. Structured backend error
Files: both `submit.functions.ts`, and (later) admin `updateReservation`.
- New `src/features/shared/conflict-error.ts`:
  ```ts
  export class RoomUnavailableError extends Error {
    code = "ROOM_UNAVAILABLE" as const;
    constructor(public conflicts: AvailabilityConflict[]) { super("ROOM_UNAVAILABLE"); }
  }
  export function isRoomUnavailable(e: unknown): boolean;
  ```
- Server fns throw `RoomUnavailableError` from both the `find_conflicts` pre-check and the Postgres `23P01` exclusion-constraint paths. TanStack preserves thrown-error own-fields across RPC, so `code` is reliable on the client — never message-text matching.

### 4. Reuse the same flow for admin edits
- The upcoming admin `updateReservation` server fn calls the **same** `find_conflicts` (with `_exclude = id`) and relies on the **same** GIST exclusion constraint, throwing the **same** `RoomUnavailableError`. Admin edit UI on the detail pages reuses `useAvailability` (with `excludeId`) and the same conflict modal.

### 5. Database — small index polish (migration)
Existing: `reservations_date_room_idx (date, room)` btree + `reservations_no_overlap` GIST partial index on active statuses. Add:
```sql
CREATE INDEX IF NOT EXISTS reservations_status_idx
  ON public.reservations (status)
  WHERE status IN ('pending','approved','confirmed');
```
No schema, RLS, or function changes.

## Explicitly out of scope
- Waitlist persistence and notifications (next feature; the captured `AvailabilityRequest` is held in component state ready for it).
- Auth, navigation, dashboards, admin permissions model, form layouts, badge styling — untouched.
- No change to `find_conflicts`, the GIST constraint, or the reservations schema.

## Files touched
- rewrite `src/components/RequestAvailabilityDialog.tsx`
- simplify `src/features/shared/AvailabilityStatus.tsx` (remove embedded dialog)
- new `src/features/shared/conflict-error.ts`
- new shared `AvailabilityRequest` type (co-located with the modal or in `src/features/shared/`)
- edit `src/features/user-reservation/UserReservationForm.tsx`, `submit.functions.ts`
- edit `src/features/internal-event/InternalEventForm.tsx`, `submit.functions.ts`
- (when admin `updateReservation` lands) reuse the same helper and modal
- new migration: `reservations_status_idx`
