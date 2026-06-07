import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, MapPin, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/reservations/$id")({
  component: ReservationDetailPage,
});

function ReservationDetailPage() {
  const { id } = Route.useParams();
  const { getReservation } = useStore();
  const r = getReservation(id);

  if (!r) {
    return (
      <AppShell>
        <PageHeader title="Reservation not found" description="It may have been removed." />
        <Button asChild variant="outline">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <PageHeader title={r.eventName} description={`Created ${new Date(r.createdAt).toLocaleDateString()}`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Info icon={CalendarClock} label="When">
          {new Date(r.date + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "medium" })}
          <br />
          <span className="text-muted-foreground">{r.startTime} – {r.endTime}</span>
        </Info>
        <Info icon={MapPin} label="Where">
          {r.room}<br />
          <span className="text-muted-foreground capitalize">{r.setupStyle} setup</span>
        </Info>
        <Info icon={Users} label="Attendees">
          {r.attendees}<br />
          {r.registrationRequired && r.registrationUrl ? (
            <a className="text-primary hover:underline text-xs" href={r.registrationUrl} target="_blank" rel="noreferrer">
              Registration link
            </a>
          ) : (
            <span className="text-muted-foreground text-xs">Open attendance</span>
          )}
        </Info>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Audiovisual">
          <Row label="Recording" value={r.recording ? "Yes" : "No"} />
          <Row label="Live broadcast" value={r.hasLiveBroadcast ? r.broadcastPlatform || "Yes" : "No"} />
          <Row label="Microphone" value={r.microphoneType ?? "—"} />
          <Row
            label="LED color"
            value={
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: r.ledColor }}
                />
                {r.ledColor}
              </span>
            }
          />
        </Panel>

        <Panel title="Catering">
          <Row label="Required" value={r.catering ? "Yes" : "No"} />
          {r.catering && r.cateringNotes && (
            <p className="text-sm text-muted-foreground">{r.cateringNotes}</p>
          )}
        </Panel>

        <Panel title="Speakers">
          {r.speakers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No speakers listed.</p>
          ) : (
            <ul className="space-y-2">
              {r.speakers.map((s, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{s.name}</span>
                  {s.topic && <span className="text-muted-foreground"> · {s.topic}</span>}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Schedule">
          {r.schedule.length === 0 ? (
            <p className="text-sm text-muted-foreground">No schedule entries.</p>
          ) : (
            <ol className="space-y-2">
              {r.schedule.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="font-mono text-muted-foreground w-14">{s.time}</span>
                  <span>{s.action}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        {r.notes && (
          <Panel title="Notes" className="md:col-span-2">
            <p className="text-sm whitespace-pre-wrap">{r.notes}</p>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

function Info({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium leading-relaxed">{children}</div>
    </div>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}