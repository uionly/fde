import { capstoneProgressStorageKey, clearCapstoneProgress } from "@/lib/capstone/progress";
import { clearStoredGameProfile, gameProfileStorageKey } from "@/lib/games/storage";
import { clearVisitorProgress, visitorProgressStorageKey } from "@/lib/visitor/progress";

/** Clears only app-owned visitor progress. Theme and unrelated browser data remain. */
export function clearVisitorSessionData() {
  if (typeof window === "undefined") return false;

  try {
    const gameProfileCleared = clearStoredGameProfile();
    const learningProgressCleared = clearVisitorProgress();
    const capstoneProgressCleared = clearCapstoneProgress();
    return gameProfileCleared
      && learningProgressCleared
      && capstoneProgressCleared
      && window.localStorage.getItem(gameProfileStorageKey) === null
      && window.localStorage.getItem(visitorProgressStorageKey) === null
      && window.localStorage.getItem(capstoneProgressStorageKey) === null;
  } catch {
    return false;
  }
}
