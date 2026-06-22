/**
 * Room selection adapter.
 *
 * Sole owner of every assumption about how `setupOptionId` maps to a room.
 * Steps and forms MUST consume this module instead of touching SETUP_OPTIONS
 * directly. If a future migration introduces a first-class `room` schema
 * field, this is the only file that needs to change.
 */
import { SETUP_OPTIONS, type SetupOption } from "@/lib/reservation-options";

export type RoomId = string;

export type LayoutOption = {
  id: string;
  label: string;
  capacity: number | null;
};

function toLayout(o: SetupOption): LayoutOption {
  return { id: o.id, label: o.label, capacity: o.capacity };
}

export function listRooms(): RoomId[] {
  return Array.from(new Set(SETUP_OPTIONS.map((o) => o.room)));
}

export function getRoomForSetupOption(id: string | undefined): RoomId | undefined {
  if (!id) return undefined;
  return SETUP_OPTIONS.find((o) => o.id === id)?.room;
}

export function getLayoutsForRoom(room: RoomId): LayoutOption[] {
  return SETUP_OPTIONS.filter((o) => o.room === room).map(toLayout);
}

export function getDefaultLayoutForRoom(room: RoomId): LayoutOption {
  const found = SETUP_OPTIONS.find((o) => o.room === room);
  if (!found) {
    throw new Error(`No layouts available for room "${room}"`);
  }
  return toLayout(found);
}

export function isLayoutCompatibleWithRoom(
  layoutId: string | undefined,
  room: RoomId,
): boolean {
  if (!layoutId) return false;
  return SETUP_OPTIONS.some((o) => o.id === layoutId && o.room === room);
}

/**
 * Single centralized rule for every Room → layout transition.
 *
 * - If `currentLayoutId` is still valid for `nextRoom` → keep it.
 * - Otherwise → return `undefined` so the caller clears the field and the
 *   user must pick another layout in the Setup Style step.
 *
 * No component may reimplement this logic.
 */
export function resolveLayoutForRoomChange(
  nextRoom: RoomId,
  currentLayoutId: string | undefined,
): string | undefined {
  if (isLayoutCompatibleWithRoom(currentLayoutId, nextRoom)) {
    return currentLayoutId;
  }
  return undefined;
}
