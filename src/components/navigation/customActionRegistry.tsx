import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
