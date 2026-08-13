import { evaluateCapstonePhase, type CapstoneEvaluationDefinition } from "@/lib/capstone/evaluator";
import type { CapstonePhaseProgress } from "@/lib/capstone/progress";
import type { CapstoneEvaluation } from "@/lib/content/schemas";

/**
 * Re-evaluates saved browser input against the current authored rules.
 * Persisted score snapshots are display caches, never an authority boundary.
 */
export function getVerifiedCapstoneEvaluation(
  phase: CapstoneEvaluationDefinition,
  saved: CapstonePhaseProgress | null | undefined,
): CapstoneEvaluation | null {
  if (!saved?.completed) return null;

  try {
    const evaluation = evaluateCapstonePhase(phase, {
      reasoning: saved.reasoning,
      selections: saved.selections,
    });
    return evaluation.complete ? evaluation : null;
  } catch {
    return null;
  }
}
