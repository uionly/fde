import { describe, expect, it } from "vitest";

import { getAllLabs } from "@/lib/content/loaders";
import { advanceLabStep, labPercent } from "@/lib/labs/progress";

describe("guided labs", () => {
  it("loads three ordered, fully guided labs", () => { const labs = getAllLabs(); expect(labs).toHaveLength(3); expect(labs.every((lab) => lab.steps.every((step) => step.hint && step.solution))).toBe(true); });
  it("advances and completes on the final step", () => { expect(advanceLabStep(1, 4)).toEqual({ nextStep: 2, completed: false }); expect(advanceLabStep(3, 4)).toEqual({ nextStep: 3, completed: true }); });
  it("calculates resumable lab progress", () => { expect(labPercent(2, 4, false)).toBe(50); expect(labPercent(2, 4, true)).toBe(100); });
});
