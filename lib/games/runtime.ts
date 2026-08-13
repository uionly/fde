import type { FieldGame, GameMetric, GameMetricScores, QuickDecisionScenario } from "@/lib/content/schemas";

export type GameOutcome = "needs-review" | "viable" | "production-ready";

export type ResolvedQuickDecision = {
  game: FieldGame;
  scenario: QuickDecisionScenario;
  choices: QuickDecisionScenario["choices"];
  runIndex: number;
  seed: number;
};

export type GameEvaluation = {
  gameId: string;
  scenarioId: string;
  seed: number;
  selectedChoiceId: string;
  recommended: boolean;
  overall: number;
  outcome: GameOutcome;
  metrics: GameMetricScores;
  rationale: string;
  debrief: string;
  principle: string;
};

export const gameMetricLabels: Record<GameMetric, string> = {
  quality: "Quality",
  safety: "Safety",
  cost: "Cost efficiency",
  latency: "Latency performance",
};

export function stableHash(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const shuffled = [...items];
  const random = seededRandom(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function resolveQuickDecision(game: FieldGame, runIndex: number): ResolvedQuickDecision {
  const normalizedRun = Math.max(0, Math.trunc(runIndex));
  const scenario = game.scenarios[normalizedRun % game.scenarios.length];
  const seed = stableHash(`${game.id}:${scenario.id}:${normalizedRun}`);
  return { game, scenario, choices: seededShuffle(scenario.choices, seed), runIndex: normalizedRun, seed };
}

export function evaluateQuickDecision(run: ResolvedQuickDecision, selectedChoiceId: string): GameEvaluation {
  const choice = run.scenario.choices.find((candidate) => candidate.id === selectedChoiceId);
  if (!choice) throw new Error(`Unknown choice ${selectedChoiceId} for scenario ${run.scenario.id}`);

  const weightedTotal = (Object.keys(choice.metrics) as GameMetric[]).reduce(
    (total, metric) => total + choice.metrics[metric] * run.scenario.metricWeights[metric],
    0,
  );
  const totalWeight = Object.values(run.scenario.metricWeights).reduce((total, weight) => total + weight, 0);
  const overall = Math.round(weightedTotal / totalWeight);
  const outcome: GameOutcome = overall >= 85 ? "production-ready" : overall >= 65 ? "viable" : "needs-review";

  return {
    gameId: run.game.id,
    scenarioId: run.scenario.id,
    seed: run.seed,
    selectedChoiceId,
    recommended: choice.recommended,
    overall,
    outcome,
    metrics: { ...choice.metrics },
    rationale: choice.rationale,
    debrief: run.scenario.debrief,
    principle: run.game.principle,
  };
}

export function selectDailyGame(games: readonly FieldGame[], dateKey: string, completedGameIds: readonly string[] = []) {
  if (games.length === 0) return undefined;
  const incomplete = games.filter((game) => !completedGameIds.includes(game.id));
  const candidates = incomplete.length > 0 ? incomplete : [...games];
  return candidates[stableHash(dateKey) % candidates.length];
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
