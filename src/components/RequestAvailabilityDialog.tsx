import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export type AvailabilityRequestPayload = {
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  conflictNote?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: AvailabilityRequestPayload | null;
};

// Future enhancements (waitlist, notification queue, etc.) replace only the
// `onRequest` handler — the rest of the dialog stays unchanged.
function buildMailto(payload: AvailabilityRequestPayload): string | null {
  const to = import.meta.env.VITE_AVAILABILITY_REQUEST_EMAIL as string | undefined;
  if (!to) return null;

  const subject = "Reservation Availability Request";
  const body = [
    "Hello,",
    "",
    `I would like to be notified if the reservation scheduled for ${payload.date} (${payload.startTime}–${payload.endTime}) in ${payload.room} becomes available due to cancellation.`,
    "",
    "My information:",
    "",
    "Name:",
    "Company / Department:",
    "Phone:",
    "Email:",
    "",
    "Thank you.",
  ].join("\n");

  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function RequestAvailabilityDialog({ open, onOpenChange, payload }: Props) {
  const href = payload ? buildMailto(payload) : null;
  const envConfigured = Boolean(import.meta.env.VITE_AVAILABILITY_REQUEST_EMAIL);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This time slot is unavailable</DialogTitle>
          <DialogDescription>
            {payload ? (
              <>
                An event is already scheduled in <b>{payload.room}</b> on{" "}
                <b>{payload.date}</b> between <b>{payload.startTime}</b> and{" "}
                <b>{payload.endTime}</b>.
                {payload.conflictNote && (
                  <span className="block mt-2 text-xs">{payload.conflictNote}</span>
                )}
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You can request to be notified if the existing reservation is cancelled. This opens
          your email client with a pre-filled message.
        </p>
        {!envConfigured && (
          <p className="text-xs text-destructive">
            Availability request email is not configured. Please contact an administrator.
          </p>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          <Button
            asChild={Boolean(href)}
            disabled={!href}
            onClick={() => href && onOpenChange(false)}
          >
            {href ? (
              <a href={href}>
                <Mail className="mr-2 h-4 w-4" />
                Request availability
              </a>
            ) : (
              <span>
                <Mail className="mr-2 h-4 w-4" />
                Request availability
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
