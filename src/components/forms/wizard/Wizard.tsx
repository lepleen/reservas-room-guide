import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import type { FieldPath, FieldValues } from "react-hook-form";

import { WizardContext } from "./wizard-context";
import { WizardHeader } from "./WizardHeader";
import { WizardProgress } from "./WizardProgress";
import { WizardStep } from "./WizardStep";
import { WizardNavigation } from "./WizardNavigation";
import type { WizardProps, WizardStepDef, WizardContextValue } from "./types";

/**
 * Domain-agnostic multi-step wizard.
 *
 * Renders inside the caller's <FormProvider>. Owns navigation,
 * focus management, layout stability, and transition state.
 * Business logic, mutations, dialogs, and navigation are the
 * caller's responsibility.
 */
export function Wizard<TValues extends FieldValues = FieldValues>({
  steps,
  onSubmit,
  onCancel,
  submitDisabled,
  submitLabel,
  errorSummarySlot,
}: WizardProps<TValues>) {
  const form = useFormContext<TValues>();
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxVisitedIndex, setMaxVisitedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const total = steps.length;
  const currentStep = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const advanceTo = useCallback(
    (nextIndex: number) => {
      setCurrentIndex(nextIndex);
      setMaxVisitedIndex((prev) => Math.max(prev, nextIndex));
      // Scroll wizard container into view (top), not the whole page.
      requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
        // Move focus to the new heading for SR users.
        headingRef.current?.focus();
      });
    },
    [],
  );

  const runValidationAndAdvance = useCallback(
    async (nextIndex: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      try {
        const fields = currentStep.validationFields as FieldPath<TValues>[];
        const ok = fields.length === 0 ? true : await form.trigger(fields);
        if (!ok) {
          // Focus first invalid field.
          const errors = form.formState.errors as Record<string, unknown>;
          const firstInvalid = fields.find((f) => {
            // Walk dot-paths if present.
            const segs = String(f).split(".");
            let cur: unknown = errors;
            for (const s of segs) {
              if (!cur || typeof cur !== "object") return false;
              cur = (cur as Record<string, unknown>)[s];
            }
            return Boolean(cur);
          });
          if (firstInvalid) {
            try {
              form.setFocus(firstInvalid);
            } catch {
              /* no-op */
            }
          }
          return;
        }
        if (currentStep.beforeNext) {
          const proceed = await currentStep.beforeNext(form);
          if (proceed === false) return;
        }
        advanceTo(nextIndex);
      } finally {
        setIsTransitioning(false);
      }
    },
    [currentStep, form, isTransitioning, advanceTo],
  );

  const goNext = useCallback(() => {
    if (isLast) return;
    void runValidationAndAdvance(currentIndex + 1);
  }, [currentIndex, isLast, runValidationAndAdvance]);

  const goPrev = useCallback(() => {
    if (isFirst || isTransitioning) return;
    advanceTo(currentIndex - 1);
  }, [currentIndex, isFirst, isTransitioning, advanceTo]);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      if (index < 0 || index >= total) return;
      // Only allow jumping to already-visited steps.
      if (index > maxVisitedIndex) return;
      // Allow free backwards navigation; forward jumps within visited range
      // still run validation on the current step.
      if (index > currentIndex) {
        void runValidationAndAdvance(index);
        return;
      }
      advanceTo(index);
    },
    [
      isTransitioning,
      total,
      maxVisitedIndex,
      currentIndex,
      runValidationAndAdvance,
      advanceTo,
    ],
  );

  // Fire `beforeEnter` when the active step changes.
  useEffect(() => {
    if (currentStep.beforeEnter) {
      void currentStep.beforeEnter(form);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep.id]);

  const handleSubmitClick = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      const fields = currentStep.validationFields as FieldPath<TValues>[];
      const ok = fields.length === 0 ? true : await form.trigger(fields);
      if (!ok) {
        const errors = form.formState.errors as Record<string, unknown>;
        const firstInvalid = fields.find((f) => Boolean(errors[String(f)]));
        if (firstInvalid) {
          try {
            form.setFocus(firstInvalid);
          } catch {
            /* no-op */
          }
        }
        return;
      }
      await onSubmit();
    } finally {
      setIsTransitioning(false);
    }
  }, [currentStep, form, isTransitioning, onSubmit]);

  const ctx = useMemo<WizardContextValue>(
    () => ({
      currentIndex,
      total,
      currentStep: currentStep as WizardStepDef,
      goNext,
      goPrev,
      goTo,
      isFirst,
      isLast,
      maxVisitedIndex,
      isTransitioning,
    }),
    [
      currentIndex,
      total,
      currentStep,
      goNext,
      goPrev,
      goTo,
      isFirst,
      isLast,
      maxVisitedIndex,
      isTransitioning,
    ],
  );

  // Suppress Enter-submit/advance inside the wizard except within textareas
  // and explicit type="submit" buttons.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (target.tagName === "BUTTON" && (target as HTMLButtonElement).type === "submit") return;
    // Block default form submission and step advance.
    e.preventDefault();
  };

  return (
    <WizardContext.Provider value={ctx}>
      <div
        ref={containerRef}
        className="max-w-3xl mx-auto space-y-6"
        onKeyDown={handleKeyDown}
      >
        <WizardProgress steps={steps as WizardStepDef[]} />

        <WizardHeader
          ref={headingRef}
          headingId={headingId}
          title={currentStep.title}
          description={currentStep.description}
          icon={currentStep.icon}
          stepLabel={`Step ${currentIndex + 1} of ${total}${currentStep.isOptional ? " · Optional" : ""}`}
        />

        <WizardStep
          stepId={currentStep.id}
          Component={currentStep.component}
          regionLabelledBy={headingId}
        />

        {errorSummarySlot}

        <WizardNavigation
          onCancel={onCancel}
          onSubmit={handleSubmitClick}
          submitDisabled={submitDisabled}
          submitLabel={submitLabel}
        />
      </div>
    </WizardContext.Provider>
  );
}
