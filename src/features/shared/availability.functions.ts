import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const inputSchema = z.object({
  room: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  excludeId: z.string().uuid().optional(),
});

export type AvailabilityInput = z.infer<typeof inputSchema>;

export type AvailabilityConflict = {
  id: string;
  eventName: string;
  startTime: string;
  endTime: string;
  status: string;
};

export type AvailabilityResult = {
  available: boolean;
  conflicts: AvailabilityConflict[];
};

export const checkAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AvailabilityInput) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<AvailabilityResult> => {
    if (data.startTime >= data.endTime) {
      return { available: false, conflicts: [] };
    }

    const { data: rows, error } = await context.supabase.rpc("find_conflicts", {
      _room: data.room,
      _date: data.date,
      _start: data.startTime,
      _end: data.endTime,
      _exclude: data.excludeId ?? null,
    });

    if (error) throw new Error(error.message);

    const conflicts: AvailabilityConflict[] = (rows ?? []).map((r: {
      id: string;
      event_name: string;
      start_time: string;
      end_time: string;
      status: string;
    }) => ({
      id: r.id,
      eventName: r.event_name,
      startTime: r.start_time.slice(0, 5),
      endTime: r.end_time.slice(0, 5),
      status: r.status,
    }));

    return { available: conflicts.length === 0, conflicts };
  });
