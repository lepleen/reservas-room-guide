## Task 4B — Admin "New Request" Custom Action (revised)

Uses the custom-action architecture from Task 4A. External / internal unchanged.

### 1. `src/config/actions/admin.ts` — declarative custom action

```ts
import { Plus } from "lucide-react";
import type { RoleActions } from "@/config/navigation/types";

export const adminActions: RoleActions = {
  primary: {
    type: "custom",
    id: "admin.new-request",
    label: "New Request",
    icon: Plus,
    actionId: "admin.new-request",
  },
};
```

No navigation logic in config — only the identifier.

### 2. New file `src/components/navigation/customActionRegistry.tsx`

A declarative `actionId → renderer` map. Keeps `PrimaryAction` agnostic and lets future custom actions be added without touching the renderer.

```tsx
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/routes";
import type { CustomActionItem } from "@/config/navigation/types";

type CustomActionRenderer = (action: CustomActionItem) => ReactNode;

const PRIMARY_CLASS =
  "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground";

const renderers: Record<string, CustomActionRenderer> = {
  "admin.new-request": (action) => {
    const Icon = action.icon;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={PRIMARY_CLASS}>
            <Icon className="h-3.5 w-3.5" /> {action.label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={ROUTES.newReservation}>
              <User className="mr-2 h-4 w-4" /> External Reservation
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={ROUTES.newInternalReservation}>
              <Building2 className="mr-2 h-4 w-4" /> Internal Reservation
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export function renderCustomAction(action: CustomActionItem): ReactNode {
  const renderer = renderers[action.actionId];
  return renderer ? renderer(action) : null;
}
```

### 3. `src/components/navigation/PrimaryAction.tsx` — delegate custom branch

```tsx
case "custom":
  return renderCustomAction(action);
```

Route branch unchanged.

### Files modified
- `src/config/actions/admin.ts` — primary becomes declarative custom action (`actionId: "admin.new-request"`, label `"New Request"`, icon `Plus`). Review remains reachable via the existing `admin.review` nav item in `src/config/navigation/admin.ts` (unchanged).
- `src/components/navigation/customActionRegistry.tsx` — **new**; `actionId → renderer` map containing the admin dropdown.
- `src/components/navigation/PrimaryAction.tsx` — `"custom"` branch delegates to `renderCustomAction(action)`.

### Acceptance
- External: unchanged.
- Internal: unchanged.
- Admin: primary shows "New Request" → dropdown with **External Reservation** (`ROUTES.newReservation`) and **Internal Reservation** (`ROUTES.newInternalReservation`).
- Config stays declarative; navigation logic lives in the renderer registry.
