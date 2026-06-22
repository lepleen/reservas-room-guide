import espaco01 from "@/assets/espaco_01.png.asset.json";
import espaco02 from "@/assets/espaco_02.png.asset.json";
import espaco03 from "@/assets/espaco_03.png.asset.json";

export type LayoutPreview = { src: string; alt: string };

const FULL_VENUE: LayoutPreview = { src: espaco01.url, alt: "Full venue layout" };
const AUDITORIUM_A: LayoutPreview = { src: espaco02.url, alt: "Auditorium A layout" };
const AUDITORIUM_B: LayoutPreview = { src: espaco03.url, alt: "Auditorium B layout" };

export const LAYOUT_PREVIEW_MAP: Record<string, LayoutPreview> = {
  "auditorium-a-theater": AUDITORIUM_A,
  "auditorium-a-classroom": AUDITORIUM_A,
  "auditorium-a-u-shape": AUDITORIUM_A,
  "auditorium-a-lab-round": AUDITORIUM_A,
  "auditorium-a-lab-7-tables": AUDITORIUM_A,
  "auditorium-b-theater": AUDITORIUM_B,
  "auditorium-b-classroom": AUDITORIUM_B,
  "coffee-bistro": FULL_VENUE,
  "coffee-bistro-side": FULL_VENUE,
  "square-layout": FULL_VENUE,
};

export function getLayoutPreview(id: string | undefined): LayoutPreview {
  if (id && LAYOUT_PREVIEW_MAP[id]) return LAYOUT_PREVIEW_MAP[id];
  return FULL_VENUE;
}

export function formatCapacity(capacity: number | null): string {
  return capacity == null ? "Capacity available upon request" : `Up to ${capacity} people`;
}
