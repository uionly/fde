// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/ai/capstone-review/route";
import { evaluateCapstonePhase } from "@/lib/capstone/evaluator";
import { getCapstonePhaseById } from "@/lib/content/loaders";
import { resetRateLimitsForTests } from "@/lib/ai/rate-limit";

describe("capstone coaching with published content", () => {
  const originalMode = process.env.AI_MODE;

  afterEach(() => {
    if (originalMode === undefined) delete process.env.AI_MODE;
    else process.env.AI_MODE = originalMode;
  });

  it("reviews an authored phase in credential-free mock mode", async () => {
    process.env.AI_MODE = "mock";
    resetRateLimitsForTests();
    const phase = getCapstonePhaseById("discovery");
    expect(phase).toBeDefined();
    if (!phase) return;

    const selections = Object.fromEntries(
      phase.controls.map((control) => [control.id, control.options.slice(0, control.minSelections).map((option) => option.id)]),
    );
    const learnerNotes = "I would validate this decision with the workflow owner and an agreed baseline before expanding scope.";
    const deterministic = evaluateCapstonePhase(phase, { reasoning: learnerNotes, selections });
    const request = new Request("http://localhost/api/ai/capstone-review", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "192.0.2.45" },
      body: JSON.stringify({
        phaseId: phase.id,
        learnerNotes,
        selections: Object.entries(selections).map(([decisionId, optionIds]) => ({ decisionId, optionIds })),
      }),
    });

    const response = await POST(request);
    const review = await response.json();

    expect(response.status).toBe(200);
    expect(review).toMatchObject({
      mode: "mock",
      provider: "mock",
      scores: deterministic.dimensions,
    });
  });
});
