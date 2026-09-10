import { describe, expect, it } from "vitest";
import { getAllLabs } from "@/lib/content";
import { labStepSchema } from "@/lib/content/schemas";
import { validateLab, validateLabStep } from "@/lib/labs/validation";
const notes = "I will document the customer decision, confirm the owner and access boundary, then verify the positive and negative cases before accepting the deliverable.";
describe("lab acceptance evidence", () => {
  it("requires authored checks on every deliverable and rejects empty or incorrect work", () => {
    for (const lab of getAllLabs()) {
      expect(validateLab(lab, {})).toBe(false);
      const state: Record<string, string> = {};
      for (const step of lab.steps) {
        if (step.type === "content") continue;
        expect(step.validation).toBeDefined();
        state[step.id] = notes;
        expect(validateLabStep(step, state).valid).toBe(false);
        state[`${step.id}:check`] = step.validation!.check.correct;
        expect(validateLabStep(step, state).valid).toBe(true);
      }
      expect(validateLab(lab, state)).toBe(true);
      const first = lab.steps.find((step) => step.validation)!;
      state[`${first.id}:check`] = "unknown";
      expect(validateLab(lab, state)).toBe(false);
    }
  });
  it("does not accept legacy notes or an unvalidated deliverable schema", () => {
    expect(labStepSchema.safeParse({ id: "test", title: "Test step", type: "code" }).success).toBe(false);
    expect(validateLab(getAllLabs()[0], { completed: "true", notes })).toBe(false);
  });
});
