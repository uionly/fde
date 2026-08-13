import type {
  GameMetric,
  GameMetricScores,
  RetrievalRankGame,
  RetrievalRankScenario,
} from "@/lib/content/schemas";
import {
  seededShuffle,
  stableHash,
  type GameEvaluation,
  type GameOutcome,
} from "@/lib/games/runtime";

export const retrievalRankThresholds = {
  quality: 90,
  safety: 75,
  cost: 60,
  latency: 60,
} as const satisfies GameMetricScores;

export type ResolvedRetrievalRank = {
  game: RetrievalRankGame;
  scenario: RetrievalRankScenario;
  candidates: RetrievalRankScenario["candidates"];
  runIndex: number;
  seed: number;
};

export type RetrievalRankEvaluation = GameEvaluation & {
  selectedCandidateIds: string[];
  totalTokens: number;
  estimatedLatencyMs: number;
  thresholds: GameMetricScores;
  passed: Record<GameMetric, boolean>;
  feedback: Record<GameMetric, string>;
};

const metricNames: Record<GameMetric, string> = {
  quality: "quality",
  safety: "safety",
  cost: "cost efficiency",
  latency: "latency performance",
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function discountedGain(relevance: number, rank: number) {
  return (2 ** relevance - 1) / Math.log2(rank + 2);
}

function scoreQuality(scenario: RetrievalRankScenario, selectedCandidateIds: readonly string[]) {
  const candidates = new Map(scenario.candidates.map((candidate) => [candidate.id, candidate]));
  const idealIds = new Set(scenario.idealOrder);
  const actualDcg = selectedCandidateIds.reduce((total, candidateId, rank) => {
    const candidate = candidates.get(candidateId);
    return total + discountedGain(candidate && idealIds.has(candidateId) ? candidate.relevance : 0, rank);
  }, 0);
  const idealDcg = scenario.idealOrder.reduce((total, candidateId, rank) => {
    const candidate = candidates.get(candidateId);
    return total + discountedGain(candidate?.relevance ?? 0, rank);
  }, 0);
  return idealDcg === 0 ? 0 : clampScore((actualDcg / idealDcg) * 100);
}

function scoreCost(scenario: RetrievalRankScenario, totalTokens: number) {
  if (totalTokens <= scenario.targetContextTokens) return 100;
  const overageRange = scenario.contextBudget - scenario.targetContextTokens;
  if (overageRange <= 0) return 100;
  return clampScore(((scenario.contextBudget - totalTokens) / overageRange) * 100);
}

function scoreLatency(scenario: RetrievalRankScenario, estimatedLatencyMs: number) {
  if (estimatedLatencyMs <= scenario.latency.targetMs) return 100;
  const degradationRange = scenario.latency.maxMs - scenario.latency.targetMs;
  return clampScore(((scenario.latency.maxMs - estimatedLatencyMs) / degradationRange) * 100);
}

export function resolveRetrievalRank(game: RetrievalRankGame, runIndex: number): ResolvedRetrievalRank {
  if (game.scenarios.length === 0) throw new Error(`Retrieval rank game ${game.id} requires at least one scenario`);
  const normalizedRun = Number.isFinite(runIndex) ? Math.max(0, Math.trunc(runIndex)) : 0;
  const scenario = game.scenarios[normalizedRun % game.scenarios.length];
  const seed = stableHash(`${game.id}:${scenario.id}:${normalizedRun}`);
  return {
    game,
    scenario,
    candidates: seededShuffle(scenario.candidates, seed),
    runIndex: normalizedRun,
    seed,
  };
}

export function evaluateRetrievalRank(
  run: ResolvedRetrievalRank,
  selectedCandidateIds: readonly string[],
): RetrievalRankEvaluation {
  if (selectedCandidateIds.length === 0) throw new Error("A retrieval pack must include at least one candidate");
  if (new Set(selectedCandidateIds).size !== selectedCandidateIds.length) throw new Error("A retrieval pack cannot contain duplicate candidates");

  const candidates = new Map(run.scenario.candidates.map((candidate) => [candidate.id, candidate]));
  const unknownId = selectedCandidateIds.find((candidateId) => !candidates.has(candidateId));
  if (unknownId) throw new Error(`Unknown retrieval candidate ${unknownId} for scenario ${run.scenario.id}`);

  const selected = selectedCandidateIds.map((candidateId) => candidates.get(candidateId)!);
  const totalTokens = selected.reduce((total, candidate) => total + candidate.tokens, 0);
  if (totalTokens > run.scenario.contextBudget) {
    throw new Error(`Retrieval pack uses ${totalTokens} tokens but the context budget is ${run.scenario.contextBudget}`);
  }

  const estimatedLatencyMs = Math.round(run.scenario.latency.baseMs + totalTokens * run.scenario.latency.perTokenMs);
  const metrics: GameMetricScores = {
    quality: scoreQuality(run.scenario, selectedCandidateIds),
    safety: clampScore(100 - selected.reduce((total, candidate) => total + candidate.safetyRisk, 0)),
    cost: scoreCost(run.scenario, totalTokens),
    latency: scoreLatency(run.scenario, estimatedLatencyMs),
  };
  const passed = Object.fromEntries(
    (Object.keys(retrievalRankThresholds) as GameMetric[]).map((metric) => [metric, metrics[metric] >= retrievalRankThresholds[metric]]),
  ) as Record<GameMetric, boolean>;
  const totalWeight = Object.values(run.scenario.metricWeights).reduce((total, weight) => total + weight, 0);
  const overall = Math.round(
    (Object.keys(metrics) as GameMetric[]).reduce(
      (total, metric) => total + metrics[metric] * run.scenario.metricWeights[metric],
      0,
    ) / totalWeight,
  );
  const outcome: GameOutcome = overall >= 85 ? "production-ready" : overall >= 65 ? "viable" : "needs-review";
  const failedMetrics = (Object.keys(passed) as GameMetric[]).filter((metric) => !passed[metric]);
  const recommended = failedMetrics.length === 0;

  return {
    gameId: run.game.id,
    scenarioId: run.scenario.id,
    seed: run.seed,
    selectedChoiceId: selectedCandidateIds.join("|"),
    selectedCandidateIds: [...selectedCandidateIds],
    recommended,
    overall,
    outcome,
    metrics,
    totalTokens,
    estimatedLatencyMs,
    thresholds: { ...retrievalRankThresholds },
    passed,
    feedback: {
      quality: `The ranked pack captured ${metrics.quality}% of the scenario's ideal discounted evidence gain.`,
      safety: `Selected context retained a ${metrics.safety}% safety margin after authored access, authority, and injection risks.`,
      cost: totalTokens <= run.scenario.targetContextTokens
        ? `The ${totalTokens}-token pack stayed inside the ${run.scenario.targetContextTokens}-token efficiency target.`
        : `The ${totalTokens}-token pack exceeded the ${run.scenario.targetContextTokens}-token efficiency target.`,
      latency: `The packed context is estimated at ${estimatedLatencyMs} ms against a ${run.scenario.latency.targetMs} ms target.`,
    },
    rationale: recommended
      ? "The pack clears every launch gate: useful evidence is ranked high without spending the safety, token, or latency budget."
      : `The pack misses the ${failedMetrics.map((metric) => metricNames[metric]).join(", ")} gate${failedMetrics.length === 1 ? "" : "s"}. Repair those dimensions without sacrificing the gates already cleared.`,
    debrief: run.scenario.debrief,
    principle: run.game.principle,
  };
}
