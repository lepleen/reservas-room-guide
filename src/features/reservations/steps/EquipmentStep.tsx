import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { EQUIPMENT_ITEMS } from "@/lib/reservation-options";
import type { ReservationFormShape } from "./types";

export function EquipmentStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  return (
    <div className="space-y-4">
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
    </div>
  );
}
