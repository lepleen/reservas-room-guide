// Shared DTO for reservations exposed by server functions.
// `reservationType` is mapped from the DB `kind` column ("user" -> "external").

export type ReservationStatus =
  | "pending"
  | "approved"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type ReservationType = "external" | "internal";

export interface ReservationDTO {
  id: string;
  reservationType: ReservationType;
  status: ReservationStatus;
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;

  organizerName: string;
  jobTitle: string;
  phone: string;
  brand: string;
  cnpj: string;

  eventName: string;
  eventType: "in_person" | "live_broadcast" | "recorded";
  broadcastPlatform: string | null;

  date: string;
  startTime: string;
  endTime: string;

  attendees: number;
  setupOptionId: string;
  room: string;
  maxCapacity: number | null;

  catering: boolean;
  cateringItems: string[];
  equipment: string[];
  speakers: { name: string; topic?: string }[];
  schedule: { time: string; action: string }[];

  hasInPersonSpeakers: boolean;
  recording: boolean;
  microphoneType: string | null;
  ledColor: string | null;

  registrationRequired: boolean;
  registrationUrl: string | null;

  notes: string | null;
  adminNotes: string | null;
  reviewedAt: string | null;

  createdAt: string;
  updatedAt: string;
}
