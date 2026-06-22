import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EVENT_TYPES, BROADCAST_PLATFORMS } from "@/lib/reservation-options";
import { Field } from "./_primitives";
import type { ReservationFormShape } from "./types";

export function EventBasicsStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  return (
    <div className="space-y-4">
      <Field label="Event name *" error={form.formState.errors.eventName?.message}>
        <Input {...form.register("eventName")} placeholder="All-hands Q3" />
      </Field>

      <Field label="Attendees" error={form.formState.errors.attendees?.message}>
        <Input
          type="number"
          min={1}
          {...form.register("attendees", { valueAsNumber: true })}
        />
      </Field>

      <Field label="Event type *">
        <RadioGroup
          value={v.eventType}
          onValueChange={(val) => {
            form.setValue("eventType", val as ReservationFormShape["eventType"], {
              shouldValidate: true,
            });
            if (val !== "live_broadcast") {
              form.setValue("broadcastPlatform", undefined);
            }
            if (val === "recorded") {
              form.setValue("recording", true);
            }
          }}
          className="grid gap-2"
        >
          {EVENT_TYPES.map((t) => (
            <label
              key={t.value}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 cursor-pointer"
            >
              <RadioGroupItem value={t.value} />
              <span className="text-sm">{t.label}</span>
            </label>
          ))}
        </RadioGroup>
      </Field>

      {v.eventType === "live_broadcast" ? (
        <Field
          label="Broadcast platform *"
          error={form.formState.errors.broadcastPlatform?.message}
        >
          <Select
            value={v.broadcastPlatform ?? ""}
            onValueChange={(val) =>
              form.setValue(
                "broadcastPlatform",
                val as ReservationFormShape["broadcastPlatform"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {BROADCAST_PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}
    </div>
  );
}
