import { useEffect, useState } from "react";
import { z } from "zod";
import { Bell } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import type {
  AvailabilityRequest,
  AvailabilityRequestDraft,
} from "@/features/shared/availability-request";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Everything the form knows about the requested slot. The modal adds `email`. */
  draft: AvailabilityRequestDraft | null;
  /** Called with the complete request once the user submits a valid email. */
  onNotifyRequested: (request: AvailabilityRequest) => void;
};

const emailSchema = z.string().trim().email("Please enter a valid email address");

export function RequestAvailabilityDialog({ open, onOpenChange, draft, onNotifyRequested }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset the field whenever the dialog opens for a fresh draft.
  useEffect(() => {
    if (open) {
      setEmail("");
      setError(null);
    }
  }, [open, draft?.reservationDate, draft?.startTime, draft?.endTime, draft?.roomId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    const request: AvailabilityRequest = { ...draft, email: parsed.data };
    onNotifyRequested(request);
    toast.success("We'll notify you if this slot becomes available.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Room Currently Unavailable</DialogTitle>
            <DialogDescription>
              The selected room is already reserved for this date and time. If you would
              like to be notified when this reservation becomes available, please leave
              your email.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <div><b>{draft.roomName}</b></div>
              <div>
                {draft.reservationDate} · {draft.startTime}–{draft.endTime}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="notify-email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email *
            </Label>
            <Input
              id="notify-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!draft}>
              <Bell className="mr-2 h-4 w-4" />
              Notify Me
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
