"use client";

import { useCallback, useEffect, useState } from "react";

import { emptyGameProfile, type GameProfile } from "@/lib/games/progress";
import { clearStoredGameProfile, gameProfileStorageKey, readStoredGameProfile, writeStoredGameProfile } from "@/lib/games/storage";

export function useGameProfile() {
  const [profile, setProfile] = useState<GameProfile>(emptyGameProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setProfile(readStoredGameProfile());
      setHydrated(true);
    });
    const handleStorage = (event: StorageEvent) => {
      if (event.key === gameProfileStorageKey) setProfile(readStoredGameProfile());
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const saveProfile = useCallback((nextProfile: GameProfile) => {
    setProfile(nextProfile);
    writeStoredGameProfile(nextProfile);
  }, []);

  const resetProfile = useCallback(() => {
    const cleared = clearStoredGameProfile();
    if (cleared) setProfile(emptyGameProfile);
    return cleared;
  }, []);

  return { profile, hydrated, saveProfile, resetProfile };
}
