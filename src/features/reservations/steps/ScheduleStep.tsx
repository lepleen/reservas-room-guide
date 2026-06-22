import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "./_primitives";
import type { ReservationFormShape } from "./types";

export function ScheduleStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {v.schedule.map((s, i) => (
          <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
            <Input
              type="time"
              value={s.time}
              onChange={(e) => {
                const next = [...v.schedule];
                next[i] = { ...next[i], time: e.target.value };
                form.setValue("schedule", next);
              }}
            />
            <Input
              placeholder="Action"
              value={s.action}
              onChange={(e) => {
                const next = [...v.schedule];
                next[i] = { ...next[i], action: e.target.value };
                form.setValue("schedule", next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove schedule item ${i + 1}`}
              onClick={() =>
                form.setValue(
                  "schedule",
                  v.schedule.filter((_, j) => j !== i),
                )
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            form.setValue("schedule", [
              ...v.schedule,
              { time: "09:00", action: "" },
            ])
          }
        >
          <Plus className="h-4 w-4" /> Add schedule item
        </Button>
      </div>

      <Field label="Notes">
        <Textarea
          rows={4}
          {...form.register("notes")}
          placeholder="Special requirements…"
        />
      </Field>
    </div>
  );
}
