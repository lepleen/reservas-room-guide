import { queryOptions } from "@tanstack/react-query";
import {
  listExternalReservations,
  listInternalReservations,
  listAllReservations,
  getReservationById,
} from "@/features/admin/reservations.functions";

export type ReservationListScope = "external" | "internal" | "all";

/**
 * Structured query-key hierarchy. All reservation entries share the
 * `reservationKeys.all` prefix so a single invalidation refreshes lists and
 * details together.
 */
export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (scope: ReservationListScope) => [...reservationKeys.lists(), scope] as const,
  details: () => [...reservationKeys.all, "detail"] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
};

export const externalReservationsQueryOptions = () =>
  queryOptions({
    queryKey: reservationKeys.list("external"),
    queryFn: () => listExternalReservations(),
  });

export const internalReservationsQueryOptions = () =>
  queryOptions({
    queryKey: reservationKeys.list("internal"),
    queryFn: () => listInternalReservations(),
  });

export const allReservationsQueryOptions = () =>
  queryOptions({
    queryKey: reservationKeys.list("all"),
    queryFn: () => listAllReservations(),
  });

export const reservationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: reservationKeys.detail(id),
    queryFn: () => getReservationById({ data: { id } }),
  });
