import type { UserReservationValues } from "@/features/user-reservation/schema";
import type { InternalEventValues } from "@/features/internal-event/schema";

/**
 * Shared form shape consumed by reservation step components.
 *
 * Derived from the existing schemas via intersection so adding a field
 * to either schema either widens this type automatically or surfaces a
 * type error in steps that need to use it. No manual interface to drift.
 */
export type ReservationFormShape = UserReservationValues & InternalEventValues;

/** Organizer-aware variant for OrganizerStep only (external form). */
export type ReservationFormShapeWithOrganizer = UserReservationValues;
