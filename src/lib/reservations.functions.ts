import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { reservationFormSchema, type ReservationFormValues } from "./reservation-schema";
import { getSetupOption } from "./reservation-options";

type CreateInput = {
  kind: "user" | "internal";
  values: ReservationFormValues;
};

export const createReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CreateInput) => ({
    kind: data.kind === "internal" ? "internal" : "user",
    values: reservationFormSchema.parse(data.values),
  }))
  .handler(async ({ data, context }) => {
    const { values, kind } = data;
    const setup = getSetupOption(values.setupOptionId);
    if (!setup) throw new Error("Invalid setup option");

    const { data: row, error } = await context.supabase
      .from("reservations")
      .insert({
        owner_id: context.userId,
        kind,
        status: "pending",

        organizer_name: values.organizerName,
        job_title: values.jobTitle,
        phone: values.phone,
        brand: values.brand,
        cnpj: values.cnpj,

        event_name: values.eventName,
        event_type: values.eventType,
        broadcast_platform: values.broadcastPlatform ?? null,

        date: values.date,
        start_time: values.startTime,
        end_time: values.endTime,
        attendees: values.attendees,
        setup_option_id: values.setupOptionId,
        room: setup.room,
        max_capacity: setup.capacity,

        catering: values.catering,
        catering_items: values.catering ? values.cateringItems : [],
        equipment: values.equipment,
        speakers: values.hasInPersonSpeakers ? values.speakers : [],
        schedule: values.schedule,

        has_in_person_speakers: values.hasInPersonSpeakers,
        recording: values.recording,
        microphone_type: values.microphoneType ?? null,
        led_color: values.ledColor ?? null,
        registration_required: values.registrationRequired,
        registration_url: values.registrationUrl || null,
        notes: values.notes || null,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });
