import { useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RequestAvailabilityDialog, type AvailabilityRequestPayload } from "@/components/RequestAvailabilityDialog";
import type { AvailabilityResult } from "@/features/shared/availability.functions";

type Props = {
  query: { data: AvailabilityResult | undefined; isFetching: boolean; isError: boolean; error: unknown };
  enabled: boolean;
  payload: AvailabilityRequestPayload | null;
};

export function AvailabilityStatus({ query, enabled, payload }: Props) {
  const [open, setOpen] = useState(false);
  if (!enabled) return null;

  if (query.isFetching) {
    return (
      <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
        <Loader2 className="h-3 w-3 animate-spin" /> Checking availability…
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="text-xs text-destructive">
        Could not verify availability. Please try again.
      </p>
    );
  }

  const data = query.data;
  if (!data) return null;

  if (data.available) {
    return (
      <p className="text-xs text-primary inline-flex items-center gap-1.5">
        <CheckCircle2 className="h-3 w-3" /> Time slot available.
      </p>
    );
  }

  const c = data.conflicts[0];
  return (
    <>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-2">
          <span>
            This time conflicts with <b>{c.eventName}</b> ({c.startTime}–{c.endTime}, {c.status}).
          </span>
          <div>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              Request availability
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      <RequestAvailabilityDialog
        open={open}
        onOpenChange={setOpen}
        payload={
          payload && {
            ...payload,
            conflictNote: `Conflicts with "${c.eventName}" (${c.startTime}–${c.endTime}).`,
          }
        }
      />
    </>
  );
}
