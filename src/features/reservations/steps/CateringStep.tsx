import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CATERING_ITEMS } from "@/lib/reservation-options";
import type { ReservationFormShape } from "./types";

export function CateringStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  return (
    <div className="space-y-4">
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

      {v.catering ? (
        <div className="space-y-2">
          {form.formState.errors.cateringItems?.message ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.cateringItems.message}
            </p>
          ) : null}
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
                aria-label={`Remove catering item ${i + 1}`}
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
      ) : null}
    </div>
  );
}
