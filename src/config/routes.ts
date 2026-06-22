export const ROUTES = {
  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminCalendar: "/admin/calendar",
  calendar: "/calendar",
  dashboard: "/dashboard",
  internalDashboard: "/internal/dashboard",
  internalCalendar: "/internal/calendar",
  newReservation: "/reservations/new",
  newInternalReservation: "/internal/reservations/new",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
