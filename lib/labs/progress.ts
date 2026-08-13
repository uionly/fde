export type LabState = Record<string, string>;
export type LabProgressRecord = { labId: string; currentStep: number; state: LabState; completed: boolean; updatedAt: Date };

export function advanceLabStep(currentStep: number, totalSteps: number) {
  const nextStep = Math.min(currentStep + 1, Math.max(0, totalSteps - 1));
  return { nextStep, completed: totalSteps > 0 && currentStep >= totalSteps - 1 };
}

export function labPercent(currentStep: number, totalSteps: number, completed: boolean) {
  if (!totalSteps) return 0;
  if (completed) return 100;
  return Math.round((Math.max(0, currentStep) / totalSteps) * 100);
}
