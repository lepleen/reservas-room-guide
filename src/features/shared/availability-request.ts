// Payload captured by the "Room Currently Unavailable" modal.
// Held in component state for now; the next feature (Waiting List) will
// persist it without changing the modal API.

export type AvailabilityRequest = {
  email: string;
  requesterName?: string;
  reservationType: "external" | "internal";
  roomId: string;
  roomName: string;
  reservationDate: string; // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
};

// Everything the form knows before the modal collects the email.
export type AvailabilityRequestDraft = Omit<AvailabilityRequest, "email">;
