import { Link } from "@tanstack/react-router";
import type { ActionItem } from "@/config/navigation/types";
import { renderCustomAction } from "./customActionRegistry";

const CLASS =
  "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground";

export function PrimaryAction({ action }: { action: ActionItem }) {
  switch (action.type) {
    case "route": {
      const Icon = action.icon;
      return (
        <Link to={action.to} className={CLASS}>
          <Icon className="h-3.5 w-3.5" /> {action.label}
        </Link>
      );
    }
    case "custom":
      return renderCustomAction(action);
  }
}
