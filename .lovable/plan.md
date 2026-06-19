# Decouple User Reservation and Internal Events forms

## Current architecture (shared today)

Both `/reservations/new` and `/internal/reservations/new` route to the same building blocks:

- `src/components/ReservationForm.tsx` — single component, switched only by a `mode: "external" | "internal"` prop
- `src/lib/reservation-schema.ts` — single Zod schema, `ReservationFormValues` type, `defaultReservationValues`
- `src/lib/reservation-options.ts` — setup options, event types, broadcast platforms, catering, equipment (shared catalogs)
- `src/lib/reservations.functions.ts` — single `createReservation` server function, branches on `kind: "user" | "internal"`
- Backend: a single `public.reservations` table with a `kind` column already separates the two flows

Result: any field/validation/UI change on one form automatically lands on the other. This is what we need to break.

## Architectural note (worth flagging before we start)

`reservation-options.ts` (setup styles, rooms, catering items, equipment list, broadcast platforms) is **catalog data**, not business logic. The acceptance criteria say "adding a field to one form must not affect the other" — that's about form fields, not about which rooms exist. I recommend keeping these catalogs shared. If the user later wants different catalogs per flow (e.g. internal-only equipment), we can fork them then. **Confirm if you'd rather fork the catalogs now.**

The `reservations` DB table is also shared (distinguished by `kind`). Splitting it into two tables is a much larger change with data-migration implications — out of scope for this refactor unless you explicitly ask.

## Target structure

```text
src/features/
├── user-reservation/
│   ├── UserReservationForm.tsx        // own component, own RHF state
│   ├── schema.ts                      // own Zod schema + type + defaults
│   └── submit.functions.ts            // own createUserReservation server fn
└── internal-event/
    ├── InternalEventForm.tsx
    ├── schema.ts
    └── submit.functions.ts
```

Shared (unchanged): `src/components/ui/*`, `AppShell`, `PageHeader`, `AuthGuard`, `reservation-options.ts` (catalogs), generic helpers.

Deleted after migration: `src/components/ReservationForm.tsx`, `src/lib/reservation-schema.ts`, `src/lib/reservations.functions.ts`.

## Steps

1. **Create `user-reservation/`**
   - `schema.ts`: copy the current Zod schema as `userReservationSchema`, export `UserReservationValues` + `defaultUserReservationValues`.
   - `UserReservationForm.tsx`: copy current `ReservationForm.tsx`, drop the `mode` prop, hardwire external navigation targets (`/dashboard`, `/reservations/$id`).
   - `submit.functions.ts`: `createUserReservation` server fn — same auth middleware, hardcodes `kind: "user"` in the insert.

2. **Create `internal-event/`** — mirror of the above:
   - `InternalEventForm.tsx` navigates to `/internal/dashboard` and `/internal/reservations/$id`.
   - `createInternalEvent` server fn hardcodes `kind: "internal"`.
   - Identical fields for now (matches current behavior); future divergence is now safe.

3. **Update routes**
   - `src/routes/reservations.new.tsx` → render `<UserReservationForm />`.
   - `src/routes/internal.reservations.new.tsx` → render `<InternalEventForm />`.

4. **Remove the shared modules**
   - Delete `src/components/ReservationForm.tsx`, `src/lib/reservation-schema.ts`, `src/lib/reservations.functions.ts` once nothing imports them.
   - Grep first to confirm no other route/component still imports the old paths.

5. **Verification**
   - Typecheck clean.
   - Both routes render and submit (auth-bypass path still works on both).
   - Adding a throwaway field to `user-reservation/schema.ts` does NOT touch the internal form — quick smoke check, then revert.

## Out of scope

- DB schema split (still one `reservations` table, `kind` column).
- Catalog split in `reservation-options.ts` (unless you say otherwise).
- Visual redesign — pure structural refactor; markup stays identical.

## Question before I implement

Fork `reservation-options.ts` (catalogs) per flow too, or keep it shared? Default plan is **keep shared**.
