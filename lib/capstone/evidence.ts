import type { CapstoneEvaluationDefinition } from "@/lib/capstone/evaluator";
import { getVerifiedCapstoneEvaluation } from "@/lib/capstone/verification";
import type { Skill } from "@/lib/content/schemas";
import type { SkillEvidence } from "@/lib/skills/scoring";

import type { CapstoneProgress } from "@/lib/capstone/progress";

export type CapstonePhaseSkillSummary = {
  id: string;
  title: string;
  skills: Skill[];
} & CapstoneEvaluationDefinition;

/**
 * Creates one skill-evidence item per completed phase. AI coaching is
 * intentionally excluded: only the authored, deterministic evaluation counts.
 */
export function getCompletedCapstoneEvidence(
  progress: CapstoneProgress,
  phases: CapstonePhaseSkillSummary[],
): SkillEvidence[] {
  return phases.flatMap((phase) => {
    const savedPhase = progress.phases[phase.id];
    const evaluation = getVerifiedCapstoneEvaluation(phase, savedPhase);
    if (!evaluation) return [];
    return [{
      source: "capstone" as const,
      skills: phase.skills,
      score: evaluation.score,
    }];
  });
}
