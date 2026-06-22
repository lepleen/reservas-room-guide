# Role-isolated routes with presentational shared components

## Data layer (server-side filtering)

`src/features/admin/reservations.functions.ts` — add a shared internal helper plus three explicit public server functions. No `"all"` value escapes the public API.

```ts
type ReservationScope = "external" | "internal";

async function queryReservations(supabase, scope?: ReservationScope) {
  let q = supabase.from("reservations").select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  if (scope === "external") q = q.eq("kind", "user");
  if (scope === "internal") q = q.eq("kind", "internal");
  return q;
}

export const listExternalReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => { ... queryReservations(supabase, "external") ... });

export const listInternalReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => { ... queryReservations(supabase, "internal") ... });

export const listAllReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role",
      { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    return queryReservations(supabase /* no scope */);
  });
```

RLS already enforces:
- external user → only `owner_id = auth.uid()`
- internal user → own rows + every `kind = 'internal'`
- admin → all rows

The added `.eq("kind", …)` is a scope filter, not authorization. `listAllReservations` re-checks the admin role server-side before bypassing the scope filter, matching the existing pattern used by `updateReservationStatus`.

The existing `listReservations` export is removed; nothing else depends on it once dashboards/calendars use the scoped variants. `getReservationById` and the mutation server functions are untouched.

## Query keys (structured hierarchy)

`src/features/reservations/queries.ts`

```ts
export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (scope: "external" | "internal" | "all") =>
    [...reservationKeys.lists(), scope] as const,
  detail: (id: string) => [...reservationKeys.all, "detail", id] as const,
};

export const externalReservationsQueryOptions = () => queryOptions({
  queryKey: reservationKeys.list("external"),
  queryFn: () => listExternalReservations(),
});
export const internalReservationsQueryOptions = () => queryOptions({ ... "internal" });
export const allReservationsQueryOptions      = () => queryOptions({ ... "all" });

export const reservationQueryOptions = (id: string) => queryOptions({
  queryKey: reservationKeys.detail(id),
  queryFn: () => getReservationById({ data: { id } }),
});
```

Existing mutations that invalidate `["reservations"]` continue to work — the prefix `reservationKeys.all` matches every list and detail entry.

## Routes (per role)

```text
src/routes/
  dashboard.tsx               -> External "My events"          (existing URL kept)
  internal.dashboard.tsx      -> Internal "Internal events"    (existing)
  admin.dashboard.tsx         -> NEW  /admin/dashboard         (Admin "All events")
  calendar.tsx                -> External calendar             (existing URL kept)
  internal.calendar.tsx       -> NEW  /internal/calendar
  admin.calendar.tsx          -> NEW  /admin/calendar
  admin.tsx                   -> Admin review (existing)
```

Each route file is a thin wrapper:
1. `AuthGuard` with role list.
2. Loader: `context.queryClient.ensureQueryData(<scoped>QueryOptions())`.
3. Renders the shared presentational component, passing role-appropriate copy and callbacks built from `ROUTES`.

The shared components do not import `ROUTES`, `useAuth`, `useNavRole`, or any hook beyond presentational concerns.

## Shared presentational components

### `src/features/calendar/CalendarView.tsx` (NEW)

Props:
```ts
type CalendarViewProps = {
  reservations: ReservationDTO[];
  title: string;
  description: string;
  onReservationClick: (r: ReservationDTO) => void;
};
```
Owns the month grid, navigation chevrons, "Today", day-detail list — verbatim from current `calendar.tsx`. Clicking a row calls `onReservationClick(r)`; no `<Link>` for reservation details inside the component.

### `src/features/dashboard/ReservationDashboard.tsx` (NEW)

Props:
```ts
type DashboardStat = { label: string; value: string; icon: ComponentType<{ className?: string }> };

type DashboardCta = { label: string; onClick: () => void };

type ReservationDashboardProps = {
  reservations: ReservationDTO[];
  title: string;
  description: string;
  stats: DashboardStat[];
  cta?: DashboardCta;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta?: DashboardCta;
  onReservationClick: (r: ReservationDTO) => void;
};
```
Owns Stat cards, filter tabs, search input, list rows, empty state. No role logic, no router imports, no `ROUTES`. Navigation is performed by handlers passed in by the wrapper.

### Wrapper navigation pattern

Each wrapper uses `useNavigate()` and `ROUTES` to build the callbacks:

```ts
const navigate = useNavigate();
const goToDetail = (r: ReservationDTO) => navigate({
  to: r.reservationType === "internal" ? "/internal/reservations/$id" : "/reservations/$id",
  params: { id: r.id },
});
const goToNew = () => navigate({ to: ROUTES.newReservation });
```

For admin the detail navigation uses the same mixed mapping because admins can drill into either kind.

## Navigation configuration

`src/config/routes.ts` — add:
```ts
adminDashboard: "/admin/dashboard",
internalCalendar: "/internal/calendar",
adminCalendar: "/admin/calendar",
```

`src/config/navigation/internal.ts` — `internal.calendar.to = ROUTES.internalCalendar`.

`src/config/navigation/admin.ts`
- `admin.calendar.to = ROUTES.adminCalendar`
- `admin.all-events.to = ROUTES.adminDashboard`

`AppShell`, `useNavigation`, `useRoleActions`, `useNewRequestTarget`, `actionsByRole` — unchanged.

## Direct-URL access enforcement

`AuthGuard` already redirects when `roles` does not include any of the user's roles (sends to `/`). The new and existing routes apply guards:

| Route | Guard |
|---|---|
| `/dashboard` | `["user", "internal", "admin"]` (external page; internal/admin allowed via sidebar from admin) — but admin lands on `/admin/dashboard` via nav. To enforce role isolation: tighten to `["user"]` only? See note below. |
| `/calendar` | `["user"]` |
| `/internal/dashboard` | `["internal", "admin"]` (existing) |
| `/internal/calendar` | `["internal", "admin"]` |
| `/admin` | `["admin"]` (existing) |
| `/admin/dashboard` | `["admin"]` |
| `/admin/calendar` | `["admin"]` |
| `/reservations/new` | `["user"]` |
| `/internal/reservations/new` | `["internal", "admin"]` (existing, unchanged — out of scope) |

Decision: keep `/dashboard` and `/calendar` open to all authenticated roles. Rationale: the previous behavior allowed any signed-in user to reach `/dashboard` (it just filtered data). The acceptance criteria require navigation isolation, not URL-blocking. The sidebar never offers an internal/admin user a link into `/dashboard` or `/calendar`, so direct-URL access is the only way in, and the data they would see is already restricted by RLS + the external-scoped query. If you want hard blocking, the guards can be tightened — flagging here so the choice is explicit before implementation.

Recommended explicit answer for this task: **tighten guards** so `/dashboard` and `/calendar` require `["user"]`, `/internal/*` requires `["internal","admin"]`, `/admin/*` requires `["admin"]`. This satisfies the "no role may access another role's workflow via direct URL" requirement. Admins still reach everything they need via `/admin/*`. If you prefer to keep them open for admin observability, say so and I will keep them at the broader role set.

## Files to create
- `src/features/calendar/CalendarView.tsx`
- `src/features/dashboard/ReservationDashboard.tsx`
- `src/routes/admin.dashboard.tsx`
- `src/routes/internal.calendar.tsx`
- `src/routes/admin.calendar.tsx`

## Files to modify
- `src/features/admin/reservations.functions.ts` — split list fn into three scoped fns
- `src/features/reservations/queries.ts` — `reservationKeys` + three scoped query options
- `src/routes/dashboard.tsx` — thin wrapper (external)
- `src/routes/internal.dashboard.tsx` — thin wrapper (internal)
- `src/routes/calendar.tsx` — thin wrapper (external)
- `src/routes/admin.tsx` — use `allReservationsQueryOptions`
- `src/config/routes.ts` — three new constants
- `src/config/navigation/internal.ts`
- `src/config/navigation/admin.ts`

## Out of scope
Auth flows, RLS policies, reservation forms, server-function security model, AppShell layout/spacing/icons/typography, sidebar appearance, mobile bar, color tokens, design tokens, reservation business logic.

## Acceptance after implementation
- External (`user`): `/dashboard` (external scope) · `/calendar` (external scope) · `/reservations/new`. Direct hits on `/internal/*` or `/admin/*` redirect to `/`.
- Internal: `/internal/dashboard` · `/internal/calendar` · `/internal/reservations/new`. Direct hits on `/admin/*` and `/dashboard`/`/calendar` redirect to `/`.
- Admin: `/admin` · `/admin/dashboard` · `/admin/calendar`. No "New request" CTA anywhere.
- Server returns only role-relevant rows; RLS continues to enforce authorization.
- `CalendarView` and `ReservationDashboard` contain zero references to `useAuth`, `useNavRole`, `ROUTES`, or `Link`. All navigation handled by wrappers.
- Query keys structured as `["reservations", "list", <scope>]` and `["reservations", "detail", <id>]`.

Please confirm the guard-tightening recommendation (or override) before I proceed.
