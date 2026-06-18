
# Reservation Forms Update — Implementation Plan

Covers `/reservations/new` (external) and `/internal/reservations/new` (internal). Both forms behave identically except for the route + AuthGuard. All shared logic is extracted into reusable pieces.

## 1. Data model (single source of truth)

New module `src/lib/reservation-options.ts` exports:

- `SETUP_OPTIONS` — array of `{ id, label, room, capacity | null }`. The room is derived from the option (answer 1c). Duplicate "Lab Layout – 7 table sets" removed. Items without a defined capacity store `capacity: null` and render as "Undefined" (answer 2).
- `ROOMS` — derived `Array.from(new Set(SETUP_OPTIONS.map(o => o.room)))`. This replaces the static `ROOMS` list in `src/lib/store.tsx` for the new forms; existing seed data keeps working because `findConflicts` matches by string.
- `EVENT_TYPES = ["in_person", "live_broadcast", "recorded"]`.
- `BROADCAST_PLATFORMS = ["YouTube", "Microsoft Teams", "Zoom"]` (single-select, answer 3).
- `CATERING_ITEMS` — fixed list of items the user toggles + assigns a time to.
- `EQUIPMENT_ITEMS` — fixed list for the additional-equipment checklist.

## 2. Shared form component

New `src/components/ReservationForm.tsx`:

- Accepts `mode: "external" | "internal"` and `onSubmit`.
- Sections: Organizer → Event basics → Setup & Room → Event type → Catering → Additional equipment → Speakers → Schedule → Notes.
- Setup style is the primary control; selecting it auto-fills `room` and shows `Maximum capacity: N` or `Undefined`. The standalone Room selector is removed (answer 1c). Conflict detection uses the derived `room` string, so `findConflicts` is unchanged.
- Event type is a radio group. Selecting `live_broadcast` reveals a single-select platform dropdown. Selecting `recorded` only flags the event as recorded — Room, Schedule, and Catering stay visible (answer 3; the user did not request hiding them — flagged as assumption).
- Catering Yes/No. When toggled to No, the catering items + times are cleared from state (answer 10). `cateringNotes` removed (answer 4).
- Additional equipment renders an informational `Alert` about possible extra costs; no pricing logic (answer 9).

## 3. Organizer block & validation (zod)

`src/lib/reservation-schema.ts` with one zod schema used by both forms:

- Required for everyone: `organizerName`, `jobTitle`, `phone`, `brand`, `cnpj` (answer 5, 7).
- `phone`: accepts Brazilian format (`+55` + DDD + 8/9 digits) **and** international E.164 (`+<country><number>`, 8–15 digits) via a single regex (answer 6).
- `cnpj`: 14 digits, mask-formatted in the UI, validated with the standard CNPJ check-digit algorithm.
- `brand`: 1–120 chars, trimmed.
- Submit button disabled until schema passes; inline errors via existing `Form`/`FormMessage` shadcn components.

## 4. Both route files

`src/routes/reservations.new.tsx` and `src/routes/internal.reservations.new.tsx` become thin wrappers:

```tsx
<AuthGuard ...>
  <ReservationForm mode="external" onSubmit={...} />
</AuthGuard>
```

The internal version keeps `roles={["internal","admin"]}` and posts with `kind: "internal"`.

## 5. Persistence — Supabase migration

Current store is `localStorage` only. Migration creates persistent storage in the `eu Org` project (answer 8).

New table `public.reservations`:

```text
id uuid pk
owner_id uuid -> auth.users (nullable for legacy/guest)
kind text ('user'|'internal')
status text ('pending'|'approved'|'rejected') default 'pending'

# organizer
organizer_name text not null
job_title text not null
phone text not null
brand text not null
cnpj text not null

# event
event_name text not null
event_type text not null         -- in_person|live_broadcast|recorded
broadcast_platform text          -- nullable, one of fixed list
date date not null
start_time time not null
end_time time not null
attendees int not null
setup_option_id text not null    -- references SETUP_OPTIONS.id
room text not null               -- denormalized for conflict queries
max_capacity int                 -- nullable when "Undefined"

# misc
catering boolean not null default false
catering_items jsonb not null default '[]'   -- [{item, time}]
equipment jsonb not null default '[]'
speakers jsonb not null default '[]'
schedule jsonb not null default '[]'
has_in_person_speakers boolean not null default false
recording boolean not null default false
microphone_type text
led_color text
registration_required boolean not null default false
registration_url text
notes text

admin_notes text
reviewed_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Plus: `GRANT` block for `authenticated`/`service_role`, `ENABLE ROW LEVEL SECURITY`, and policies:
- Users read/insert/update their own rows (`auth.uid() = owner_id`).
- Admins (`has_role(auth.uid(), 'admin')`) read/update/delete all.
- Internal role can read all internal-kind rows.
- `updated_at` trigger via existing `update_updated_at_column()`.

**Migration strategy (your question 8):** the existing reservations live only in `localStorage`, so no production data is at risk. The migration is purely additive — it creates a new table, leaves the local `useStore` intact, and the new forms write to Supabase. A small bridge in `useStore` keeps reading from `localStorage` for the legacy seed/list pages until they are migrated in a follow-up. No destructive SQL, no `DROP`. If you later want to backfill local data, we can ship a one-shot client-side "Send my drafts to the cloud" action — out of scope for this change.

## 6. Server function for inserts

`src/lib/reservations.functions.ts` — `createServerFn({ method: "POST" })` with `requireSupabaseAuth`, zod-validates input, inserts the row with `owner_id = context.userId`. The forms call it via `useServerFn` inside the submit handler, then navigate to the existing detail route. Listing/detail pages keep current local-store reads in this change to limit blast radius.

## 7. Open assumption to confirm during build

You didn't specify whether picking "Recorded" should hide Room / Schedule / Catering. I will keep them visible (flagged as a flag we can flip in one line). Tell me before I start if you want them hidden.

## Final checklist (will be verified)

- No TS errors; both routes typecheck.
- Responsive grid preserved (same `Section` layout as today).
- All required fields enforced via zod with inline errors.
- New fields persisted to `public.reservations`.
- External and internal forms render the same component with only `mode` differing.
- Reuses existing shadcn primitives (`Form`, `Input`, `Select`, `RadioGroup`, `Checkbox`, `Alert`, `Switch`).
