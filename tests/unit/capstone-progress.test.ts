import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCompletedCapstoneEvidence } from "@/lib/capstone/evidence";
import {
  capstoneProgressEventName,
  capstoneProgressStorageKey,
  clearCapstoneProgress,
  emptyCapstoneProgress,
  readCapstonePhaseProgress,
  readCapstoneProgress,
  setCurrentCapstonePhase,
  subscribeCapstoneProgress,
  writeCapstonePhaseProgress,
  type CapstoneAIReview,
  type CapstoneDeterministicEvaluation,
} from "@/lib/capstone/progress";
import { calculateSkillScores } from "@/lib/skills/scoring";
import { getCapstone } from "@/lib/content/loaders";

const evaluatedAt = "2026-08-13T06:00:00.000Z";
const deterministicEvaluation: CapstoneDeterministicEvaluation = {
  overall: 80,
  dimensions: {
    customerAlignment: 85,
    architecture: 75,
    safety: 70,
    deliveryReadiness: 90,
  },
  strengths: ["The scope is tied to a measurable support workflow."],
  gaps: ["The escalation owner is not explicit."],
  evaluatedAt,
};
const aiReview: CapstoneAIReview = {
  provider: "anthropic",
  model: "claude-sonnet-test",
  mode: "live",
  summary: "The reasoning is clear but the operational owner needs more detail.",
  scores: {
    customerAlignment: 5,
    architecture: 5,
    safety: 5,
    deliveryReadiness: 5,
  },
  strengths: ["Clear workflow."],
  gaps: ["Missing owner."],
  questions: ["Who owns escalation?"],
  recommendedNextStep: "Name the escalation owner.",
  usage: { inputTokens: 400, outputTokens: 120 },
  reviewedAt: evaluatedAt,
};

describe("capstone visitor progress", () => {
  beforeEach(() => window.localStorage.clear());

  it("falls back safely for malformed or unsupported stored state", () => {
    window.localStorage.setItem(capstoneProgressStorageKey, "not-json");
    expect(readCapstoneProgress()).toEqual(emptyCapstoneProgress);

    window.localStorage.setItem(capstoneProgressStorageKey, JSON.stringify({ version: 2, phases: [] }));
    expect(readCapstoneProgress()).toEqual(emptyCapstoneProgress);
  });

  it("persists and resumes phase decisions, reasoning, deterministic results, and optional AI coaching", () => {
    expect(writeCapstonePhaseProgress({
      phaseId: "discovery",
      selections: { stakeholders: ["support", "security"] },
      reasoning: "Start with the support workflow and verify access constraints.",
      deterministicEvaluation,
      completed: true,
      aiReview,
      updatedAt: evaluatedAt,
    })).toBe(true);

    expect(readCapstonePhaseProgress("discovery")).toEqual({
      phaseId: "discovery",
      selections: { stakeholders: ["support", "security"] },
      reasoning: "Start with the support workflow and verify access constraints.",
      deterministicEvaluation,
      completed: true,
      aiReview,
      updatedAt: evaluatedAt,
    });
    expect(readCapstoneProgress()).toMatchObject({ version: 1, currentPhaseId: "discovery", updatedAt: evaluatedAt });
  });

  it("supports partial autosaves and explicitly clears stale evaluations after an answer changes", () => {
    writeCapstonePhaseProgress({
      phaseId: "architecture",
      selections: { identity: ["propagate-user"] },
      reasoning: "Initial reasoning",
      deterministicEvaluation,
      completed: true,
      aiReview,
      updatedAt: evaluatedAt,
    });

    expect(writeCapstonePhaseProgress({
      phaseId: "architecture",
      reasoning: "Revised reasoning",
      deterministicEvaluation: null,
      completed: false,
      aiReview: null,
      updatedAt: "2026-08-13T06:05:00.000Z",
    })).toBe(true);

    expect(readCapstonePhaseProgress("architecture")).toMatchObject({
      selections: { identity: ["propagate-user"] },
      reasoning: "Revised reasoning",
      deterministicEvaluation: null,
      completed: false,
      aiReview: null,
    });
  });

  it("rejects oversized or invalid phase writes without replacing valid progress", () => {
    writeCapstonePhaseProgress({ phaseId: "discovery", reasoning: "Keep me", updatedAt: evaluatedAt });

    expect(writeCapstonePhaseProgress({ phaseId: "discovery", reasoning: "x".repeat(6_001) })).toBe(false);
    expect(writeCapstonePhaseProgress({
      phaseId: "discovery",
      selections: Object.fromEntries(Array.from({ length: 21 }, (_, index) => [`prompt-${index}`, ["choice"]])),
    })).toBe(false);
    expect(readCapstonePhaseProgress("discovery")?.reasoning).toBe("Keep me");
  });

  it("notifies same-tab and cross-tab subscribers, tracks the current phase, and clears only its key", () => {
    const listener = vi.fn();
    const directEvent = vi.fn();
    const unsubscribe = subscribeCapstoneProgress(listener);
    window.addEventListener(capstoneProgressEventName, directEvent);
    window.localStorage.setItem("unrelated-setting", "preserve");

    writeCapstonePhaseProgress({ phaseId: "discovery" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(directEvent).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new StorageEvent("storage", { key: capstoneProgressStorageKey }));
    expect(listener).toHaveBeenCalledTimes(2);

    expect(setCurrentCapstonePhase("architecture", evaluatedAt)).toBe(true);
    expect(readCapstoneProgress().currentPhaseId).toBe("architecture");

    expect(clearCapstoneProgress()).toBe(true);
    expect(readCapstoneProgress()).toEqual(emptyCapstoneProgress);
    expect(window.localStorage.getItem("unrelated-setting")).toBe("preserve");

    unsubscribe();
    window.removeEventListener(capstoneProgressEventName, directEvent);
  });

  it("creates skill evidence only from completed deterministic evaluations, never AI scores", () => {
    const capstone = getCapstone();
    const discovery = capstone.phases[0];
    const architecture = capstone.phases[2];
    const security = capstone.phases[7];
    writeCapstonePhaseProgress({
      phaseId: "discovery",
      selections: {
        "first-move": ["observe-workflow"],
        evidence: ["workflow-baseline", "stakeholder-map"],
      },
      reasoning: "I would observe the frontline workflow, baseline the work, map decision owners, and validate regulated exceptions before proposing a solution.",
      completed: true,
      deterministicEvaluation,
      aiReview,
      updatedAt: evaluatedAt,
    });
    writeCapstonePhaseProgress({ phaseId: "architecture", completed: false, deterministicEvaluation, aiReview, updatedAt: evaluatedAt });
    expect(writeCapstonePhaseProgress({ phaseId: "security", completed: true, deterministicEvaluation: null, aiReview, updatedAt: evaluatedAt })).toBe(false);

    const evidence = getCompletedCapstoneEvidence(readCapstoneProgress(), [discovery, architecture, security]);

    expect(evidence).toEqual([{ source: "capstone", skills: ["Discovery", "Customer Delivery"], score: 90 }]);
    expect(calculateSkillScores(evidence).find((result) => result.skill === "Discovery")).toEqual({
      skill: "Discovery",
      score: 90,
      evidenceCount: 1,
    });
  });
});
