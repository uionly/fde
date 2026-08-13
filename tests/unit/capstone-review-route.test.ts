// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { CapstonePhase } from "@/lib/content/schemas";

const contentMocks = vi.hoisted(() => ({
  getCapstonePhaseById: vi.fn(),
}));

vi.mock("@/lib/content/loaders", () => ({
  getCapstonePhaseById: contentMocks.getCapstonePhaseById,
}));

import { POST } from "@/app/api/ai/capstone-review/route";
import { resetRateLimitsForTests } from "@/lib/ai/rate-limit";

const phase = {
  id: "discovery",
  title: "Frame the customer problem",
  stage: "discover",
  order: 1,
  skills: ["Discovery", "Business Thinking"],
  context: "Northstar asks for an autonomous support agent before establishing a workflow baseline.",
  reveal: "Support leaders disagree about whether handling time, escalation, or policy errors matter most.",
  prompt: "Define the first measurable customer outcome and the evidence needed to validate it.",
  reasoningLabel: "Explain your field decision",
  reasoningPlaceholder: "Connect the workflow, baseline, outcome, and evidence.",
  minReasoningCharacters: 20,
  controls: [
    {
      id: "target-outcome",
      prompt: "Which outcome should anchor the first release?",
      type: "single",
      options: [
        {
          id: "workflow-baseline",
          label: "Baseline one workflow",
          description: "Measure handling time and escalation before selecting a solution.",
        },
        {
          id: "agent-launch",
          label: "Launch the agent",
          description: "Use launch date as the primary outcome and measure later.",
        },
        {
          id: "model-score",
          label: "Maximize model score",
          description: "Use a generic benchmark score as the customer outcome.",
        },
      ],
      minSelections: 1,
      maxSelections: 1,
    },
  ],
  rubric: {
    customerAlignment: "Names a user, workflow, baseline, and measurable outcome.",
    architecture: "Avoids committing to architecture before the problem is evidenced.",
    safety: "Surfaces the consequence of errors in the selected workflow.",
    deliveryReadiness: "Defines evidence and an owner for the next checkpoint.",
  },
  consequences: [
    {
      controlId: "target-outcome",
      optionId: "workflow-baseline",
      kind: "strength",
      message: "The release is anchored to measurable workflow evidence.",
      dimensions: { customerAlignment: 95, architecture: 85, safety: 82, deliveryReadiness: 92 },
    },
    {
      controlId: "target-outcome",
      optionId: "agent-launch",
      kind: "risk",
      message: "A launch date does not prove that the customer workflow improved.",
      dimensions: { customerAlignment: 30, architecture: 35, safety: 28, deliveryReadiness: 42 },
    },
    {
      controlId: "target-outcome",
      optionId: "model-score",
      kind: "tradeoff",
      message: "A model score is disconnected from the customer workflow outcome.",
      dimensions: { customerAlignment: 38, architecture: 55, safety: 45, deliveryReadiness: 40 },
    },
  ],
  hint: "Start with the support specialist's workflow, not the requested technology.",
  expertExample: "Baseline one high-volume workflow and define a measurable change before choosing the implementation.",
  dimensionWeights: { customerAlignment: 0.4, architecture: 0.2, safety: 0.15, deliveryReadiness: 0.25 },
  relatedLessons: ["customer-request-to-problem"],
} satisfies CapstonePhase;

const validBody = {
  phaseId: phase.id,
  learnerNotes: "I would baseline one workflow and agree on handling-time evidence with the support lead.",
  selections: [{ decisionId: "target-outcome", optionIds: ["workflow-baseline"] }],
};

function reviewRequest(body: unknown, ip = "203.0.113.8") {
  return new Request("http://localhost/api/ai/capstone-review", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/capstone-review", () => {
  const originalMode = process.env.AI_MODE;
  const originalProvider = process.env.AI_PROVIDER;
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    resetRateLimitsForTests();
    contentMocks.getCapstonePhaseById.mockImplementation((id: string) => (id === phase.id ? phase : undefined));
    process.env.AI_MODE = "mock";
    delete process.env.AI_PROVIDER;
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalMode === undefined) delete process.env.AI_MODE;
    else process.env.AI_MODE = originalMode;
    if (originalProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = originalProvider;
    if (originalApiKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalApiKey;
  });

  it("returns a no-store mock review derived from authored phase data", async () => {
    const response = await POST(reviewRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({
      mode: "mock",
      provider: "mock",
      scores: { customerAlignment: 95, architecture: 85, safety: 82, deliveryReadiness: 92 },
    });
    expect(JSON.stringify(body)).not.toContain(validBody.learnerNotes);
  });

  it("rejects unknown phases and option IDs without calling a provider", async () => {
    const unknownPhase = await POST(reviewRequest({ ...validBody, phaseId: "not-a-phase" }, "203.0.113.9"));
    const unknownOption = await POST(
      reviewRequest(
        {
          ...validBody,
          selections: [{ decisionId: "target-outcome", optionIds: ["client-injected-option"] }],
        },
        "203.0.113.10",
      ),
    );

    expect(unknownPhase.status).toBe(404);
    expect(await unknownPhase.json()).toMatchObject({ error: { code: "phase_not_found" } });
    expect(unknownOption.status).toBe(400);
    expect(await unknownOption.json()).toMatchObject({ error: { code: "invalid_selection" } });
  });

  it("returns a typed configuration error when live mode has no server key", async () => {
    process.env.AI_MODE = "live";
    process.env.AI_PROVIDER = "anthropic";
    const auditLog = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const response = await POST(reviewRequest(validBody, "203.0.113.11"));

    expect(response.status).toBe(503);
    expect(response.headers.get("x-ratelimit-remaining")).toBe("9");
    expect(await response.json()).toMatchObject({
      error: { code: "not_configured", retryable: false },
    });
    const serializedAudit = JSON.stringify(auditLog.mock.calls);
    expect(serializedAudit).toContain("capstone-ai-audit");
    expect(serializedAudit).toContain("not_configured");
    expect(serializedAudit).not.toContain(validBody.learnerNotes);
    expect(serializedAudit).not.toContain("203.0.113.11");
  });

  it("rate limits coaching requests per address", async () => {
    for (let index = 0; index < 10; index += 1) {
      expect((await POST(reviewRequest(validBody, "203.0.113.12"))).status).toBe(200);
    }

    const response = await POST(reviewRequest(validBody, "203.0.113.12"));
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await response.json()).toMatchObject({
      error: { code: "rate_limited", retryable: true },
    });
  });
});
