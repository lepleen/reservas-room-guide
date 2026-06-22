import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field } from "./_primitives";
import type { ReservationFormShapeWithOrganizer } from "./types";

export function OrganizerStep() {
  const form = useFormContext<ReservationFormShapeWithOrganizer>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Field
        label="Responsible organizer *"
        error={form.formState.errors.organizerName?.message}
      >
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
  );
}
