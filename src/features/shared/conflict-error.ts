// Shared "room unavailable" signal between server functions and the UI.
//
// TanStack server-fn RPC may flatten thrown errors to `{ message }` on the
// wire, so we encode the stable token in BOTH the message and an own `code`
// property. The detector accepts either path, so callers never need to do
// message-text matching on free-form sentences.

import type { AvailabilityConflict } from "@/features/shared/availability.functions";

export const ROOM_UNAVAILABLE = "ROOM_UNAVAILABLE" as const;

export class RoomUnavailableError extends Error {
  code = ROOM_UNAVAILABLE;
  conflicts: AvailabilityConflict[];

  constructor(conflicts: AvailabilityConflict[] = []) {
    super(ROOM_UNAVAILABLE);
    this.name = "RoomUnavailableError";
    this.conflicts = conflicts;
  }
}

export function isRoomUnavailable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; message?: unknown };
  if (e.code === ROOM_UNAVAILABLE) return true;
  if (typeof e.message === "string" && e.message.includes(ROOM_UNAVAILABLE)) return true;
  return false;
}
