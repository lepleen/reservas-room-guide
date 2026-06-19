import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ReservationDTO, ReservationStatus } from "@/features/reservations/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any, profile?: { full_name?: string; email?: string } | null): ReservationDTO {
  return {
    id: row.id,
    reservationType: row.kind === "internal" ? "internal" : "external",
    status: row.status as ReservationStatus,
    ownerId: row.owner_id ?? null,
    ownerName: profile?.full_name ?? null,
    ownerEmail: profile?.email ?? null,

    organizerName: row.organizer_name,
    jobTitle: row.job_title,
    phone: row.phone,
    brand: row.brand,
    cnpj: row.cnpj,

    eventName: row.event_name,
    eventType: row.event_type,
    broadcastPlatform: row.broadcast_platform ?? null,

    date: row.date,
    startTime: String(row.start_time).slice(0, 5),
    endTime: String(row.end_time).slice(0, 5),

    attendees: row.attendees,
    setupOptionId: row.setup_option_id,
    room: row.room,
    maxCapacity: row.max_capacity ?? null,

    catering: !!row.catering,
    cateringItems: Array.isArray(row.catering_items) ? row.catering_items : [],
    equipment: Array.isArray(row.equipment) ? row.equipment : [],
    speakers: Array.isArray(row.speakers) ? row.speakers : [],
    schedule: Array.isArray(row.schedule) ? row.schedule : [],

    hasInPersonSpeakers: !!row.has_in_person_speakers,
    recording: !!row.recording,
    microphoneType: row.microphone_type ?? null,
    ledColor: row.led_color ?? null,

    registrationRequired: !!row.registration_required,
    registrationUrl: row.registration_url ?? null,

    notes: row.notes ?? null,
    adminNotes: row.admin_notes ?? null,
    reviewedAt: row.reviewed_at ?? null,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function attachProfiles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
): Promise<ReservationDTO[]> {
  const ids = Array.from(new Set(rows.map((r) => r.owner_id).filter(Boolean)));
  const profileMap = new Map<string, { full_name?: string; email?: string }>();
  if (ids.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ids);
    for (const p of profiles ?? []) {
      profileMap.set(p.id as string, { full_name: p.full_name, email: p.email });
    }
  }
  return rows.map((r) => mapRow(r, r.owner_id ? profileMap.get(r.owner_id) : null));
}

export const listReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) throw new Error(error.message);
    return attachProfiles(context.supabase, data ?? []);
  });

export const getReservationById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("reservations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const [dto] = await attachProfiles(context.supabase, [row]);
    return dto;
  });

const statusSchema = z.enum(["pending", "approved", "confirmed", "rejected", "cancelled"]);

export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: ReservationStatus; adminNotes?: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: statusSchema,
        adminNotes: z.string().max(2000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { error } = await context.supabase
      .from("reservations")
      .update({
        status: data.status,
        admin_notes: data.adminNotes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const patchSchema = z
  .object({
    eventName: z.string().min(1).optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    attendees: z.number().int().positive().optional(),
    notes: z.string().nullable().optional(),
    adminNotes: z.string().nullable().optional(),
  })
  .strict();

export const updateReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; patch: z.infer<typeof patchSchema> }) =>
    z.object({ id: z.string().uuid(), patch: patchSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    const p = data.patch;
    if (p.eventName !== undefined) update.event_name = p.eventName;
    if (p.date !== undefined) update.date = p.date;
    if (p.startTime !== undefined) update.start_time = p.startTime;
    if (p.endTime !== undefined) update.end_time = p.endTime;
    if (p.attendees !== undefined) update.attendees = p.attendees;
    if (p.notes !== undefined) update.notes = p.notes;
    if (p.adminNotes !== undefined) update.admin_notes = p.adminNotes;

    const { error } = await context.supabase.from("reservations").update(update).eq("id", data.id);
    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "23P01") {
        throw new Error("This time slot conflicts with another booking.");
      }
      throw new Error(error.message);
    }
    return { ok: true };
  });
