import { Building2, CalendarRange, Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { RoleNavigation } from "./types";

export const internalNavigation: RoleNavigation = {
  panelLabel: "Internal panel",
  items: [
    { id: "internal.events", label: "Internal events", icon: Building2, to: ROUTES.internalDashboard },
    { id: "internal.calendar", label: "Calendar", icon: CalendarRange, to: ROUTES.internalCalendar },
    {
      id: "internal.new-request",
      label: "New internal request",
      icon: Plus,
      to: ROUTES.newInternalReservation,
    },
  ],
};
