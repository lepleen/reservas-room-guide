import { Suspense } from "react";
import type { ComponentType } from "react";

type Props = {
  stepId: string;
  Component: ComponentType;
  regionLabelledBy: string;
};

/**
 * Renders the active step inside a region with consistent min-height.
 * Uses key-based remount + a CSS fade so transitions stay encapsulated
 * inside the wizard layer (steps never animate themselves).
 * `<Suspense>` is in place so any step can be swapped for `React.lazy`
 * in the future without an API change.
 */
export function WizardStep({ stepId, Component, regionLabelledBy }: Props) {
  return (
    <section
      role="region"
      aria-labelledby={regionLabelledBy}
      className="min-h-[28rem] md:min-h-[32rem]"
    >
      <div
        key={stepId}
        className="animate-fade-in motion-reduce:animate-none"
      >
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
          <Component />
        </Suspense>
      </div>
    </section>
  );
}
