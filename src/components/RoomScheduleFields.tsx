import { AlertTriangle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROOMS, getRoom, findConflicts, useStore } from "@/lib/store";

type Props = {
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  excludeId?: string;
  onChange: (patch: Partial<{
    room: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
  }>) => void;
};

export function RoomScheduleFields({
  room,
  date,
  startTime,
  endTime,
  attendees,
  excludeId,
  onChange,
}: Props) {
  const { reservations } = useStore();
  const conflicts = findConflicts(reservations, { date, room, startTime, endTime, excludeId });
  const roomInfo = getRoom(room);
  const overCapacity = roomInfo && attendees > roomInfo.capacity;
  const timeInvalid = startTime && endTime && startTime >= endTime;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Room">
          <Select value={room} onValueChange={(v) => onChange({ room: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a room" />
            </SelectTrigger>
            <SelectContent>
              {ROOMS.map((r) => (
                <SelectItem key={r.name} value={r.name}>
                  {r.name} <span className="text-muted-foreground">· {r.capacity} seats</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Attendees">
          <Input
            type="number"
            min={1}
            value={attendees}
            onChange={(e) => onChange({ attendees: Number(e.target.value) })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => onChange({ date: e.target.value })} />
        </Field>
        <Field label="Start">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
          />
        </Field>
        <Field label="End">
          <Input
            type="time"
            value={endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
          />
        </Field>
      </div>

      {roomInfo && (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Users className="h-3 w-3" />
          {roomInfo.name} fits up to {roomInfo.capacity} people.
        </p>
      )}

      {overCapacity && (
        <Warning>
          {attendees} attendees exceeds {roomInfo!.name}'s capacity of {roomInfo!.capacity}.
        </Warning>
      )}

      {timeInvalid && <Warning>End time must be after start time.</Warning>}

      {conflicts.length > 0 && (
        <Warning>
          Conflicts with {conflicts.length} other booking
          {conflicts.length > 1 ? "s" : ""} in {room}:
          <ul className="mt-1 space-y-0.5">
            {conflicts.map((c) => (
              <li key={c.id} className="text-xs">
                · <span className="font-medium">{c.eventName}</span> ({c.startTime}–{c.endTime}, {c.status})
              </li>
            ))}
          </ul>
        </Warning>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm flex gap-2">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
