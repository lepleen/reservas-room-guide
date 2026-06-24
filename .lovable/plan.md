## Task 4A — Extend Primary Actions (revised)

Architectural refactor only. Zero behavioral or visual change. Config stays declarative; rendering lives in a dedicated component.

### 1. `src/config/navigation/types.ts` — discriminated union

```ts
type ActionBase = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type RouteActionItem = ActionBase & {
  type: "route";
  to: AppRoute;
};

export type CustomActionItem = ActionBase & {
  type: "custom";
  actionId: string;        // declarative identifier, resolved by the renderer
};

export type ActionItem = RouteActionItem | CustomActionItem;

export type RoleActions = { primary?: ActionItem };
```

No callbacks in config. No optional `to` — the discriminator forces exhaustive handling.

### 2. `src/config/actions/{external,internal,admin}.ts` — tag existing primaries

```ts
externalActions.primary = { type: "route", id: "external.new-request", label: "New", icon: Plus, to: ROUTES.newReservation };
internalActions.primary = { type: "route", id: "internal.new-request", label: "New", icon: Plus, to: ROUTES.newInternalReservation };
adminActions.primary    = { type: "route", id: "admin.review",        label: "Review", icon: ShieldCheck, to: ROUTES.admin };
```

Labels, icons, and routes unchanged.

### 3. New file `src/components/navigation/PrimaryAction.tsx` — owns action rendering

```tsx
import { Link } from "@tanstack/react-router";
import type { ActionItem } from "@/config/navigation/types";

const CLASS = "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground";

export function PrimaryAction({ action }: { action: ActionItem }) {
  const Icon = action.icon;
  switch (action.type) {
    case "route":
      return (
        <Link to={action.to} className={CLASS}>
          <Icon className="h-3.5 w-3.5" /> {action.label}
        </Link>
      );
    case "custom":
      // Placeholder for future custom handlers keyed by action.actionId.
      // Renders identical markup; no handler is wired today (no custom
      // actions are configured), so behavior is unchanged.
      return (
        <button type="button" className={CLASS} data-action-id={action.actionId}>
          <Icon className="h-3.5 w-3.5" /> {action.label}
        </button>
      );
  }
}
```

Exhaustive switch keeps TS fully typed.

### 4. `src/components/AppShell.tsx` — delegate to PrimaryAction

Replace the inline mobile-top-bar `<Link>` block with:

```tsx
{primary ? <PrimaryAction action={primary} /> : null}
```

No layout, class, or copy changes. Identical DOM for current route actions.

### Files modified
- `src/config/navigation/types.ts` — discriminated `ActionItem` union (`route` | `custom`).
- `src/config/actions/external.ts` — tag primary with `type: "route"`.
- `src/config/actions/internal.ts` — tag primary with `type: "route"`.
- `src/config/actions/admin.ts` — tag primary with `type: "route"`.
- `src/components/navigation/PrimaryAction.tsx` — **new**; owns action rendering for both variants.
- `src/components/AppShell.tsx` — render `<PrimaryAction action={primary} />`; remove inline link markup.

### Acceptance
- All current primaries remain route actions → identical navigation, label, icon, classes.
- `"custom"` variant is typed and renderable but unused; config stays declarative (no callbacks stored).
- AppShell stays focused on layout; PrimaryAction owns rendering.
- Exhaustive `switch` on `action.type`; no optional-prop branching.
