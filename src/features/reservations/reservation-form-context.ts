import { createContext, useContext } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AvailabilityResult } from "@/features/shared/availability.functions";

/**
 * Tiny read-only bridge so steps that need availability information
 * (currently only RoomStep) can render it without owning the query.
 * Wrappers continue to own mutations, navigation, and dialog state.
 */
export type ReservationFormContextValue = {
  availability: UseQueryResult<AvailabilityResult>;
  hasConflict: boolean;
  availabilityEnabled: boolean;
  onRequestAvailability: () => void;
};

export const ReservationFormContext =
  createContext<ReservationFormContextValue | null>(null);

export function useReservationFormContext(): ReservationFormContextValue {
  const ctx = useContext(ReservationFormContext);
  if (!ctx) {
    throw new Error(
      "useReservationFormContext must be used within <ReservationFormContext.Provider>",
    );
  }
  return ctx;
}
