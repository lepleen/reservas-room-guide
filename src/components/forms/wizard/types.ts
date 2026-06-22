import type { ComponentType, ReactNode } from "react";
import type {
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import type { LucideIcon } from "lucide-react";

/**
 * A wizard step definition.
 *
 * The wizard package is domain-agnostic; callers describe their own steps
 * via this shape. Today the wizard reads `id`, `title`, `description`,
 * `icon`, `component`, and `validationFields`. The other properties are
 * wired through but unused — present so future workflows can opt in
 * without an API change.
 */
export type WizardStepDef<TValues extends FieldValues = FieldValues> = {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Presentational component. Reads form state via `useFormContext`. */
  component: ComponentType;
  /** Field paths validated by `form.trigger` before advancing. */
  validationFields: FieldPath<TValues>[];
  /** Marks the step as optional in the UI. Not enforced today. */
  isOptional?: boolean;
  /** Async gate: return `false` to block advance. */
  beforeNext?: (form: UseFormReturn<TValues>) => boolean | Promise<boolean>;
  /** Side-effect hook when the user enters this step. */
  beforeEnter?: (form: UseFormReturn<TValues>) => void | Promise<void>;
};

export type WizardContextValue = {
  currentIndex: number;
  total: number;
  currentStep: WizardStepDef;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  maxVisitedIndex: number;
  isTransitioning: boolean;
};

export type WizardProps<TValues extends FieldValues = FieldValues> = {
  steps: WizardStepDef<TValues>[];
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  /** Reserved render slot above the navigation bar. Not used today. */
  errorSummarySlot?: ReactNode;
};
