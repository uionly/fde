import type { GameMetric, GameMetricScores, ModelRouterGame, ModelRouterScenario } from "@/lib/content/schemas";
import { seededShuffle, stableHash, type GameEvaluation, type GameOutcome } from "@/lib/games/runtime";

export type ModelRouterLane = ModelRouterScenario["lanes"][number];
export type ModelRouterRoute = ModelRouterScenario["requests"][number]["routes"][number];
export type ModelRouterRequest = ModelRouterScenario["requests"][number];

export type ModelRouterAssignments = Record<string, string>;

export type ResolvedModelRouter = {
  game: ModelRouterGame;
  scenario: ModelRouterScenario;
  requests: ModelRouterRequest[];
  runIndex: number;
  seed: number;
};

export type ModelRouterRequestResult = {
  requestId: string;
  requestTitle: string;
  assignedLaneId: string;
  assignedLaneLabel: string;
  recommendedLaneId: string;
  recommendedLaneLabel: string;
  recommended: boolean;
  rationale: string;
};

export type ModelRouterEvaluation = GameEvaluation & {
  assignments: ModelRouterAssignments;
  requestResults: ModelRouterRequestResult[];
};

const metricNames: GameMetric[] = ["quality", "safety", "cost", "latency"];

function normalizeRunIndex(runIndex: number) {
  return Number.isFinite(runIndex) ? Math.max(0, Math.trunc(runIndex)) : 0;
}

function assertScenarioIntegrity(scenario: ModelRouterScenario) {
  if (scenario.lanes.length < 2) throw new Error(`Model router scenario ${scenario.id} requires at least two lanes`);
  if (scenario.requests.length < 2) throw new Error(`Model router scenario ${scenario.id} requires at least two requests`);

  const laneIds = scenario.lanes.map((lane) => lane.id);
  if (new Set(laneIds).size !== laneIds.length) throw new Error(`Model router scenario ${scenario.id} has duplicate lane ids`);
  const knownLanes = new Set(laneIds);

  for (const request of scenario.requests) {
    if (request.routes.length !== laneIds.length || new Set(request.routes.map((route) => route.laneId)).size !== laneIds.length) {
      throw new Error(`Request ${request.id} must define one route for every lane`);
    }
    if (request.routes.some((route) => !knownLanes.has(route.laneId))) throw new Error(`Request ${request.id} references an unknown lane`);
    if (request.routes.filter((route) => route.recommended).length !== 1) throw new Error(`Request ${request.id} must have exactly one recommended route`);
  }
}

export function resolveModelRouter(game: ModelRouterGame, runIndex: number): ResolvedModelRouter {
  if (game.scenarios.length === 0) throw new Error(`Model router game ${game.id} requires at least one scenario`);
  const normalizedRun = normalizeRunIndex(runIndex);
  const scenario = game.scenarios[normalizedRun % game.scenarios.length];
  assertScenarioIntegrity(scenario);
  const seed = stableHash(`${game.id}:${scenario.id}:${normalizedRun}:router`);
  return {
    game,
    scenario,
    requests: seededShuffle(scenario.requests, seed),
    runIndex: normalizedRun,
    seed,
  };
}

function outcomeFor(overall: number): GameOutcome {
  if (overall >= 85) return "production-ready";
  if (overall >= 65) return "viable";
  return "needs-review";
}

export function evaluateModelRouter(run: ResolvedModelRouter, assignments: ModelRouterAssignments): ModelRouterEvaluation {
  const selectedRoutes = run.scenario.requests.map((request) => {
    const laneId = assignments[request.id];
    if (!laneId) throw new Error(`Request ${request.id} has not been assigned`);
    const route = request.routes.find((candidate) => candidate.laneId === laneId);
    if (!route) throw new Error(`Request ${request.id} cannot be assigned to lane ${laneId}`);
    return { request, route };
  });

  const totalVolume = selectedRoutes.reduce((total, selection) => total + selection.request.volume, 0);
  const metrics = Object.fromEntries(
    metricNames.map((metric) => [
      metric,
      Math.round(selectedRoutes.reduce((total, selection) => total + selection.route.metrics[metric] * selection.request.volume, 0) / totalVolume),
    ]),
  ) as GameMetricScores;
  const totalWeight = metricNames.reduce((total, metric) => total + run.scenario.metricWeights[metric], 0);
  if (totalWeight <= 0) throw new Error(`Model router scenario ${run.scenario.id} requires a positive metric weight`);
  const weightedTotal = metricNames.reduce(
    (total, metric) => total + metrics[metric] * run.scenario.metricWeights[metric],
    0,
  );
  const overall = Math.round(weightedTotal / totalWeight);
  const recommendedCount = selectedRoutes.filter((selection) => selection.route.recommended).length;
  const recommended = recommendedCount === selectedRoutes.length;
  const laneById = new Map(run.scenario.lanes.map((lane) => [lane.id, lane]));
  const requestResults = selectedRoutes.map(({ request, route }) => {
    const recommendedRoute = request.routes.find((candidate) => candidate.recommended)!;
    return {
      requestId: request.id,
      requestTitle: request.title,
      assignedLaneId: route.laneId,
      assignedLaneLabel: laneById.get(route.laneId)!.label,
      recommendedLaneId: recommendedRoute.laneId,
      recommendedLaneLabel: laneById.get(recommendedRoute.laneId)!.label,
      recommended: route.recommended,
      rationale: route.rationale,
    };
  });
  const selectedChoiceId = [...selectedRoutes]
    .sort((left, right) => left.request.id.localeCompare(right.request.id))
    .map(({ request, route }) => `${request.id}:${route.laneId}`)
    .join("|");

  return {
    gameId: run.game.id,
    scenarioId: run.scenario.id,
    seed: run.seed,
    selectedChoiceId,
    recommended,
    overall,
    outcome: outcomeFor(overall),
    metrics,
    rationale: recommended
      ? `All ${selectedRoutes.length} requests reached the right capability and control lane.`
      : `${recommendedCount} of ${selectedRoutes.length} requests reached the recommended lane. Inspect the misses before launch.`,
    debrief: run.scenario.debrief,
    principle: run.game.principle,
    assignments: Object.fromEntries(selectedRoutes.map(({ request, route }) => [request.id, route.laneId])),
    requestResults,
  };
}
