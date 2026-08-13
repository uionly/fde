import { describe, expect, it } from "vitest";

import { gameRendererRegistry } from "@/components/games/registry";
import { getAllGames } from "@/lib/content/loaders";
import { gameNextActionSchema } from "@/lib/content/schemas";
import { emptyGameProfile, parseGameProfile, recordGameEvaluation, scenarioProgressKey } from "@/lib/games/progress";
import { evaluateQuickDecision, resolveQuickDecision, seededShuffle, selectDailyGame, stableHash } from "@/lib/games/runtime";
import { clearStoredGameProfile, gameProfileStorageKey, readStoredGameProfile, writeStoredGameProfile } from "@/lib/games/storage";

describe("Field Arcade platform", () => {
  const games = getAllGames();

  it("loads six validated, registry-backed games with authored variants", () => {
    expect(games).toHaveLength(6);
    expect(new Set(games.map((game) => game.slug)).size).toBe(games.length);
    expect(new Set(games.map((game) => game.category)).size).toBe(6);
    expect(games.every((game) => game.scenarios.length >= 2 && game.scoringDimensions.length === 4)).toBe(true);
    expect(games.every((game) => game.customerHeadline.length > 0 && game.mechanic.length > 0 && game.nextActions.length >= 1)).toBe(true);
    expect(new Set(games.map((game) => game.type))).toEqual(new Set(Object.keys(gameRendererRegistry)));
  });

  it("accepts only same-origin, type-matched debrief actions", () => {
    expect(gameNextActionSchema.parse({ kind: "experiment", label: "Test the variable", description: "Open the related technical playground.", href: "/experiments/retrieval-playground" })).toMatchObject({ kind: "experiment" });
    expect(() => gameNextActionSchema.parse({ kind: "experiment", label: "Unsafe target", description: "This protocol-relative path must be rejected.", href: "//example.com" })).toThrow(/same-origin/);
    expect(() => gameNextActionSchema.parse({ kind: "lab", label: "Wrong route", description: "A lab action cannot point to an experiment.", href: "/experiments/retrieval-playground" })).toThrow(/lab actions/);
  });

  it("resolves stable scenarios and choice order without mutating content", () => {
    const game = games[0];
    const originalChoiceOrder = game.scenarios[0].choices.map((choice) => choice.id);
    const first = resolveQuickDecision(game, 0);
    const repeated = resolveQuickDecision(game, 0);
    const nextVariant = resolveQuickDecision(game, 1);

    expect(first).toEqual(repeated);
    expect(nextVariant.scenario.id).not.toBe(first.scenario.id);
    expect(game.scenarios[0].choices.map((choice) => choice.id)).toEqual(originalChoiceOrder);
    expect(seededShuffle([1, 2, 3, 4], 42)).toEqual(seededShuffle([1, 2, 3, 4], 42));
    expect(stableHash("northstar")).toBe(stableHash("northstar"));
  });

  it("scores the four system dimensions and rejects unknown choices", () => {
    const run = resolveQuickDecision(games[0], 0);
    const recommended = run.choices.find((choice) => choice.recommended)!;
    const evaluation = evaluateQuickDecision(run, recommended.id);

    expect(evaluation).toMatchObject({ recommended: true, outcome: "production-ready", gameId: games[0].id });
    expect(evaluation.overall).toBeGreaterThanOrEqual(85);
    expect(Object.values(evaluation.metrics).every((score) => score >= 0 && score <= 100)).toBe(true);
    expect(() => evaluateQuickDecision(run, "missing-choice")).toThrow(/Unknown choice/);
  });

  it("migrates legacy profiles and falls back safely from corrupted values", () => {
    expect(parseGameProfile({ xp: 120, completedGameIds: ["model-router-arena"], streak: 2, lastPlayedDate: "2026-08-09" })).toMatchObject({ version: 2, xp: 120, completedGameIds: ["model-router-arena"], streak: 2 });
    expect(parseGameProfile({ version: 99, xp: "broken" })).toEqual(emptyGameProfile);
    expect(parseGameProfile(null)).toEqual(emptyGameProfile);
  });

  it("starts a fresh device profile without clearing unrelated browser settings", () => {
    window.localStorage.setItem("theme", "dark");
    window.localStorage.setItem("unrelated-setting", "keep-me");
    writeStoredGameProfile({ ...emptyGameProfile, xp: 80, completedGameIds: [games[0].id] });

    expect(readStoredGameProfile()).toMatchObject({ xp: 80, completedGameIds: [games[0].id] });
    expect(clearStoredGameProfile()).toBe(true);
    expect(window.localStorage.getItem(gameProfileStorageKey)).toBeNull();
    expect(readStoredGameProfile()).toEqual(emptyGameProfile);
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(window.localStorage.getItem("unrelated-setting")).toBe("keep-me");

    window.localStorage.removeItem("theme");
    window.localStorage.removeItem("unrelated-setting");
  });

  it("awards XP once per scenario, preserves personal bests, and advances streaks", () => {
    const game = games[0];
    const firstRun = resolveQuickDecision(game, 0);
    const recommended = firstRun.choices.find((choice) => choice.recommended)!;
    const weakChoice = firstRun.choices.find((choice) => !choice.recommended)!;
    const weak = evaluateQuickDecision(firstRun, weakChoice.id);
    const strong = evaluateQuickDecision(firstRun, recommended.id);
    const afterWeak = recordGameEvaluation(emptyGameProfile, game, firstRun.scenario, weak, "2026-08-09");
    const firstClear = recordGameEvaluation(afterWeak, game, firstRun.scenario, strong, "2026-08-09");
    const replay = recordGameEvaluation(firstClear, game, firstRun.scenario, strong, "2026-08-09");
    const secondRun = resolveQuickDecision(game, 1);
    const secondStrong = evaluateQuickDecision(secondRun, secondRun.choices.find((choice) => choice.recommended)!.id);
    const nextDay = recordGameEvaluation(replay, game, secondRun.scenario, secondStrong, "2026-08-10");

    expect(afterWeak).toMatchObject({ xp: 0, streak: 0 });
    expect(firstClear).toMatchObject({ xp: game.xp, streak: 1 });
    expect(replay.xp).toBe(game.xp);
    expect(nextDay).toMatchObject({ xp: game.xp * 2, streak: 2 });
    expect(nextDay.completedScenarioKeys).toContain(scenarioProgressKey(game.id, secondRun.scenario.id));
    expect(nextDay.bestScores[scenarioProgressKey(game.id, firstRun.scenario.id)]).toBe(strong.overall);
  });

  it("selects a deterministic daily mission and prioritizes uncleared games", () => {
    const first = selectDailyGame(games, "2026-08-10", []);
    const repeated = selectDailyGame(games, "2026-08-10", []);
    const remaining = selectDailyGame(games, "2026-08-10", games.filter((game) => game.id !== "eval-set-curator").map((game) => game.id));
    expect(first).toEqual(repeated);
    expect(remaining?.id).toBe("eval-set-curator");
  });
});
