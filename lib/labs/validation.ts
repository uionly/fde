import type { Lab } from "@/lib/content/schemas";
import type { LabState } from "@/lib/labs/progress";

export function validateLabStep(step: Lab["steps"][number], state: LabState) {
  if (step.type === "content") return { valid: true, feedback: [] as string[] };
  const validation = step.validation;
  if (!validation) return { valid: false, feedback: ["This deliverable has no authored validation."] };
  const feedback: string[] = [];
  if ((state[step.id] ?? "").trim().length < validation.minCharacters) {
    feedback.push(`Write at least ${validation.minCharacters} characters explaining your deliverable against the acceptance criteria.`);
  }
  const selection = state[`${step.id}:check`];
  if (selection !== validation.check.correct) {
    const choice = validation.check.choices.find((item) => item.id === selection);
    feedback.push(choice?.rationale ?? "Answer the acceptance check before continuing.");
  }
  return { valid: feedback.length === 0, feedback };
}

/** Re-evaluate authored checks; legacy completion flags and prose length alone are not evidence. */
export function validateLab(lab: Pick<Lab, "steps">, state: LabState) {
  return lab.steps.every((step) => validateLabStep(step, state).valid);
}
