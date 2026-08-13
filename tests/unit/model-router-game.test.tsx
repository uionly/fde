import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ModelRouterGame as ModelRouterGameComponent } from "@/components/games/model-router-game";
import type { ModelRouterGame } from "@/lib/content/schemas";
import { emptyGameProfile } from "@/lib/games/progress";
import { evaluateModelRouter, resolveModelRouter } from "@/lib/games/model-router";
import { readStoredGameProfile } from "@/lib/games/storage";

const metrics = (quality: number, safety: number, cost: number, latency: number) => ({ quality, safety, cost, latency });

function scenario(id: string, suffix: string): ModelRouterGame["scenarios"][number] {
  return {
    id,
    title: `Routing shift ${suffix}`,
    customer: "Northstar Financial",
    briefing: "Customer traffic mixes routine work with high-impact ambiguity that needs a controlled escalation path.",
    objective: "Route each request to the lowest-cost lane that preserves the required capability and controls.",
    prompt: `Build the ${suffix} routing plan`,
    metricWeights: { quality: 0.3, safety: 0.3, cost: 0.2, latency: 0.2 },
    lanes: [
      { id: "fast", label: "Fast lane", description: "Low-latency model for bounded routine work." },
      { id: "reasoning", label: "Reasoning lane", description: "Deep reasoning model with specialist review." },
    ],
    requests: [
      {
        id: "intent",
        title: "Intent classification",
        description: "Classify a routine support request into a stable taxonomy.",
        volume: 70,
        routes: [
          { laneId: "fast", recommended: true, rationale: "Bounded classification fits the efficient lane.", metrics: metrics(90, 90, 95, 95) },
          { laneId: "reasoning", recommended: false, rationale: "Premium reasoning adds cost and latency without material quality gain.", metrics: metrics(94, 92, 20, 25) },
        ],
      },
      {
        id: "fraud",
        title: "Fraud exception",
        description: "Resolve conflicting evidence on a high-value claim with regulatory impact.",
        volume: 20,
        routes: [
          { laneId: "fast", recommended: false, rationale: "The efficient model lacks the controls for this consequential ambiguity.", metrics: metrics(30, 20, 98, 98) },
          { laneId: "reasoning", recommended: true, rationale: "Reasoning plus review matches the request impact and uncertainty.", metrics: metrics(95, 98, 60, 55) },
        ],
      },
      {
        id: "status",
        title: "Claim status lookup",
        description: "Return a status already available from an authoritative workflow API.",
        volume: 10,
        routes: [
          { laneId: "fast", recommended: true, rationale: "A bounded lookup belongs on the efficient controlled path.", metrics: metrics(92, 94, 96, 96) },
          { laneId: "reasoning", recommended: false, rationale: "A reasoning model cannot improve an authoritative status lookup.", metrics: metrics(92, 94, 15, 20) },
        ],
      },
    ],
    debrief: "A production router should match task difficulty and impact to capability, then verify thresholds against representative traffic.",
  };
}

const game: ModelRouterGame = {
  schemaVersion: 1,
  id: "model-router-arena",
  slug: "model-router-arena",
  type: "model-router",
  mode: "route-workload",
  title: "Model Router Arena",
  shortTitle: "Route the request",
  description: "Route an authored workload across model lanes and inspect the resulting production tradeoffs.",
  customerHeadline: "Route customer support traffic without wasting quality or spend",
  mechanic: "Select a request card and assign it to a named capability lane without typing or required dragging.",
  category: "models",
  difficulty: "intermediate",
  estimatedMinutes: 4,
  xp: 50,
  order: 1,
  status: "published",
  skills: ["AI Engineering", "Business Thinking"],
  learningObjectives: ["Route customer work by capability, impact, uncertainty, cost, and latency."],
  scoringDimensions: ["quality", "safety", "cost", "latency"],
  keyboardInstructions: "Use Tab to select a request and Enter or Space on a named routing lane. Dragging is never required.",
  principle: "Route by task difficulty and verify the policy against representative customer traffic.",
  nextActions: [{ kind: "experiment", label: "Test unit economics", description: "Validate traffic assumptions in the cost playground.", href: "/experiments/ai-cost-calculator" }],
  scenarios: [scenario("support-routing-g2", "launch"), scenario("claims-routing-g2", "claims")],
};

describe("model router domain", () => {
  it("resolves authored variants deterministically and weights all four metrics by traffic volume", () => {
    const first = resolveModelRouter(game, 0);
    const repeated = resolveModelRouter(game, 0);
    const next = resolveModelRouter(game, 1);

    expect(first.requests.map((request) => request.id)).toEqual(repeated.requests.map((request) => request.id));
    expect(next.scenario.id).toBe("claims-routing-g2");

    const evaluation = evaluateModelRouter(first, { intent: "fast", fraud: "reasoning", status: "fast" });
    expect(evaluation).toMatchObject({ recommended: true, gameId: game.id, scenarioId: "support-routing-g2" });
    expect(evaluation.metrics).toEqual({ quality: 91, safety: 92, cost: 88, latency: 87 });
    expect(evaluation.requestResults).toHaveLength(3);
    expect(evaluation.selectedChoiceId).toBe("fraud:reasoning|intent:fast|status:fast");
  });

  it("rejects incomplete assignments instead of silently scoring them", () => {
    expect(() => evaluateModelRouter(resolveModelRouter(game, 0), { intent: "fast" })).toThrow(/has not been assigned/);
  });
});

describe("model router interaction", () => {
  beforeEach(() => window.localStorage.clear());

  it("offers touch and keyboard buttons, moves phase focus, announces the result, saves XP, and rotates on replay", async () => {
    render(<ModelRouterGameComponent game={game} />);

    const begin = await screen.findByRole("button", { name: "Open routing board" });
    await waitFor(() => expect(begin).toBeEnabled());
    fireEvent.click(begin);

    const routingHeading = screen.getByRole("heading", { level: 2, name: "Build the launch routing plan" });
    await waitFor(() => expect(routingHeading).toHaveFocus());
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(document.querySelector("[draggable=true]")).toBeNull();

    for (const request of game.scenarios[0].requests) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^Select request: ${request.title}`) }));
      const recommendedLane = request.routes.find((route) => route.recommended)!.laneId;
      const lane = game.scenarios[0].lanes.find((candidate) => candidate.id === recommendedLane)!;
      fireEvent.click(screen.getByRole("button", { name: `Route ${request.title} to ${lane.label}` }));
    }

    fireEvent.click(screen.getByRole("button", { name: "Run traffic" }));
    const resultHeading = screen.getByRole("heading", { level: 2, name: "Production ready" });
    await waitFor(() => expect(resultHeading).toHaveFocus());
    expect(screen.getByRole("status")).toHaveTextContent(/Simulation result: Production ready.*Mission cleared/);
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    expect(readStoredGameProfile()).toMatchObject({ xp: game.xp, completedGameIds: [game.id] });
    expect(readStoredGameProfile().mastery).toMatchObject({ "AI Engineering": expect.any(Number), "Business Thinking": expect.any(Number) });

    fireEvent.click(screen.getByRole("button", { name: "Next scenario" }));
    expect(screen.getByRole("heading", { level: 2, name: "Build the claims routing plan" })).toBeInTheDocument();
    expect(readStoredGameProfile()).not.toEqual(emptyGameProfile);
  });
});
