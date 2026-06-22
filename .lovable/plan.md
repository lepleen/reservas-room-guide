## Goal

Refactor `UserReservationForm` and `InternalEventForm` into a shared, accessible, domain-agnostic multi-step Wizard. Zero changes to schemas, server functions, RPCs, availability logic, conflict handling, auth, routes, or submission payloads. Purely a UI/structural refactor.

## Domain-agnostic Wizard package — `src/components/forms/wizard/`

Imports only React, react-hook-form, framer-motion, lucide-react, `@/components/ui/*`, `@/lib/utils`. MUST NOT import from `@/features/*` or `@/lib/reservation-options`.

### Public API (small, stable)

```tsx
<Wizard
  steps={steps}
  onSubmit={onSubmit}
  onCancel={onCancel}
  submitDisabled={bool}
  submitLabel?={string}
/>
```

Rendered inside the wrapper's `<FormProvider>` — wrappers own the form instance, mutations, dialogs, navigation.

### Step definition

```ts
type WizardStepDef<TValues extends FieldValues> = {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  component: ComponentType;
  validationFields: FieldPath<TValues>[];
  isOptional?: boolean;
  beforeNext?: (form: UseFormReturn<TValues>) => boolean | Promise<boolean>;
  beforeEnter?: (form: UseFormReturn<TValues>) => void | Promise<void>;
};
```

Hooks `isOptional` / `beforeNext` / `beforeEnter` are wired through but unused today (extensibility).

### Internal modules

- `Wizard.tsx` — orchestrator. Owns `currentIndex`, `maxVisitedIndex`, **`isTransitioning`** flag. Handles scroll-into-view, focus, transitions.
- `WizardProgress.tsx` — desktop: numbered titles with check / active / idle. Each item is a `<button aria-current="step">` for the active step. **Progressive navigation**: `<= maxVisitedIndex` enabled, `> maxVisitedIndex` `disabled` + `aria-disabled`. Mobile: "Step X of N · {title}" + `<Progress>` bar.
- `WizardHeader.tsx` — `<h2 tabIndex={-1}>` focus target, description, optional icon, `aria-live="polite"`.
- `WizardStep.tsx` — `AnimatePresence` 200 ms opacity + small x-slide. `prefers-reduced-motion` → opacity-only. `<Suspense>` wrapper so any step can become `React.lazy(...)` later without API change.
- `WizardNavigation.tsx` — Cancel (always visible), Previous, Next/Submit. On Next: `setIsTransitioning(true)` → `form.trigger(validationFields)` → on failure `form.setFocus(firstInvalid)` and re-enable; on success run `beforeNext`, bump `maxVisitedIndex`, advance, then re-enable. Submit is similarly guarded against re-entry via `isTransitioning` + `submitDisabled`.
- `wizard-context.ts` — `useWizard()` exposes `{ currentIndex, total, currentStep, goNext, goPrev, goTo, isFirst, isLast, maxVisitedIndex, isTransitioning }`.
- `types.ts` — `WizardStepDef`, context shape, reserved `errorSummarySlot?` doc.
- `index.ts` — barrel.

### Double-action protection

`isTransitioning` is true from the moment Next/Submit is clicked until the async validation + advance (or submit) settles. All navigation controls (Cancel, Previous, Next, Submit, and progress jump buttons) respect it and become disabled; the active button keeps its label and adds an `aria-busy="true"` state. Prevents duplicate advances, duplicate submits, and concurrent goTo.

### Layout stability (pure CSS)

`max-w-3xl mx-auto`. Step region uses `min-h-[28rem] md:min-h-[32rem]`. No runtime measurement.

### Accessibility / keyboard

- `<nav aria-label="Wizard steps">`; items have descriptive `aria-label`.
- Step region: `<section role="region" aria-labelledby={headingId}>`.
- Failed validation → focus first invalid via `form.setFocus`.
- Successful advance → focus new `<h2>`.
- Enter inside the form does NOT advance (root `onKeyDown` swallows except in `<textarea>` and `type="submit"`).
- `focus-visible` via shadcn defaults.

### Reserved extensions (not implemented)

- `errorSummarySlot?: ReactNode` (documented only).
- Cross-step validation via `beforeNext` or expanded `validationFields`.
- Per-step `React.lazy(...)` (Suspense already in place).

## Reservation domain layer

### Shared form shape — derived, not duplicated

`src/features/reservations/steps/types.ts`:

```ts
import type { UserReservationValues } from "@/features/user-reservation/schema";
import type { InternalEventValues } from "@/features/internal-event/schema";

// Fields common to both forms — derived via intersection, NOT manually listed.
export type ReservationFormShape = UserReservationValues & InternalEventValues;
// (UserReservationValues is the superset that includes organizer fields; the
// intersection narrows away anything not present in both.)

// Organizer-aware variant for OrganizerStep only.
export type ReservationFormShapeWithOrganizer = UserReservationValues;
```

If either schema gains a new field, the intersection updates automatically and TypeScript flags any step that needs to use it. No manual interface to drift.

Step components use `useFormContext<ReservationFormShape>()`; `OrganizerStep` uses `useFormContext<ReservationFormShapeWithOrganizer>()`. Both wrappers pass their own RHF instance; structural compatibility is guaranteed by construction.

### Room selection adapter — `src/features/reservations/room-selection.ts`

**Sole owner** of every `setupOptionId` ↔ room rule. No other reservation file imports `SETUP_OPTIONS` going forward (existing imports in schema/submit stay untouched; out of scope).

```ts
export type RoomId = string;
export type LayoutOption = { id: string; label: string; capacity: number | null };

export function listRooms(): RoomId[];
export function getRoomForSetupOption(id: string | undefined): RoomId | undefined;
export function getLayoutsForRoom(room: RoomId): LayoutOption[];
export function getDefaultLayoutForRoom(room: RoomId): LayoutOption;
export function isLayoutCompatibleWithRoom(layoutId: string | undefined, room: RoomId): boolean;

/**
 * Single centralized rule for every Room → layout transition.
 * - layout still valid → keep it
 * - layout incompatible → return undefined (caller clears the field)
 * - no prior layout → return undefined (caller leaves blank, user must pick)
 *
 * No component may reimplement this logic.
 */
export function resolveLayoutForRoomChange(
  nextRoom: RoomId,
  currentLayoutId: string | undefined,
): string | undefined;
```

`RoomStep` calls only `resolveLayoutForRoomChange` on room change. `SetupStyleStep` calls only `getLayoutsForRoom` + `isLayoutCompatibleWithRoom`. Wizard remains room-agnostic.

### Reservation form context — `src/features/reservations/reservation-form-context.ts`

Tiny read-only bridge for shared UI state. **Not** a controller.

```ts
type ReservationFormContextValue = {
  availability: UseAvailabilityResult;
  hasConflict: boolean;
  availabilityEnabled: boolean;
  onRequestAvailability: () => void;
};
```

Consumed only by `RoomStep`. Wrappers continue to own mutations, navigation, dialogs.

### Steps — `src/features/reservations/steps/`

Each step is presentational. External = 10 steps, internal = 9 (no Organizer).

1. EventBasicsStep
2. RoomStep — room picker (`listRooms()`), date/start/end; on room change writes `resolveLayoutForRoomChange(...)`; uses context to render `AvailabilityStatus` and call `onRequestAvailability`.
3. CateringStep
4. SpeakersStep
5. AVStep
6. EquipmentStep
7. RegistrationStep
8. ScheduleStep (Notes textarea included)
9. SetupStyleStep — `getLayoutsForRoom(currentRoom)`; renders `SetupStylePreview` + capacity warning.
10. OrganizerStep (external only)

`_primitives.tsx` — `Section`, `Field`, `Toggle`, `Warning` lifted from current forms.
`index.ts` — barrel.

## Wrappers — `UserReservationForm.tsx` / `InternalEventForm.tsx`

Thin shells. Own all business logic byte-identical to today: RHF setup, `useAvailability`, conflict state, `RequestAvailabilityDialog`, `onSubmit` (authBypass, conflict re-guard, mutation, invalidate, toast, navigate), `onCancel`. Provide `ReservationFormContext`. Render `<Wizard ... />` + dialog (dialog outside the animated swap region).

## Behavioral parity (must remain true)

Validation, availability query + enabled + `hasConflict`, conflict detection (client re-guard + server retry + dialog), request availability flow, schedule edits, setup style options + preview + capacity warning, organizer (external only), default values, submit payloads, query invalidation, toasts, navigation, cancellation, route guards.

## Files

**Create — wizard (domain-agnostic)**
- `src/components/forms/wizard/{Wizard,WizardProgress,WizardHeader,WizardStep,WizardNavigation}.tsx`
- `src/components/forms/wizard/{wizard-context,types,index}.ts`

**Create — reservation domain**
- `src/features/reservations/room-selection.ts`
- `src/features/reservations/reservation-form-context.ts`
- `src/features/reservations/steps/{types,_primitives,index}.{ts,tsx}`
- `src/features/reservations/steps/{EventBasicsStep,RoomStep,CateringStep,SpeakersStep,AVStep,EquipmentStep,RegistrationStep,ScheduleStep,SetupStyleStep,OrganizerStep}.tsx`

**Create — tests**
- `src/components/forms/wizard/__tests__/Wizard.test.tsx`
- `src/features/reservations/__tests__/room-selection.test.ts`

**Modify (shrink to wrappers)**
- `src/features/user-reservation/UserReservationForm.tsx`
- `src/features/internal-event/InternalEventForm.tsx`

**Maybe install**
- `framer-motion` (if not already)
- `@testing-library/react` + `@testing-library/user-event` + `vitest` (only if not already installed)

**Untouched**
- Schemas, server functions, queries, `useAvailability`, RPCs, `RequestAvailabilityDialog`, `SetupStylePreview`, `reservation-options.ts`, routes, auth guards, navigation config, RLS, design tokens.

## Verification

### Component tests — generic Wizard only (no reservation imports)

A tiny throwaway form fixture inside the test file provides 3 dummy steps. Assertions:

1. Progress updates as user advances (active marker, completed marker).
2. Cannot advance when validation fails (form stays on same step; invalid field receives focus).
3. Previously visited steps remain accessible (clicking a past step in the progress nav jumps back).
4. Future steps remain disabled (`aria-disabled="true"`; click is a no-op).
5. `onCancel` callback fires on Cancel click.
6. Focus moves to the new step heading after a successful advance.
7. Rapid double-click on Next results in a single advance (transition flag works).
8. `onSubmit` fires exactly once on Submit double-click.

### Adapter tests — `room-selection.ts`

- `resolveLayoutForRoomChange` keeps compatible layout.
- Clears incompatible layout (returns undefined).
- Returns undefined when prior layout is undefined.
- `getLayoutsForRoom` returns only layouts belonging to that room.

### Playwright (end-to-end on the live preview)

1. Walk all 10 external steps → submit → identical payload + navigation to detail page.
2. Walk all 9 internal steps → submit.
3. Back-navigate to a completed step, edit, return — value persists.
4. Skip-ahead blocked.
5. Change room after picking a setup style:
   - Pick Auditorium A → Theater layout; advance; go back to Room; switch to Auditorium B → confirm `setupOptionId` cleared (no compatible match) and Setup Style step requires re-selection.
   - Pick a room with a compatible existing layout → confirm kept.
6. Availability badge re-queries on room change.
7. Submit while conflict exists → `RequestAvailabilityDialog` opens; no submission.
8. Cancel from step 8 → navigates to role's dashboard; no submit.
9. Rapid prev/next clicking — no state corruption.
10. Enter key in inputs does not advance.
11. Validation failure → focus on first invalid field.

### Static checks

- No `@/features/*` imports inside `src/components/forms/wizard/**`.
- `setupOptionId` referenced only in `room-selection.ts`, `RoomStep`, `SetupStyleStep`, schema, submit functions.
- `SETUP_OPTIONS` imported only by `room-selection.ts` (within reservation steps/form scope).

## Out of scope

Schema changes, payload changes, RPC changes, route changes, design-token changes, partial-draft persistence, deep-linking to steps, error-summary implementation (slot reserved), actual lazy loading (architecture-ready only).
