import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvailabilityStatus } from "@/features/shared/AvailabilityStatus";
import { Field } from "./_primitives";
import {
  getDefaultLayoutForRoom,
  getRoomForSetupOption,
  listRooms,
  resolveLayoutForRoomChange,
} from "../room-selection";
import { useReservationFormContext } from "../reservation-form-context";
import type { ReservationFormShape } from "./types";

export function RoomStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();
  const { availability, availabilityEnabled, hasConflict, onRequestAvailability } =
    useReservationFormContext();

  const rooms = listRooms();
  const currentRoom = getRoomForSetupOption(v.setupOptionId);

  const handleRoomChange = (nextRoom: string) => {
    const kept = resolveLayoutForRoomChange(nextRoom, v.setupOptionId);
    // If layout was kept, no write needed. Otherwise pick the default
    // layout for the new room so availability can query immediately.
    // The user will revisit Setup Style to confirm or change it.
    const nextLayoutId = kept ?? getDefaultLayoutForRoom(nextRoom).id;
    form.setValue("setupOptionId", nextLayoutId, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <Field
        label="Room *"
        error={form.formState.errors.setupOptionId?.message}
        hint="Pick the room first; you'll choose the layout in a later step."
      >
        <Select value={currentRoom ?? ""} onValueChange={handleRoomChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Date *" error={form.formState.errors.date?.message}>
          <Input type="date" {...form.register("date")} />
        </Field>
        <Field label="Start" error={form.formState.errors.startTime?.message}>
          <Input type="time" {...form.register("startTime")} />
        </Field>
        <Field label="End" error={form.formState.errors.endTime?.message}>
          <Input type="time" {...form.register("endTime")} />
        </Field>
      </div>

      <AvailabilityStatus query={availability} enabled={availabilityEnabled} />

      {hasConflict ? (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onRequestAvailability}>
            Request availability
          </Button>
        </div>
      ) : null}
    </div>
  );
}
