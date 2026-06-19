import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AvailabilityResult } from "@/features/shared/availability.functions";

// Presentation-only: green/red badge + spinner. The conflict modal is owned
// by the form so it can carry the captured AvailabilityRequest in its own
// state (ready for the upcoming Waiting List feature).
type Props = {
  query: {
    data: AvailabilityResult | undefined;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
  };
  enabled: boolean;
};

export function AvailabilityStatus({ query, enabled }: Props) {
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        <CheckCircle2 className="h-3 w-3" /> Available
      </span>
    );
  }

  const c = data.conflicts[0];
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive mr-2">
          Unavailable
        </span>
        Conflicts with <b>{c.eventName}</b> ({c.startTime}–{c.endTime}, {c.status}).
      </AlertDescription>
    </Alert>
  );
}
