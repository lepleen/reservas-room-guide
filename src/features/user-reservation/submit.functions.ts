import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { userReservationSchema, type UserReservationValues } from "./schema";
import { getSetupOption } from "@/lib/reservation-options";
import { RoomUnavailableError } from "@/features/shared/conflict-error";
import type { AvailabilityConflict } from "@/features/shared/availability.functions";

export const createUserReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { values: UserReservationValues }) => ({
    values: userReservationSchema.parse(data.values),
  }))
  .handler(async ({ data, context }) => {
    const { values } = data;
    const setup = getSetupOption(values.setupOptionId);
    if (!setup) throw new Error("Invalid setup option");

    if (values.startTime >= values.endTime) {
      throw new Error("End time must be after start time");
    }

    const { data: conflicts, error: confErr } = await context.supabase.rpc("find_conflicts", {
      _room: setup.room,
      _date: values.date,
      _start: values.startTime,
      _end: values.endTime,
      _exclude: null,
    });
    if (confErr) throw new Error(confErr.message);
    if (conflicts && conflicts.length > 0) {
      throw new RoomUnavailableError(toAvailabilityConflicts(conflicts));
    }



    const { data: row, error } = await context.supabase
      .from("reservations")
      .insert({
        owner_id: context.userId,
        kind: "user",
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

    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "23P01") {
        // Concurrent overlap rejected by the GIST exclusion constraint.
        throw new RoomUnavailableError([]);
      }
      throw new Error(error.message);
    }
    return { id: row!.id as string };
  });

// Map the SQL `find_conflicts` row shape into the wire DTO.
function toAvailabilityConflicts(rows: Array<{
  id: string;
  event_name: string;
  start_time: string;
  end_time: string;
  status: string;
}>): AvailabilityConflict[] {
  return rows.map((r) => ({
    id: r.id,
    eventName: r.event_name,
    startTime: String(r.start_time).slice(0, 5),
    endTime: String(r.end_time).slice(0, 5),
    status: r.status,
  }));
}
    return { id: row!.id as string };
  });
