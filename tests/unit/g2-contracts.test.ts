import { describe, expect, it } from "vitest";

import { getAllGames } from "@/lib/content/loaders";
import { fieldGameSchema } from "@/lib/content/schemas";
import { emptyGameProfile, parseGameProfile, recordGameEvaluation, scenarioProgressKey } from "@/lib/games/progress";

function getRouterGame() {
  const game = getAllGames().find((candidate) => candidate.type === "model-router");
  if (!game) throw new Error("Missing model-router G2 fixture");
  return game;
}

function getRetrievalGame() {
  const game = getAllGames().find((candidate) => candidate.type === "retrieval-rank");
  if (!game) throw new Error("Missing retrieval-rank G2 fixture");
  return game;
}

function expectInvalid(value: unknown, message: RegExp) {
  const result = fieldGameSchema.safeParse(value);
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error.issues.map((issue) => issue.message).join(" | ")).toMatch(message);
}

describe("G2 game content contracts", () => {
  it("uses a discriminated schema with a mechanic-specific type and mode", () => {
    const router = getRouterGame();
    const retrieval = getRetrievalGame();

    expect(fieldGameSchema.parse(router)).toMatchObject({ type: "model-router", mode: "route-workload" });
    expect(fieldGameSchema.parse(retrieval)).toMatchObject({ type: "retrieval-rank", mode: "rank-and-pack" });
    expect(fieldGameSchema.safeParse({ ...router, mode: "rank-and-pack" }).success).toBe(false);
    expect(fieldGameSchema.safeParse({ ...retrieval, type: "model-router", mode: "route-workload" }).success).toBe(false);
    expect(fieldGameSchema.safeParse({ ...router, type: "unknown-mechanic" }).success).toBe(false);
  });

  it("rejects duplicate router ids, incomplete lane references, and invalid traffic volume", () => {
    const router = getRouterGame();
    const [scenario, ...remainingScenarios] = router.scenarios;
    const duplicateLane = {
      ...router,
      scenarios: [
        {
          ...scenario,
          lanes: scenario.lanes.map((lane, index) => (index === 1 ? { ...lane, id: scenario.lanes[0].id } : lane)),
        },
        ...remainingScenarios,
      ],
    };
    const duplicateRequest = {
      ...router,
      scenarios: [
        {
          ...scenario,
          requests: scenario.requests.map((request, index) =>
            index === 1 ? { ...request, id: scenario.requests[0].id } : request,
          ),
        },
        ...remainingScenarios,
      ],
    };
    const unknownLaneReference = {
      ...router,
      scenarios: [
        {
          ...scenario,
          requests: scenario.requests.map((request, requestIndex) =>
            requestIndex === 0
              ? {
                  ...request,
                  routes: request.routes.map((route, routeIndex) =>
                    routeIndex === 0 ? { ...route, laneId: "missing-lane" } : route,
                  ),
                }
              : request,
          ),
        },
        ...remainingScenarios,
      ],
    };
    const invalidVolume = {
      ...router,
      scenarios: [
        {
          ...scenario,
          requests: scenario.requests.map((request, index) =>
            index === 0 ? { ...request, volume: request.volume + 1 } : request,
          ),
        },
        ...remainingScenarios,
      ],
    };

    expectInvalid(duplicateLane, /lane ids must be unique/);
    expectInvalid(duplicateRequest, /request ids must be unique/);
    expectInvalid(unknownLaneReference, /routes must cover every lane exactly once/);
    expectInvalid(invalidVolume, /request volumes must total 100 percent/);
  });

  it("rejects router requests without exactly one recommended lane", () => {
    const router = getRouterGame();
    const [scenario, ...remainingScenarios] = router.scenarios;
    const noRecommendedRoute = {
      ...router,
      scenarios: [
        {
          ...scenario,
          requests: scenario.requests.map((request, index) =>
            index === 0
              ? { ...request, routes: request.routes.map((route) => ({ ...route, recommended: false })) }
              : request,
          ),
        },
        ...remainingScenarios,
      ],
    };

    expectInvalid(noRecommendedRoute, /each request requires exactly one recommended route/);
  });

  it("rejects duplicate or missing retrieval references", () => {
    const retrieval = getRetrievalGame();
    const [scenario, ...remainingScenarios] = retrieval.scenarios;
    const duplicateCandidate = {
      ...retrieval,
      scenarios: [
        {
          ...scenario,
          candidates: scenario.candidates.map((candidate, index) =>
            index === 1 ? { ...candidate, id: scenario.candidates[0].id } : candidate,
          ),
        },
        ...remainingScenarios,
      ],
    };
    const duplicateIdealReference = {
      ...retrieval,
      scenarios: [{ ...scenario, idealOrder: [scenario.idealOrder[0], scenario.idealOrder[0]] }, ...remainingScenarios],
    };
    const missingIdealReference = {
      ...retrieval,
      scenarios: [{ ...scenario, idealOrder: ["missing-candidate"] }, ...remainingScenarios],
    };

    expectInvalid(duplicateCandidate, /candidate ids must be unique/);
    expectInvalid(duplicateIdealReference, /ideal order must contain unique existing candidate ids/);
    expectInvalid(missingIdealReference, /ideal order must contain unique existing candidate ids/);
  });

  it("rejects retrieval packs and targets that violate authored budgets", () => {
    const retrieval = getRetrievalGame();
    const [scenario, ...remainingScenarios] = retrieval.scenarios;
    const idealPackOverBudget = {
      ...retrieval,
      scenarios: [{ ...scenario, contextBudget: scenario.targetContextTokens }, ...remainingScenarios],
    };
    const targetOverBudget = {
      ...retrieval,
      scenarios: [{ ...scenario, targetContextTokens: scenario.contextBudget + 1 }, ...remainingScenarios],
    };
    const invertedLatencyBudget = {
      ...retrieval,
      scenarios: [
        { ...scenario, latency: { ...scenario.latency, targetMs: scenario.latency.maxMs } },
        ...remainingScenarios,
      ],
    };

    expectInvalid(idealPackOverBudget, /ideal order must fit within the context budget/);
    expectInvalid(targetOverBudget, /target context tokens cannot exceed the context budget/);
    expectInvalid(invertedLatencyBudget, /target latency must be below maximum latency/);
  });
});

describe("G2 progress compatibility", () => {
  it("migrates a legacy completion without suppressing the first G2 scenario clear", () => {
    const router = getRouterGame();
    const scenario = router.scenarios[0];
    const legacy = parseGameProfile({
      xp: 120,
      completedGameIds: [router.id, router.id],
      streak: 2,
      lastPlayedDate: "2026-08-12",
    });
    const cleared = recordGameEvaluation(legacy, router, scenario, { recommended: true, overall: 91 }, "2026-08-13");

    expect(legacy.completedGameIds).toEqual([router.id]);
    expect(cleared.xp).toBe(120 + router.xp);
    expect(cleared.completedGameIds).toEqual([router.id]);
    expect(cleared.completedScenarioKeys).toEqual([scenarioProgressKey(router.id, scenario.id)]);
    expect(cleared).toMatchObject({ streak: 3, lastPlayedDate: "2026-08-13" });
  });

  it("awards XP only on a clear and never duplicates XP or completion records on replay", () => {
    const retrieval = getRetrievalGame();
    const scenario = retrieval.scenarios[0];
    const weakAttempt = recordGameEvaluation(
      emptyGameProfile,
      retrieval,
      scenario,
      { recommended: false, overall: 48 },
      "2026-08-13",
    );
    const firstClear = recordGameEvaluation(
      weakAttempt,
      retrieval,
      scenario,
      { recommended: true, overall: 92 },
      "2026-08-13",
    );
    const weakerReplay = recordGameEvaluation(
      firstClear,
      retrieval,
      scenario,
      { recommended: true, overall: 84 },
      "2026-08-13",
    );
    const key = scenarioProgressKey(retrieval.id, scenario.id);

    expect(weakAttempt).toMatchObject({ xp: 0, completedGameIds: [], completedScenarioKeys: [], streak: 0 });
    expect(weakAttempt.bestScores[key]).toBe(48);
    expect(firstClear).toMatchObject({ xp: retrieval.xp, streak: 1 });
    expect(weakerReplay.xp).toBe(retrieval.xp);
    expect(weakerReplay.completedGameIds).toEqual([retrieval.id]);
    expect(weakerReplay.completedScenarioKeys).toEqual([key]);
    expect(weakerReplay.bestScores[key]).toBe(92);
    expect(weakerReplay.attemptCounts[retrieval.id]).toBe(3);
  });
});
