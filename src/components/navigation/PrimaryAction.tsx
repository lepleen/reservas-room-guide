import { Link } from "@tanstack/react-router";
import type { ActionItem } from "@/config/navigation/types";

const CLASS =
  "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground";

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
      // No custom actions are configured today, so behavior is unchanged.
      return (
        <button type="button" className={CLASS} data-action-id={action.actionId}>
          <Icon className="h-3.5 w-3.5" /> {action.label}
        </button>
      );
  }
}
