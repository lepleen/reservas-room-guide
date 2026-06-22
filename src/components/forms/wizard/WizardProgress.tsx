import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useWizard } from "./wizard-context";
import type { WizardStepDef } from "./types";

type Props = {
  steps: WizardStepDef[];
};

export function WizardProgress({ steps }: Props) {
  const { currentIndex, total, maxVisitedIndex, goTo, isTransitioning } = useWizard();
  const percent = ((currentIndex + 1) / total) * 100;

  return (
    <>
      {/* Mobile: compact summary + progress bar */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentIndex + 1} of {total}
          </span>
          <span className="text-muted-foreground truncate ml-2">
            {steps[currentIndex]?.title}
          </span>
        </div>
        <Progress value={percent} aria-label={`Wizard progress: step ${currentIndex + 1} of ${total}`} />
      </div>

      {/* Desktop: numbered titles */}
      <nav aria-label="Wizard steps" className="hidden md:block">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {steps.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            const isReachable = idx <= maxVisitedIndex;
            const state = isActive
              ? "current"
              : isCompleted
                ? "completed"
                : isReachable
                  ? "available"
                  : "upcoming";

            return (
              <li key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isReachable && !isActive && goTo(idx)}
                  disabled={!isReachable || isActive || isTransitioning}
                  aria-current={isActive ? "step" : undefined}
                  aria-disabled={!isReachable || undefined}
                  aria-label={`Step ${idx + 1}: ${step.title}, ${state}`}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "text-foreground font-medium",
                    !isActive && isReachable && "text-muted-foreground hover:text-foreground cursor-pointer",
                    !isReachable && "text-muted-foreground/60 cursor-not-allowed",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "border-border bg-background",
                    )}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </span>
                  <span className="hidden lg:inline">{step.title}</span>
                </button>
                {idx < steps.length - 1 ? (
                  <span aria-hidden="true" className="mx-1 h-px w-4 bg-border" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
