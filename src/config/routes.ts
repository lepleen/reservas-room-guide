export const ROUTES = {
  admin: "/admin",
  calendar: "/calendar",
  dashboard: "/dashboard",
  internalDashboard: "/internal/dashboard",
  newReservation: "/reservations/new",
  newInternalReservation: "/internal/reservations/new",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
