import {
  capstoneAnswerSchema,
  capstoneDimensions,
  capstoneEvaluationSchema,
  type CapstoneAnswer,
  type CapstoneDimension,
  type CapstoneEvaluation,
  type CapstonePhase,
} from "@/lib/content/schemas";

export type CapstoneEvaluationDefinition = Pick<
  CapstonePhase,
  "id" | "minReasoningCharacters" | "controls" | "consequences" | "dimensionWeights"
>;

export const capstoneDimensionLabels: Record<CapstoneDimension, string> = {
  customerAlignment: "Customer alignment",
  architecture: "Architecture",
  safety: "Safety",
  deliveryReadiness: "Delivery readiness",
};

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * Scores only authored structured decisions. Learner reasoning is required for
 * completion, but is deliberately not interpreted or graded in deterministic mode.
 */
export function evaluateCapstonePhase(
  phase: CapstoneEvaluationDefinition,
  rawAnswer: CapstoneAnswer,
): CapstoneEvaluation {
  const answer = capstoneAnswerSchema.parse(rawAnswer);
  const controlsById = new Map(phase.controls.map((control) => [control.id, control]));

  for (const [controlId, rawSelections] of Object.entries(answer.selections)) {
    const control = controlsById.get(controlId);
    if (!control) throw new Error(`Unknown control ${controlId} for capstone phase ${phase.id}`);
    const optionIds = new Set(control.options.map((option) => option.id));
    for (const optionId of rawSelections) {
      if (!optionIds.has(optionId)) {
        throw new Error(`Unknown option ${optionId} for capstone control ${controlId}`);
      }
    }
  }

  const normalizedSelections = new Map(
    phase.controls.map((control) => [control.id, [...new Set(answer.selections[control.id] ?? [])]]),
  );
  const missing: string[] = [];

  for (const control of phase.controls) {
    const count = normalizedSelections.get(control.id)!.length;
    if (count < control.minSelections) {
      missing.push(
        `Select ${control.minSelections - count} more option${control.minSelections - count === 1 ? "" : "s"} for “${control.prompt}”`,
      );
    } else if (count > control.maxSelections) {
      missing.push(`Select no more than ${control.maxSelections} options for “${control.prompt}”`);
    }
  }

  const reasoningLength = answer.reasoning.trim().length;
  if (reasoningLength < phase.minReasoningCharacters) {
    missing.push(
      `Add ${phase.minReasoningCharacters - reasoningLength} more character${phase.minReasoningCharacters - reasoningLength === 1 ? "" : "s"} to your reasoning`,
    );
  }

  const selectedConsequences = phase.controls.flatMap((control) => {
    const selected = normalizedSelections.get(control.id)!;
    return selected.map((optionId) =>
      phase.consequences.find(
        (consequence) => consequence.controlId === control.id && consequence.optionId === optionId,
      )!,
    );
  });

  const dimensions = Object.fromEntries(
    capstoneDimensions.map((dimension) => {
      const controlScores = phase.controls.flatMap((control) => {
        const selected = selectedConsequences.filter((consequence) => consequence.controlId === control.id);
        return selected.length > 0
          ? [average(selected.map((consequence) => consequence.dimensions[dimension]))]
          : [0];
      });
      return [dimension, Math.round(average(controlScores))];
    }),
  ) as CapstoneEvaluation["dimensions"];

  const score = Math.round(
    capstoneDimensions.reduce(
      (total, dimension) => total + dimensions[dimension] * phase.dimensionWeights[dimension],
      0,
    ),
  );

  return capstoneEvaluationSchema.parse({
    complete: missing.length === 0,
    missing,
    score,
    dimensions,
    feedback: selectedConsequences.map((consequence) => consequence.message),
    strengths: selectedConsequences
      .filter((consequence) => consequence.kind === "strength")
      .map((consequence) => consequence.message),
    gaps: selectedConsequences
      .filter((consequence) => consequence.kind !== "strength")
      .map((consequence) => consequence.message),
  });
}
