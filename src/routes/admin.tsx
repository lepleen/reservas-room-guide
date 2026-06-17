import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore, findConflicts, type Reservation } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin review — Roomr" },
      { name: "description", content: "Review and decide on submitted reservation requests." },
    ],
  }),
  component: () => (
    <AuthGuard roles={["admin"]}><AdminPage /></AuthGuard>
  ),
});

type Tab = "pending" | "approved" | "rejected" | "all";

function AdminPage() {
  const { reservations, decideReservation } = useStore();
  const [tab, setTab] = useState<Tab>("pending");
  const [decision, setDecision] = useState<{
    r: Reservation;
    type: "approved" | "rejected";
  } | null>(null);
  const [notes, setNotes] = useState("");

  const counts = useMemo(
    () => ({
      pending: reservations.filter((r) => r.status === "pending").length,
      approved: reservations.filter((r) => r.status === "approved").length,
      rejected: reservations.filter((r) => r.status === "rejected").length,
      all: reservations.length,
    }),
    [reservations],
  );

  const list = useMemo(
    () =>
      reservations
        .filter((r) => (tab === "all" ? true : r.status === tab))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [reservations, tab],
  );

  const submitDecision = () => {
    if (!decision) return;
    decideReservation(decision.r.id, decision.type, notes.trim() || undefined);
    toast.success(
      decision.type === "approved" ? "Request approved" : "Request rejected",
    );
    setDecision(null);
    setNotes("");
  };

  return (
    <AppShell>
      <PageHeader
        title="Review requests"
        description="Approve or reject reservation requests submitted by users."
        action={
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Admin view
          </span>
        }
      />

      <div className="inline-flex rounded-md border border-border bg-card p-1 mb-6">
        {(["pending", "approved", "rejected", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-[6px] capitalize transition-colors inline-flex items-center gap-2",
              tab === t
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            <span className="text-xs text-muted-foreground">{counts[t]}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <h3 className="text-base font-medium">Nothing here</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No requests match this filter.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const conflicts = findConflicts(reservations, {
              date: r.date,
              room: r.room,
              startTime: r.startTime,
              endTime: r.endTime,
              excludeId: r.id,
            });
            return (
            <li
              key={r.id}
              className="rounded-lg border border-border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={r.kind === "internal" ? "/internal/reservations/$id" : "/reservations/$id"}
                    params={{ id: r.id }}
                    className="font-medium hover:underline truncate"
                  >
                    {r.eventName}
                  </Link>
                  <StatusBadge status={r.status} />
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5",
                      r.kind === "internal"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {r.kind === "internal" ? "Internal" : "User"}
                  </span>
                  {conflicts.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded bg-destructive/10 text-destructive px-1.5 py-0.5">
                      <AlertTriangle className="h-3 w-3" />
                      {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {new Date(r.date + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "medium" })} ·{" "}
                  {r.startTime}–{r.endTime} · {r.room} · {r.attendees} attendees
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Requested by {r.ownerName || r.ownerEmail}
                </div>
                {conflicts.length > 0 && (
                  <p className="mt-2 text-xs text-destructive">
                    Overlaps with: {conflicts.map((c) => `${c.eventName} (${c.startTime}–${c.endTime})`).join(", ")}
                  </p>
                )}
                {r.adminNotes && (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    Note: {r.adminNotes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link
                    to={r.kind === "internal" ? "/internal/reservations/$id" : "/reservations/$id"}
                    params={{ id: r.id }}
                  >
                    View <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                {r.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDecision({ r, type: "rejected" })}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => setDecision({ r, type: "approved" })}>
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                  </>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!decision}
        onOpenChange={(open) => {
          if (!open) {
            setDecision(null);
            setNotes("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision?.type === "approved" ? "Approve request" : "Reject request"}
            </DialogTitle>
            <DialogDescription>
              {decision?.r.eventName} — {decision?.r.room}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Note for the requester (optional)
            </label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                decision?.type === "approved"
                  ? "Looks great — room is confirmed."
                  : "Reason for the rejection…"
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setDecision(null);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={submitDecision}>
              Confirm {decision?.type === "approved" ? "approval" : "rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-secondary text-foreground", Icon: Clock },
    approved: {
      label: "Approved",
      cls: "bg-primary/10 text-primary",
      Icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      cls: "bg-destructive/10 text-destructive",
      Icon: XCircle,
    },
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