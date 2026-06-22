import { CalendarRange, LayoutDashboard, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { RoleNavigation } from "./types";

export const adminNavigation: RoleNavigation = {
  panelLabel: "Admin panel",
  items: [
    { id: "admin.review", label: "Review requests", icon: ShieldCheck, to: ROUTES.admin },
    { id: "admin.calendar", label: "Calendar", icon: CalendarRange, to: ROUTES.adminCalendar },
    { id: "admin.all-events", label: "All events", icon: LayoutDashboard, to: ROUTES.adminDashboard },
  ],
};
