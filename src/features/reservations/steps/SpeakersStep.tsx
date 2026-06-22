import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "./_primitives";
import type { ReservationFormShape } from "./types";

export function SpeakersStep() {
  const form = useFormContext<ReservationFormShape>();
  const v = form.watch();

  return (
    <div className="space-y-4">
      <Toggle
        label="In-person speakers"
        checked={v.hasInPersonSpeakers}
        onChange={(val) => form.setValue("hasInPersonSpeakers", val)}
      />
      {v.hasInPersonSpeakers ? (
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
                aria-label={`Remove speaker ${i + 1}`}
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
      ) : null}
    </div>
  );
}
