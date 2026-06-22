import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Toggle } from "./_primitives";
import type { ReservationFormShape } from "./types";

export function AVStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  return (
    <div className="space-y-4">
      <Toggle
        label="Record the event"
        checked={v.recording}
        onChange={(val) => form.setValue("recording", val)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Microphone type">
          <Select
            value={v.microphoneType ?? "handheld"}
            onValueChange={(val) =>
              form.setValue(
                "microphoneType",
                val as ReservationFormShape["microphoneType"],
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="handheld">Handheld</SelectItem>
              <SelectItem value="lavalier">Lavalier</SelectItem>
              <SelectItem value="headset">Headset</SelectItem>
              <SelectItem value="podium">Podium</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}
