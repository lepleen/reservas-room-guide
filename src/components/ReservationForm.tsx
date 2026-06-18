import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Plus, Trash2, AlertTriangle, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  reservationFormSchema,
  defaultReservationValues,
  type ReservationFormValues,
} from "@/lib/reservation-schema";
import {
  SETUP_OPTIONS,
  getSetupOption,
  EVENT_TYPES,
  BROADCAST_PLATFORMS,
  CATERING_ITEMS,
  EQUIPMENT_ITEMS,
} from "@/lib/reservation-options";
import { createReservation } from "@/lib/reservations.functions";

type Props = {
  mode: "external" | "internal";
};

export function ReservationForm({ mode }: Props) {
  const navigate = useNavigate();
  const submitFn = useServerFn(createReservation);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: defaultReservationValues,
    mode: "onBlur",
  });

  const v = form.watch();
  const setup = useMemo(() => getSetupOption(v.setupOptionId), [v.setupOptionId]);
  const overCapacity = setup?.capacity != null && v.attendees > setup.capacity;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await submitFn({
        data: { kind: mode === "internal" ? "internal" : "user", values },
      });
      toast.success("Reservation submitted for review");
      if (mode === "internal") {
        navigate({ to: "/internal/reservations/$id", params: { id: res.id } });
      } else {
        navigate({ to: "/reservations/$id", params: { id: res.id } });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit reservation";
      toast.error(msg);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-10 max-w-3xl">
      {/* ORGANIZER */}
      <Section title="Organizer" description="Who is responsible for this event.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Responsible organizer *" error={form.formState.errors.organizerName?.message}>
            <Input {...form.register("organizerName")} placeholder="Jane Doe" />
          </Field>
          <Field label="Job title *" error={form.formState.errors.jobTitle?.message}>
            <Input {...form.register("jobTitle")} placeholder="Head of Marketing" />
          </Field>
          <Field
            label="Phone *"
            error={form.formState.errors.phone?.message}
            hint="Brazilian: +55DDDNNNNNNNN · International: +<country><number>"
          >
            <Input {...form.register("phone")} placeholder="+5511987654321" />
          </Field>
          <Field label="Brand *" error={form.formState.errors.brand?.message}>
            <Input {...form.register("brand")} placeholder="Brand name" />
          </Field>
          <Field
            label="CNPJ *"
            error={form.formState.errors.cnpj?.message}
            hint="14 digits"
          >
            <Input {...form.register("cnpj")} placeholder="12.345.678/0001-95" />
          </Field>
        </div>
      </Section>

      {/* EVENT BASICS */}
      <Section title="Event basics" description="Essentials about the event.">
        <Field label="Event name *" error={form.formState.errors.eventName?.message}>
          <Input {...form.register("eventName")} placeholder="All-hands Q3" />
        </Field>

        <Field label="Setup style *" error={form.formState.errors.setupOptionId?.message}>
          <Select
            value={v.setupOptionId}
            onValueChange={(val) => form.setValue("setupOptionId", val, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SETUP_OPTIONS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}{" "}
                  <span className="text-muted-foreground">
                    · max {o.capacity ?? "Undefined"}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {setup && (
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-1">
              <Users className="h-3 w-3" />
              {setup.room} · max capacity{" "}
              {setup.capacity != null ? setup.capacity : "Undefined"}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-3 gap-3">
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

        <Field label="Attendees" error={form.formState.errors.attendees?.message}>
          <Input type="number" min={1} {...form.register("attendees", { valueAsNumber: true })} />
        </Field>

        {overCapacity && setup && (
          <Warning>
            {v.attendees} attendees exceeds {setup.room}'s capacity of {setup.capacity}.
          </Warning>
        )}
      </Section>

      {/* EVENT TYPE */}
      <Section title="Event type" description="How the event will be delivered.">
        <RadioGroup
          value={v.eventType}
          onValueChange={(val) => {
            form.setValue("eventType", val as ReservationFormValues["eventType"], {
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

        {v.eventType === "live_broadcast" && (
          <Field
            label="Broadcast platform *"
            error={form.formState.errors.broadcastPlatform?.message}
          >
            <Select
              value={v.broadcastPlatform ?? ""}
              onValueChange={(val) =>
                form.setValue(
                  "broadcastPlatform",
                  val as ReservationFormValues["broadcastPlatform"],
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
        )}
      </Section>

      {/* CATERING */}
      <Section title="Catering" description="Optional food & drink.">
        <RadioGroup
          value={v.catering ? "yes" : "no"}
          onValueChange={(val) => {
            const next = val === "yes";
            form.setValue("catering", next);
            if (!next) form.setValue("cateringItems", []);
          }}
          className="flex gap-3"
        >
          {(["yes", "no"] as const).map((val) => (
            <label
              key={val}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 cursor-pointer"
            >
              <RadioGroupItem value={val} />
              <span className="text-sm capitalize">{val}</span>
            </label>
          ))}
        </RadioGroup>

        {v.catering && (
          <div className="space-y-2">
            {form.formState.errors.cateringItems?.message && (
              <p className="text-xs text-destructive">
                {form.formState.errors.cateringItems.message}
              </p>
            )}
            {v.cateringItems.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_auto] gap-2">
                <Select
                  value={c.item}
                  onValueChange={(val) => {
                    const next = [...v.cateringItems];
                    next[i] = { ...next[i], item: val };
                    form.setValue("cateringItems", next, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATERING_ITEMS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={c.time}
                  onChange={(e) => {
                    const next = [...v.cateringItems];
                    next[i] = { ...next[i], time: e.target.value };
                    form.setValue("cateringItems", next, { shouldValidate: true });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    form.setValue(
                      "cateringItems",
                      v.cateringItems.filter((_, j) => j !== i),
                      { shouldValidate: true },
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
                form.setValue(
                  "cateringItems",
                  [...v.cateringItems, { item: CATERING_ITEMS[0], time: "09:00" }],
                  { shouldValidate: true },
                )
              }
            >
              <Plus className="h-4 w-4" /> Add catering item
            </Button>
          </div>
        )}
      </Section>

      {/* EQUIPMENT */}
      <Section title="Additional equipment" description="Optional add-ons.">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Additional equipment may generate extra costs.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {EQUIPMENT_ITEMS.map((item) => {
            const checked = v.equipment.includes(item);
            return (
              <label
                key={item}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    const next = c
                      ? [...v.equipment, item]
                      : v.equipment.filter((e) => e !== item);
                    form.setValue("equipment", next);
                  }}
                />
                <span className="text-sm">{item}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* SPEAKERS */}
      <Section title="Speakers" description="In-person presenters.">
        <Toggle
          label="In-person speakers"
          checked={v.hasInPersonSpeakers}
          onChange={(val) => form.setValue("hasInPersonSpeakers", val)}
        />
        {v.hasInPersonSpeakers && (
          <div className="space-y-2">
            {v.speakers.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  placeholder="Name"
                  value={s.name}
                  onChange={(e) => {
                    const next = [...v.speakers];
                    next[i] = { ...next[i], name: e.target.value };
                    form.setValue("speakers", next);
                  }}
                />
                <Input
                  placeholder="Topic"
                  value={s.topic}
                  onChange={(e) => {
                    const next = [...v.speakers];
                    next[i] = { ...next[i], topic: e.target.value };
                    form.setValue("speakers", next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    form.setValue(
                      "speakers",
                      v.speakers.filter((_, j) => j !== i),
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
                form.setValue("speakers", [...v.speakers, { name: "", topic: "" }])
              }
            >
              <Plus className="h-4 w-4" /> Add speaker
            </Button>
          </div>
        )}
      </Section>

      {/* AV */}
      <Section title="AV" description="Microphone & accents.">
        <Toggle
          label="Record the event"
          checked={v.recording}
          onChange={(val) => form.setValue("recording", val)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Microphone type">
            <Select
              value={v.microphoneType ?? "handheld"}
              onValueChange={(val) =>
                form.setValue(
                  "microphoneType",
                  val as ReservationFormValues["microphoneType"],
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
          <Field label="LED accent color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={v.ledColor ?? "#1978E5"}
                onChange={(e) => form.setValue("ledColor", e.target.value)}
                className="h-10 w-12 rounded-md border border-input bg-background cursor-pointer"
              />
              <Input
                value={v.ledColor ?? ""}
                onChange={(e) => form.setValue("ledColor", e.target.value)}
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* REGISTRATION */}
      <Section title="Registration" description="Track attendee sign-ups.">
        <Toggle
          label="Registration required"
          checked={v.registrationRequired}
          onChange={(val) => form.setValue("registrationRequired", val)}
        />
        {v.registrationRequired && (
          <Field
            label="Registration URL"
            error={form.formState.errors.registrationUrl?.message}
          >
            <Input {...form.register("registrationUrl")} placeholder="https://…" />
          </Field>
        )}
      </Section>

      {/* SCHEDULE */}
      <Section title="Schedule" description="Plan the run-of-show.">
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
              form.setValue("schedule", [...v.schedule, { time: "09:00", action: "" }])
            }
          >
            <Plus className="h-4 w-4" /> Add schedule item
          </Button>
        </div>
      </Section>

      {/* NOTES */}
      <Section title="Notes" description="Anything else the team should know.">
        <Textarea rows={4} {...form.register("notes")} placeholder="Special requirements…" />
      </Section>

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            navigate({ to: mode === "internal" ? "/internal/dashboard" : "/dashboard" })
          }
        >
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting…" : "Submit reservation"}
        </Button>
      </div>
    </form>
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

function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
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

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm flex gap-2">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
