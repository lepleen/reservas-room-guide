import { createContext, useContext } from "react";
import type { WizardContextValue } from "./types";

export const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within <Wizard>");
  }
  return ctx;
}
