import { z } from "zod";

import type { FieldGame } from "@/lib/content/schemas";

export const gameProfileSchema = z
  .object({
    version: z.literal(2),
    xp: z.number().int().nonnegative(),
    completedGameIds: z.array(z.string()),
    completedScenarioKeys: z.array(z.string()),
    bestScores: z.record(z.string(), z.number().min(0).max(100)),
    attemptCounts: z.record(z.string(), z.number().int().nonnegative()),
    playCounts: z.record(z.string(), z.number().int().nonnegative()),
    lastScenarioIds: z.record(z.string(), z.string()),
    mastery: z.record(z.string(), z.number().min(0).max(100)),
    streak: z.number().int().nonnegative(),
    lastPlayedDate: z.string().nullable(),
  })
  .strict();

const legacyProfileSchema = z.object({
  xp: z.number().int().nonnegative().default(0),
  completedGameIds: z.array(z.string()).default([]),
  streak: z.number().int().nonnegative().default(0),
  lastPlayedDate: z.string().nullable().default(null),
});

export type GameProfile = z.infer<typeof gameProfileSchema>;

export const emptyGameProfile: GameProfile = {
  version: 2,
  xp: 0,
  completedGameIds: [],
  completedScenarioKeys: [],
  bestScores: {},
  attemptCounts: {},
  playCounts: {},
  lastScenarioIds: {},
  mastery: {},
  streak: 0,
  lastPlayedDate: null,
};

export function parseGameProfile(value: unknown): GameProfile {
  const current = gameProfileSchema.safeParse(value);
  if (current.success) return current.data;

  const legacy = legacyProfileSchema.safeParse(value);
  if (!legacy.success) return emptyGameProfile;
  return {
    ...emptyGameProfile,
    xp: legacy.data.xp,
    completedGameIds: [...new Set(legacy.data.completedGameIds)],
    streak: legacy.data.streak,
    lastPlayedDate: legacy.data.lastPlayedDate,
  };
}

export function scenarioProgressKey(gameId: string, scenarioId: string) {
  return `${gameId}:${scenarioId}`;
}

function calculateStreak(profile: GameProfile, dateKey: string) {
  if (profile.lastPlayedDate === dateKey) return profile.streak;
  const current = new Date(`${dateKey}T00:00:00Z`);
  const previous = profile.lastPlayedDate ? new Date(`${profile.lastPlayedDate}T00:00:00Z`) : null;
  if (!previous || Number.isNaN(current.getTime()) || Number.isNaN(previous.getTime())) return 1;
  const difference = Math.round((current.getTime() - previous.getTime()) / 86_400_000);
  return difference === 1 ? profile.streak + 1 : 1;
}

export function recordGameEvaluation(
  profile: GameProfile,
  game: FieldGame,
  scenario: { id: string },
  evaluation: { recommended: boolean; overall: number },
  dateKey: string,
): GameProfile {
  const key = scenarioProgressKey(game.id, scenario.id);
  const existingBest = profile.bestScores[key] ?? 0;
  const bestScores = { ...profile.bestScores, [key]: Math.max(existingBest, evaluation.overall) };
  const attemptCounts = { ...profile.attemptCounts, [game.id]: (profile.attemptCounts[game.id] ?? 0) + 1 };

  if (!evaluation.recommended) return { ...profile, bestScores, attemptCounts, lastScenarioIds: { ...profile.lastScenarioIds, [game.id]: scenario.id } };

  const alreadyCompleted = profile.completedScenarioKeys.includes(key);
  const legacyCompletion = game.type === "quick-decision" && profile.completedGameIds.includes(game.id) && !profile.completedScenarioKeys.some((completed) => completed.startsWith(`${game.id}:`));
  const completedScenarioKeys = alreadyCompleted ? profile.completedScenarioKeys : [...profile.completedScenarioKeys, key];
  const completedGameIds = profile.completedGameIds.includes(game.id) ? profile.completedGameIds : [...profile.completedGameIds, game.id];
  const mastery = { ...profile.mastery };
  for (const skill of game.skills) mastery[skill] = Math.max(mastery[skill] ?? 0, evaluation.overall);

  return {
    ...profile,
    xp: profile.xp + (alreadyCompleted || legacyCompletion ? 0 : game.xp),
    completedGameIds,
    completedScenarioKeys,
    bestScores,
    attemptCounts,
    playCounts: { ...profile.playCounts, [game.id]: (profile.playCounts[game.id] ?? 0) + 1 },
    lastScenarioIds: { ...profile.lastScenarioIds, [game.id]: scenario.id },
    mastery,
    streak: calculateStreak(profile, dateKey),
    lastPlayedDate: dateKey,
  };
}
