"use client";

import { useSyncExternalStore } from "react";

import { emptyVisitorProgress, readVisitorProgress, subscribeVisitorProgress } from "@/lib/visitor/progress";

let cachedSerializedProgress = "";
let cachedProgress = emptyVisitorProgress;

function getSnapshot() {
  const progress = readVisitorProgress();
  const serialized = JSON.stringify(progress);
  if (serialized !== cachedSerializedProgress) {
    cachedSerializedProgress = serialized;
    cachedProgress = progress;
  }
  return cachedProgress;
}

export function useVisitorProgress() {
  return useSyncExternalStore(subscribeVisitorProgress, getSnapshot, () => emptyVisitorProgress);
}
