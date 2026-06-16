import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, findConflicts, getRoom, type Reservation } from "@/lib/store";
import { RoomScheduleFields } from "@/components/RoomScheduleFields";
import { toast } from "sonner";

export const Route = createFileRoute("/reservations/new")({
  head: () => ({
    meta: [
      { title: "New reservation — Roomr" },
      { name: "description", content: "Plan a new room reservation with full event details." },
    ],
  }),
  component: NewReservationPage,
});

type Form = Omit<
  Reservation,
  "id" | "createdAt" | "ownerEmail" | "ownerName" | "status" | "adminNotes" | "reviewedAt" | "kind"
>;

const empty: Form = {
  eventName: "",
  room: "Atlas Hall",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  attendees: 10,
  setupStyle: "theater",
  catering: false,
  cateringNotes: "",
  speakers: [],
  hasLiveBroadcast: false,
  broadcastPlatform: "",
  hasInPersonSpeakers: false,
  recording: false,
  ledColor: "#1978E5",
  microphoneType: "handheld",
  registrationRequired: false,
  registrationUrl: "",
  schedule: [],
  notes: "",
};

function NewReservationPage() {
  const { addReservation, reservations } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState<Form>(empty);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const patch = (p: Partial<Form>) => setF((prev) => ({ ...prev, ...p }));

  const conflicts = findConflicts(reservations, {
    date: f.date,
    room: f.room,
    startTime: f.startTime,
    endTime: f.endTime,
  });
  const roomInfo = getRoom(f.room);
  const overCapacity = roomInfo ? f.attendees > roomInfo.capacity : false;
  const timeInvalid = f.startTime >= f.endTime;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.eventName || !f.room || !f.date) {
      toast.error("Event name, room, and date are required.");
      return;
    }
    if (timeInvalid) {
      toast.error("End time must be after start time.");
      return;
    }
    if (conflicts.length > 0) {
      toast.error("This room is already booked at that time. Pick a different slot.");
      return;
    }
    if (overCapacity) {
      toast.error(`${f.room} only fits ${roomInfo!.capacity} attendees.`);
      return;
    }
    const r = addReservation(f);
    toast.success("Request submitted for admin review");
    navigate({ to: "/reservations/$id", params: { id: r.id } });
  };

  return (
    <AppShell>
      <PageHeader
        title="New reservation"
        description="Capture everything needed for a smooth event."
      />

      <form onSubmit={submit} className="space-y-10 max-w-3xl">
        <Section title="Basics" description="The essentials about your event.">
          <Field label="Event name">
            <Input value={f.eventName} onChange={(e) => set("eventName", e.target.value)} placeholder="All-hands Q3" />
          </Field>
          <RoomScheduleFields
            room={f.room}
            date={f.date}
            startTime={f.startTime}
            endTime={f.endTime}
            attendees={f.attendees}
            onChange={patch}
          />
          <Field label="Setup style">
            <Select value={f.setupStyle} onValueChange={(v) => set("setupStyle", v as Form["setupStyle"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="theater">Theater</SelectItem>
                <SelectItem value="classroom">Classroom</SelectItem>
                <SelectItem value="u-shape">U-shape</SelectItem>
                <SelectItem value="boardroom">Boardroom</SelectItem>
                <SelectItem value="banquet">Banquet</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Catering" description="Optional food & drink details.">
          <Toggle
            label="Catering required"
            checked={f.catering}
            onChange={(v) => set("catering", v)}
          />
          {f.catering && (
            <Field label="Catering notes">
              <Textarea
                rows={3}
                value={f.cateringNotes}
                onChange={(e) => set("cateringNotes", e.target.value)}
                placeholder="Dietary restrictions, service timing, menu preferences…"
              />
            </Field>
          )}
        </Section>

        <Section title="Speakers" description="Add people presenting at the event.">
          <Toggle
            label="In-person speakers"
            checked={f.hasInPersonSpeakers}
            onChange={(v) => set("hasInPersonSpeakers", v)}
          />
          {f.hasInPersonSpeakers && (
            <div className="space-y-2">
              {f.speakers.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    placeholder="Name"
                    value={s.name}
                    onChange={(e) => {
                      const next = [...f.speakers];
                      next[i] = { ...next[i], name: e.target.value };
                      set("speakers", next);
                    }}
                  />
                  <Input
                    placeholder="Topic"
                    value={s.topic}
                    onChange={(e) => {
                      const next = [...f.speakers];
                      next[i] = { ...next[i], topic: e.target.value };
                      set("speakers", next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => set("speakers", f.speakers.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("speakers", [...f.speakers, { name: "", topic: "" }])}
              >
                <Plus className="h-4 w-4" /> Add speaker
              </Button>
            </div>
          )}
        </Section>

        <Section title="Broadcast & AV" description="Audiovisual setup and live streaming.">
          <Toggle
            label="Live broadcast"
            checked={f.hasLiveBroadcast}
            onChange={(v) => set("hasLiveBroadcast", v)}
          />
          {f.hasLiveBroadcast && (
            <Field label="Broadcast platform">
              <Input
                value={f.broadcastPlatform}
                onChange={(e) => set("broadcastPlatform", e.target.value)}
                placeholder="Zoom Webinar, YouTube Live, …"
              />
            </Field>
          )}
          <Toggle label="Record the event" checked={f.recording} onChange={(v) => set("recording", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Microphone type">
              <Select
                value={f.microphoneType}
                onValueChange={(v) => set("microphoneType", v as Form["microphoneType"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="handheld">Handheld</SelectItem>
                  <SelectItem value="lavalier">Lavalier</SelectItem>
                  <SelectItem value="headset">Headset</SelectItem>
                  <SelectItem value="podium">Podium</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="LED accent color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={f.ledColor}
                  onChange={(e) => set("ledColor", e.target.value)}
                  className="h-10 w-12 rounded-md border border-input bg-background cursor-pointer"
                />
                <Input value={f.ledColor} onChange={(e) => set("ledColor", e.target.value)} />
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Registration" description="Track attendee sign-ups.">
          <Toggle
            label="Registration required"
            checked={f.registrationRequired}
            onChange={(v) => set("registrationRequired", v)}
          />
          {f.registrationRequired && (
            <Field label="Registration URL">
              <Input
                value={f.registrationUrl}
                onChange={(e) => set("registrationUrl", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          )}
        </Section>

        <Section title="Schedule" description="Plan the run-of-show, minute by minute.">
          <div className="space-y-2">
            {f.schedule.map((s, i) => (
              <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
                <Input
                  type="time"
                  value={s.time}
                  onChange={(e) => {
                    const next = [...f.schedule];
                    next[i] = { ...next[i], time: e.target.value };
                    set("schedule", next);
                  }}
                />
                <Input
                  placeholder="Action"
                  value={s.action}
                  onChange={(e) => {
                    const next = [...f.schedule];
                    next[i] = { ...next[i], action: e.target.value };
                    set("schedule", next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => set("schedule", f.schedule.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set("schedule", [...f.schedule, { time: "09:00", action: "" }])}
            >
              <Plus className="h-4 w-4" /> Add schedule item
            </Button>
          </div>
        </Section>

        <Section title="Notes" description="Anything else the team should know.">
          <Textarea
            rows={4}
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Special requirements, VIPs, access, …"
          />
        </Section>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
            Cancel
          </Button>
          <Button type="submit">Create reservation</Button>
        </div>
      </form>
    </AppShell>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid md:grid-cols-[220px_1fr] gap-6">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}