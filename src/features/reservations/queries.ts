import { queryOptions } from "@tanstack/react-query";
import { listReservations, getReservationById } from "@/features/admin/reservations.functions";

export const reservationsQueryKey = ["reservations"] as const;

export const reservationsQueryOptions = () =>
  queryOptions({
    queryKey: reservationsQueryKey,
    queryFn: () => listReservations(),
  });

export const reservationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["reservations", id] as const,
    queryFn: () => getReservationById({ data: { id } }),
  });
