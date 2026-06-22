import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  headingId: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  stepLabel: string;
};

export const WizardHeader = forwardRef<HTMLHeadingElement, Props>(
  function WizardHeader({ headingId, title, description, icon: Icon, stepLabel }, ref) {
    return (
      <div className="space-y-1" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {stepLabel}
        </p>
        <h2
          ref={ref}
          id={headingId}
          tabIndex={-1}
          className="flex items-center gap-2 text-xl font-semibold outline-none"
        >
          {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    );
  },
);
