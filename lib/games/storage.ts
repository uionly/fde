import { emptyGameProfile, parseGameProfile, type GameProfile } from "@/lib/games/progress";

export const gameProfileStorageKey = "fde-ai-labs-profile-v1";

export function readStoredGameProfile(): GameProfile {
  if (typeof window === "undefined") return emptyGameProfile;
  try {
    const stored = window.localStorage.getItem(gameProfileStorageKey);
    return stored ? parseGameProfile(JSON.parse(stored)) : emptyGameProfile;
  } catch {
    return emptyGameProfile;
  }
}

export function writeStoredGameProfile(profile: GameProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(gameProfileStorageKey, JSON.stringify(profile));
}

export function clearStoredGameProfile() {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(gameProfileStorageKey);
    return true;
  } catch {
    return false;
  }
}
