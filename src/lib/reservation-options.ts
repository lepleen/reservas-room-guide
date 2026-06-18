// Single source of truth for setup options, rooms, event types,
// broadcast platforms, catering items, and additional equipment.

export type SetupOption = {
  id: string;
  label: string;
  room: string;
  /** null means "Undefined" — show as such in the UI. */
  capacity: number | null;
};

export const SETUP_OPTIONS: SetupOption[] = [
  // Auditorium A
  { id: "auditorium-a-theater", label: "Theater — Auditorium A", room: "Auditorium A", capacity: 120 },
  { id: "auditorium-a-classroom", label: "Classroom — Auditorium A", room: "Auditorium A", capacity: 60 },
  { id: "auditorium-a-u-shape", label: "U-Shape — Auditorium A", room: "Auditorium A", capacity: 40 },
  { id: "auditorium-a-lab-round", label: "Lab Layout (Round Tables) — Auditorium A", room: "Auditorium A", capacity: null },
  { id: "auditorium-a-lab-7-tables", label: "Lab Layout — 7 table sets with 2 chairs each — Auditorium A", room: "Auditorium A", capacity: 14 },

  // Auditorium B
  { id: "auditorium-b-theater", label: "Theater — Auditorium B", room: "Auditorium B", capacity: 80 },
  { id: "auditorium-b-classroom", label: "Classroom — Auditorium B", room: "Auditorium B", capacity: 40 },

  // Misc (room left as a generic label — keeps existing names per answer 2)
  { id: "coffee-bistro", label: "Coffee Setup — White Bistro Tables", room: "Foyer", capacity: null },
  { id: "coffee-bistro-side", label: "Coffee Setup — White Bistro Tables (Side Arrangement)", room: "Foyer", capacity: null },
  { id: "square-layout", label: "Square Layout", room: "Meeting Room", capacity: null },
];

export function getSetupOption(id: string): SetupOption | undefined {
  return SETUP_OPTIONS.find((o) => o.id === id);
}

/** Distinct rooms derived from the setup options list. */
export const ROOMS: string[] = Array.from(new Set(SETUP_OPTIONS.map((o) => o.room)));

export const EVENT_TYPES = [
  { value: "in_person", label: "In-person" },
  { value: "live_broadcast", label: "Live broadcast" },
  { value: "recorded", label: "Recorded" },
] as const;
export type EventType = (typeof EVENT_TYPES)[number]["value"];

export const BROADCAST_PLATFORMS = ["YouTube", "Microsoft Teams", "Zoom"] as const;
export type BroadcastPlatform = (typeof BROADCAST_PLATFORMS)[number];

export const CATERING_ITEMS = [
  "Coffee",
  "Tea",
  "Water",
  "Soft drinks",
  "Pastries",
  "Sandwiches",
  "Fruit platter",
  "Hot meal",
] as const;

export const EQUIPMENT_ITEMS = [
  "Extra microphone",
  "Clicker / presenter remote",
  "Confidence monitor",
  "Additional projector",
  "Translation booth",
  "Stage lighting",
  "Live captioning",
  "Photographer",
] as const;
