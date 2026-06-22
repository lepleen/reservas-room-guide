import { Button } from "@/components/ui/button";
import { useWizard } from "./wizard-context";

type Props = {
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  submitDisabled?: boolean;
  submitLabel?: string;
};

export function WizardNavigation({
  onCancel,
  onSubmit,
  submitDisabled,
  submitLabel = "Submit",
}: Props) {
  const { goNext, goPrev, isFirst, isLast, isTransitioning } = useWizard();

  return (
    <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-border">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isTransitioning}
      >
        Cancel
      </Button>

      <div className="flex gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={isFirst || isTransitioning}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            type="button"
            onClick={() => onSubmit()}
            disabled={submitDisabled || isTransitioning}
            aria-busy={isTransitioning || undefined}
          >
            {isTransitioning ? "Submitting…" : submitLabel}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goNext}
            disabled={isTransitioning}
            aria-busy={isTransitioning || undefined}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
