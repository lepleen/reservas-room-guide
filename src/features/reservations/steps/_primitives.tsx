import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  // Inside the wizard, the step heading is rendered by WizardHeader.
  // Section is now just a layout container providing consistent spacing.
  return (
    <section className="space-y-4">
      {title || description ? (
        <div>
          {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm flex gap-2">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
