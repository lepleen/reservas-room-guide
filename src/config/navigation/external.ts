import { CalendarRange, LayoutDashboard, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { RoleNavigation } from "./types";

export const externalNavigation: RoleNavigation = {
  panelLabel: "User panel",
  items: [
    { id: "external.my-events", label: "My events", icon: LayoutDashboard, to: ROUTES.dashboard },
    { id: "external.calendar", label: "Calendar", icon: CalendarRange, to: ROUTES.calendar },
    { id: "external.new-request", label: "New request", icon: Plus, to: ROUTES.newReservation },
  ],
};
