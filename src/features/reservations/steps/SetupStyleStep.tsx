import { useFormContext } from "react-hook-form";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SetupStylePreview } from "@/components/SetupStylePreview";
import { getSetupOption } from "@/lib/reservation-options";
import { Field, Warning } from "./_primitives";
import {
  getLayoutsForRoom,
  getRoomForSetupOption,
} from "../room-selection";
import type { ReservationFormShape } from "./types";

export function SetupStyleStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  const currentRoom = getRoomForSetupOption(v.setupOptionId);
  const layouts = currentRoom ? getLayoutsForRoom(currentRoom) : [];
  const setup = getSetupOption(v.setupOptionId);
  const overCapacity =
    setup?.capacity != null && v.attendees > setup.capacity;

  if (!currentRoom) {
    return (
      <Warning>
        Pick a room in the Room step before choosing a setup style.
      </Warning>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <Field
          label="Setup style *"
          error={form.formState.errors.setupOptionId?.message}
          hint={`Layouts available for ${currentRoom}.`}
        >
          <Select
            value={v.setupOptionId}
            onValueChange={(val) =>
              form.setValue("setupOptionId", val, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a layout" />
            </SelectTrigger>
            <SelectContent>
              {layouts.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}{" "}
                  <span className="text-muted-foreground">
                    · max {o.capacity ?? "Undefined"}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {setup ? (
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-1">
              <Users className="h-3 w-3" />
              {setup.room} · max capacity{" "}
              {setup.capacity != null ? setup.capacity : "Undefined"}
            </p>
          ) : null}
        </Field>
        <SetupStylePreview setup={setup} />
      </div>

      {overCapacity && setup ? (
        <Warning>
          {v.attendees} attendees exceeds {setup.room}'s capacity of{" "}
          {setup.capacity}.
        </Warning>
      ) : null}
    </div>
  );
}
