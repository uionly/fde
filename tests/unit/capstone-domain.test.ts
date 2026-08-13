import { describe, expect, it } from "vitest";

import { evaluateCapstonePhase } from "@/lib/capstone/evaluator";
import { getCapstone, getCapstonePhaseById } from "@/lib/content/loaders";
import { capstonePhaseIds, capstoneSchema } from "@/lib/content/schemas";

const reasoning =
  "I would validate this decision with frontline evidence, document the tradeoffs, and use a bounded pilot to test safety and customer impact.";

describe("capstone content and deterministic evaluation", () => {
  it("loads the complete ordered Northstar engagement", () => {
    const capstone = getCapstone();

    expect(capstone.phases.map((phase) => phase.id)).toEqual(capstonePhaseIds);
    expect(capstone.phases.map((phase) => phase.title)).toEqual([
      "Discovery",
      "Problem Definition",
      "Architecture",
      "Prototype",
      "Retrieval",
      "Tools",
      "Agent",
      "Security",
      "Evaluation",
      "Production",
      "Adoption",
      "ROI",
    ]);
    expect(capstone.phases.every((phase) => phase.controls.length === 2)).toBe(true);
    expect(
      capstone.phases.every(
        (phase) =>
          phase.consequences.length ===
          phase.controls.reduce((total, control) => total + control.options.length, 0),
      ),
    ).toBe(true);
    expect(getCapstonePhaseById("security")?.title).toBe("Security");
    expect(getCapstonePhaseById("not-a-phase")).toBeUndefined();
  });

  it("completes from required input presence without interpreting learner reasoning", () => {
    const phase = getCapstonePhaseById("discovery")!;
    const evaluation = evaluateCapstonePhase(phase, {
      selections: {
        "first-move": ["observe-workflow"],
        evidence: ["workflow-baseline", "stakeholder-map"],
      },
      reasoning,
    });

    expect(evaluation.complete).toBe(true);
    expect(evaluation.missing).toEqual([]);
    expect(evaluation.score).toBeGreaterThan(85);
    expect(Object.values(evaluation.dimensions).every((score) => score >= 0 && score <= 100)).toBe(true);
    expect(evaluation.strengths).toHaveLength(3);
  });

  it("reports missing controls and reasoning without making AI completion authoritative", () => {
    const phase = getCapstonePhaseById("architecture")!;
    const evaluation = evaluateCapstonePhase(phase, {
      selections: { "integration-boundary": ["server-adapters"] },
      reasoning: "Too short",
    });

    expect(evaluation.complete).toBe(false);
    expect(evaluation.score).toBeLessThan(50);
    expect(evaluation.missing).toEqual(
      expect.arrayContaining([
        expect.stringContaining("source contracts"),
        expect.stringContaining("reasoning"),
      ]),
    );
  });

  it("scores authored consequences deterministically and preserves tradeoffs as gaps", () => {
    const phase = getCapstonePhaseById("agent")!;
    const answer = {
      selections: {
        orchestration: ["fixed-script"],
        "agent-boundaries": ["bounded-steps", "post-action-review"],
      },
      reasoning,
    };

    const first = evaluateCapstonePhase(phase, answer);
    const second = evaluateCapstonePhase(phase, answer);

    expect(first).toEqual(second);
    expect(first.feedback).toHaveLength(3);
    expect(first.strengths).toHaveLength(1);
    expect(first.gaps).toHaveLength(2);
    expect(first.gaps).toEqual(expect.arrayContaining([expect.stringContaining("fixed script")]));
  });

  it("rejects unknown controls and option ids", () => {
    const phase = getCapstonePhaseById("security")!;

    expect(() =>
      evaluateCapstonePhase(phase, { selections: { unknown: ["value"] }, reasoning }),
    ).toThrow(/Unknown control/);
    expect(() =>
      evaluateCapstonePhase(phase, {
        selections: { "trust-model": ["unknown-option"] },
        reasoning,
      }),
    ).toThrow(/Unknown option/);
  });

  it("rejects incomplete consequence coverage in authored content", () => {
    const capstone = getCapstone();
    const malformed = structuredClone(capstone);
    malformed.phases[0].consequences.pop();

    expect(() => capstoneSchema.parse(malformed)).toThrow(/cover every control option/);
  });
});
