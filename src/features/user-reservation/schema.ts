import { z } from "zod";
import {
  BROADCAST_PLATFORMS,
  CATERING_ITEMS,
  EQUIPMENT_ITEMS,
  EVENT_TYPES,
  SETUP_OPTIONS,
} from "@/lib/reservation-options";

// Accepts Brazilian (+55 DDD + 8 or 9 digit) OR international E.164 (+ then 8–15 digits).
const phoneRegex = /^\+(?:55\d{10,11}|\d{8,15})$/;

function isValidCnpj(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const calc = (slice: string, weights: number[]) => {
    const sum = slice.split("").reduce((acc, d, i) => acc + Number(d) * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(digits.slice(0, 12), w1);
  const d2 = calc(digits.slice(0, 12) + d1, w2);
  return d1 === Number(digits[12]) && d2 === Number(digits[13]);
}

const cateringItemSchema = z.object({
  item: z.enum(CATERING_ITEMS as unknown as [string, ...string[]]),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
});

const speakerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  topic: z.string().trim().max(200).default(""),
});

const scheduleItemSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  action: z.string().trim().min(1).max(200),
});

export const userReservationSchema = z
  .object({
    organizerName: z.string().trim().min(1, "Required").max(120),
    jobTitle: z.string().trim().min(1, "Required").max(120),
    phone: z
      .string()
      .trim()
      .min(1, "Required")
      .regex(phoneRegex, "Use +55DDDNNNNNNNN or international +<country><number>"),
    brand: z.string().trim().min(1, "Required").max(120),
    cnpj: z.string().trim().min(1, "Required").refine(isValidCnpj, "Invalid CNPJ"),

    eventName: z.string().trim().min(1, "Required").max(200),
    eventType: z.enum(EVENT_TYPES.map((e) => e.value) as unknown as [string, ...string[]]),
    broadcastPlatform: z.enum(BROADCAST_PLATFORMS as unknown as [string, ...string[]]).optional(),

    setupOptionId: z
      .string()
      .min(1, "Pick a setup style")
      .refine((id) => SETUP_OPTIONS.some((o) => o.id === id), "Invalid setup option"),

    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    attendees: z.coerce.number().int().min(1, "At least 1 attendee"),

    catering: z.boolean(),
    cateringItems: z.array(cateringItemSchema).default([]),

    equipment: z.array(z.enum(EQUIPMENT_ITEMS as unknown as [string, ...string[]])).default([]),

    hasInPersonSpeakers: z.boolean(),
    speakers: z.array(speakerSchema).default([]),
    recording: z.boolean(),
    microphoneType: z.enum(["handheld", "lavalier", "headset", "podium"]).optional(),
    ledColor: z.string().optional(),

    registrationRequired: z.boolean(),
    registrationUrl: z.string().url("Must be a URL").optional().or(z.literal("")),
    schedule: z.array(scheduleItemSchema).default([]),
    notes: z.string().max(2000).optional().or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    if (v.startTime >= v.endTime) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time must be after start time", path: ["endTime"] });
    }
    if (v.eventType === "live_broadcast" && !v.broadcastPlatform) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pick a platform", path: ["broadcastPlatform"] });
    }
    if (v.catering && v.cateringItems.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one catering item",
        path: ["cateringItems"],
      });
    }
  });

export type UserReservationValues = z.infer<typeof userReservationSchema>;

export const defaultUserReservationValues: UserReservationValues = {
  organizerName: "",
  jobTitle: "",
  phone: "",
  brand: "",
  cnpj: "",
  eventName: "",
  eventType: "in_person",
  broadcastPlatform: undefined,
  setupOptionId: SETUP_OPTIONS[0].id,
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  attendees: 10,
  catering: false,
  cateringItems: [],
  equipment: [],
  hasInPersonSpeakers: false,
  speakers: [],
  recording: false,
  microphoneType: "handheld",
  ledColor: "#1978E5",
  registrationRequired: false,
  registrationUrl: "",
  schedule: [],
  notes: "",
};
