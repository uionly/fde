import { describe, expect, it } from "vitest";

import { getAllLessons } from "@/lib/content/loaders";
import { calculateOverallProgress, calculateTrackProgress, latestProgress } from "@/lib/progress/calculate";
import type { ProgressRecord } from "@/lib/progress/types";

const record = (lessonId: string, trackSlug: string, status: ProgressRecord["status"], updatedAt: Date): ProgressRecord => ({ lessonId, trackSlug, status, startedAt: updatedAt, completedAt: status === "COMPLETED" ? updatedAt : null, updatedAt, timeSpentSeconds: 0 });

describe("progress calculations", () => {
  it("calculates completion from completed evidence only", () => {
    const lessons = getAllLessons();
    const records = [
      record("what-is-fde", "fde-foundations", "COMPLETED", new Date("2026-01-01")),
      record("customer-request-to-problem", "fde-foundations", "STARTED", new Date("2026-01-02")),
    ];
    const tracks = calculateTrackProgress(lessons, records);

    expect(tracks.find((track) => track.trackSlug === "fde-foundations")).toMatchObject({ completed: 1, total: 2, percent: 50 });
    expect(calculateOverallProgress(tracks)).toMatchObject({ completed: 1, total: 4, percent: 25 });
  });

  it("returns the most recently updated lesson", () => {
    const older = record("one", "track", "STARTED", new Date("2026-01-01"));
    const newer = record("two", "track", "COMPLETED", new Date("2026-02-01"));
    expect(latestProgress([older, newer])?.lessonId).toBe("two");
  });
});
