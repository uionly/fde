"use client";

import { useSyncExternalStore } from "react";

import {
  emptyCapstoneProgress,
  readCapstoneProgress,
  subscribeCapstoneProgress,
} from "@/lib/capstone/progress";

let cachedSerializedProgress = "";
let cachedProgress = emptyCapstoneProgress;

function getSnapshot() {
  const progress = readCapstoneProgress();
  const serialized = JSON.stringify(progress);
  if (serialized !== cachedSerializedProgress) {
    cachedSerializedProgress = serialized;
    cachedProgress = progress;
  }
  return cachedProgress;
}

function subscribeHydration() {
  return () => undefined;
}

export function useCapstoneProgress() {
  const progress = useSyncExternalStore(subscribeCapstoneProgress, getSnapshot, () => emptyCapstoneProgress);
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);

  return { hydrated, progress };
}
