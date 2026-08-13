import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearVisitorProgress,
  emptyVisitorProgress,
  readVisitorLabProgress,
  readVisitorLessonProgress,
  readVisitorPracticeAttempts,
  readVisitorProgress,
  subscribeVisitorProgress,
  visitorProgressEventName,
  visitorProgressStorageKey,
  writeVisitorLabProgress,
  writeVisitorLessonProgress,
  writeVisitorPracticeAttempt,
} from "@/lib/visitor/progress";

describe("visitor progress storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("rejects malformed and unsupported stored profiles", () => {
    window.localStorage.setItem(visitorProgressStorageKey, JSON.stringify({ version: 2, lessons: [] }));
    expect(readVisitorProgress()).toEqual(emptyVisitorProgress);

    window.localStorage.setItem(visitorProgressStorageKey, "not-json");
    expect(readVisitorProgress()).toEqual(emptyVisitorProgress);
  });

  it("persists validated lesson, practice, and lab evidence", () => {
    expect(writeVisitorLessonProgress({ lessonId: "lesson-one", lessonSlug: "lesson-one", trackSlug: "foundations", completed: true, updatedAt: "2026-08-13T06:00:00.000Z" })).toBe(true);
    expect(writeVisitorPracticeAttempt({ questionId: "security-001", answer: ["deny"], correct: true, score: 1, updatedAt: "2026-08-13T06:01:00.000Z" })).toBe(true);
    expect(writeVisitorLabProgress({ labId: "discovery-workshop", currentStep: 2, state: { stakeholders: "Support, security" }, completed: false, updatedAt: "2026-08-13T06:02:00.000Z" })).toBe(true);

    expect(readVisitorLessonProgress("lesson-one")).toMatchObject({ completed: true, trackSlug: "foundations" });
    expect(readVisitorPracticeAttempts()).toEqual([expect.objectContaining({ questionId: "security-001", correct: true, score: 1 })]);
    expect(readVisitorLabProgress("discovery-workshop")).toMatchObject({ currentStep: 2, state: { stakeholders: "Support, security" } });
    expect(readVisitorProgress().version).toBe(1);
  });

  it("notifies same-tab subscribers after writes and clears", () => {
    const listener = vi.fn();
    const directEvent = vi.fn();
    const unsubscribe = subscribeVisitorProgress(listener);
    window.addEventListener(visitorProgressEventName, directEvent);
    window.localStorage.setItem("unrelated-setting", "preserve");

    writeVisitorLessonProgress({ lessonId: "lesson-one", lessonSlug: "lesson-one", trackSlug: "foundations", completed: true });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(directEvent).toHaveBeenCalledTimes(1);

    expect(clearVisitorProgress()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(readVisitorProgress()).toEqual(emptyVisitorProgress);
    expect(window.localStorage.getItem("unrelated-setting")).toBe("preserve");

    unsubscribe();
    window.removeEventListener(visitorProgressEventName, directEvent);
  });

  it("rejects invalid write payloads without replacing valid evidence", () => {
    writeVisitorLessonProgress({ lessonId: "lesson-one", lessonSlug: "lesson-one", trackSlug: "foundations", completed: true });

    expect(writeVisitorPracticeAttempt({ questionId: "security-001", answer: ["deny"], correct: false, score: 2 })).toBe(false);
    expect(readVisitorLessonProgress("lesson-one")?.completed).toBe(true);
    expect(readVisitorPracticeAttempts()).toHaveLength(0);
  });
});
