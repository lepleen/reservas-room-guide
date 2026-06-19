import { Ban, CheckCircle2, CircleCheck, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/features/reservations/types";

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const map = {
    pending: { label: "Pending", cls: "bg-secondary text-foreground", Icon: Clock },
    approved: { label: "Approved", cls: "bg-primary/10 text-primary", Icon: CheckCircle2 },
    confirmed: { label: "Confirmed", cls: "bg-emerald-500/10 text-emerald-600", Icon: CircleCheck },
    rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive", Icon: XCircle },
    cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground", Icon: Ban },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium",
        cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
