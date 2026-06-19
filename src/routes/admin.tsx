import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  CircleCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";
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
import { reservationsQueryOptions, reservationsQueryKey } from "@/features/reservations/queries";
import { updateReservationStatus } from "@/features/admin/reservations.functions";
import type { ReservationDTO, ReservationStatus } from "@/features/reservations/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin review — Roomr" },
      { name: "description", content: "Review and decide on submitted reservation requests." },
    ],
  }),
  component: () => (
    <AuthGuard roles={["admin"]}>
      <AdminPage />
    </AuthGuard>
  ),
});

type Tab = "pending" | "approved" | "confirmed" | "rejected" | "cancelled" | "all";

type DecisionType = Exclude<ReservationStatus, "pending">;

function findOverlaps(rows: ReservationDTO[], r: ReservationDTO) {
  return rows.filter(
    (o) =>
      o.id !== r.id &&
      o.room === r.room &&
      o.date === r.date &&
      o.status !== "rejected" &&
      o.status !== "cancelled" &&
      o.startTime < r.endTime &&
      o.endTime > r.startTime,
  );
}

function AdminPage() {
  const { data: reservations = [], isLoading, error } = useQuery(reservationsQueryOptions());
  const queryClient = useQueryClient();
  const updateStatus = useServerFn(updateReservationStatus);

  const [tab, setTab] = useState<Tab>("pending");
  const [decision, setDecision] = useState<{ r: ReservationDTO; type: DecisionType } | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const counts = useMemo(
    () => ({
      pending: reservations.filter((r) => r.status === "pending").length,
      approved: reservations.filter((r) => r.status === "approved").length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      rejected: reservations.filter((r) => r.status === "rejected").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
      all: reservations.length,
    }),
    [reservations],
  );

  const list = useMemo(
    () =>
      reservations
        .filter((r) => (tab === "all" ? true : r.status === tab))
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [reservations, tab],
  );

  const submitDecision = async () => {
    if (!decision) return;
    setSubmitting(true);
    try {
      await updateStatus({
        data: { id: decision.r.id, status: decision.type, adminNotes: notes.trim() || undefined },
      });
      const labels: Record<DecisionType, string> = {
        approved: "Request approved",
        confirmed: "Request confirmed",
        rejected: "Request rejected",
        cancelled: "Request cancelled",
      };
      toast.success(labels[decision.type]);
      await queryClient.invalidateQueries({ queryKey: reservationsQueryKey });
      setDecision(null);
      setNotes("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Review requests"
        description="Approve, confirm, reject or cancel reservation requests."
        action={
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Admin view
          </span>
        }
      />

      <div className="inline-flex flex-wrap rounded-md border border-border bg-card p-1 mb-6">
        {(["pending", "approved", "confirmed", "rejected", "cancelled", "all"] as Tab[]).map(
          (t) => (
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
          ),
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Loading reservations…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive p-6 text-sm">
          {(error as Error).message}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <h3 className="text-base font-medium">Nothing here</h3>
          <p className="mt-1 text-sm text-muted-foreground">No requests match this filter.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const conflicts = findOverlaps(reservations, r);
            const isInternal = r.reservationType === "internal";
            return (
              <li
                key={r.id}
                className="rounded-lg border border-border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={isInternal ? "/internal/reservations/$id" : "/reservations/$id"}
                      params={{ id: r.id }}
                      className="font-medium hover:underline truncate"
                    >
                      {r.eventName}
                    </Link>
                    <StatusBadge status={r.status} />
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5",
                        isInternal
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-foreground",
                      )}
                    >
                      {isInternal ? "Internal" : "External"}
                    </span>
                    {conflicts.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded bg-destructive/10 text-destructive px-1.5 py-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(r.date + "T00:00:00").toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}{" "}
                    · {r.startTime}–{r.endTime} · {r.room} · {r.attendees} attendees
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Requested by {r.ownerName || r.ownerEmail || r.organizerName}
                  </div>
                  {conflicts.length > 0 && (
                    <p className="mt-2 text-xs text-destructive">
                      Overlaps with:{" "}
                      {conflicts
                        .map((c) => `${c.eventName} (${c.startTime}–${c.endTime})`)
                        .join(", ")}
                    </p>
                  )}
                  {r.adminNotes && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      Note: {r.adminNotes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button asChild variant="ghost" size="sm">
                    <Link
                      to={isInternal ? "/internal/reservations/$id" : "/reservations/$id"}
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
                  {r.status === "approved" && (
                    <Button size="sm" onClick={() => setDecision({ r, type: "confirmed" })}>
                      <CircleCheck className="h-4 w-4" /> Confirm
                    </Button>
                  )}
                  {r.status !== "cancelled" && r.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDecision({ r, type: "cancelled" })}
                    >
                      <Ban className="h-4 w-4" /> Cancel
                    </Button>
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
              {decision?.type === "approved" && "Approve request"}
              {decision?.type === "confirmed" && "Confirm reservation"}
              {decision?.type === "rejected" && "Reject request"}
              {decision?.type === "cancelled" && "Cancel reservation"}
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
              placeholder="Optional message…"
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
              Close
            </Button>
            <Button onClick={submitDecision} disabled={submitting}>
              {submitting ? "Saving…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
