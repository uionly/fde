"use client";
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { challengeDraftSchema, type ChallengeDraft } from "@/lib/challenges/schemas";

export const challengeStorageKey = "fde-learning-lab-challenges-v1";
const eventName = "fde:challenges-updated";
const schema = z.object({ version: z.literal(1), drafts: z.record(z.string().max(100), challengeDraftSchema).refine((drafts) => Object.keys(drafts).length <= 50) }).strict();
type Progress = z.infer<typeof schema>;
const empty: Progress = { version: 1, drafts: {} };
let cachedRaw = ""; let cached = empty;
export function readChallenges(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(challengeStorageKey) ?? "";
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    const parsed = schema.safeParse(raw ? JSON.parse(raw) : empty);
    cached = parsed.success ? parsed.data : empty;
    return cached;
  } catch { cachedRaw = ""; cached = empty; return empty; }
}
export function saveChallenge(id: string, draft: ChallengeDraft) {
  try {
    const parsed = schema.safeParse({ version: 1, drafts: { ...readChallenges().drafts, [id]: draft } });
    if (!parsed.success) return false;
    localStorage.setItem(challengeStorageKey, JSON.stringify(parsed.data));
    window.dispatchEvent(new Event(eventName));
    return true;
  } catch { return false; }
}
export function clearChallenges() {
  try { localStorage.removeItem(challengeStorageKey); window.dispatchEvent(new Event(eventName)); return true; } catch { return false; }
}
function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === challengeStorageKey || event.key === null) listener(); };
  window.addEventListener(eventName, listener); window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(eventName, listener); window.removeEventListener("storage", onStorage); };
}
export function useChallenges() { return useSyncExternalStore(subscribe, readChallenges, () => empty); }
