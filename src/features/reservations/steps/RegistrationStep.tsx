import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, Toggle } from "./_primitives";
import type { ReservationFormShape } from "./types";

export function RegistrationStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  return (
    <div className="space-y-4">
      <Toggle
        label="Registration required"
        checked={v.registrationRequired}
        onChange={(val) => form.setValue("registrationRequired", val)}
      />
      {v.registrationRequired ? (
        <Field
          label="Registration URL"
          error={form.formState.errors.registrationUrl?.message}
        >
          <Input {...form.register("registrationUrl")} placeholder="https://…" />
        </Field>
      ) : null}
    </div>
  );
}
