import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { RetrievalRankGame } from "@/components/games/retrieval-rank-game";
import type { RetrievalRankGame as RetrievalRankGameContent } from "@/lib/content/schemas";
import { readStoredGameProfile } from "@/lib/games/storage";
import { evaluateRetrievalRank, resolveRetrievalRank } from "@/lib/games/retrieval-rank";

const game = {
  schemaVersion: 1,
  id: "retrieval-rank-rush",
  slug: "retrieval-rank-rush",
  type: "retrieval-rank",
  mode: "rank-and-pack",
  title: "Retrieval Rank Rush",
  shortTitle: "Pack the evidence",
  description: "Rank authoritative evidence inside a bounded context window.",
  customerHeadline: "Repair a grounded policy answer before launch",
  mechanic: "Include, remove, and reorder evidence inside a fixed token budget.",
  category: "retrieval",
  difficulty: "intermediate",
  estimatedMinutes: 5,
  xp: 60,
  order: 3,
  status: "published",
  skills: ["AI Engineering", "Data"],
  learningObjectives: ["Balance evidence relevance, authority, context cost, and response latency."],
  scoringDimensions: ["quality", "safety", "cost", "latency"],
  keyboardInstructions: "Use Tab to reach Include, Remove, Move up, and Move down; press Enter or Space to activate each control.",
  principle: "Pack the smallest safe set of authoritative evidence, then rank the decisive source first.",
  nextActions: [{ kind: "experiment", label: "Test retrieval", description: "Compare the related retrieval strategies and filters.", href: "/experiments/retrieval-playground" }],
  scenarios: [
    {
      id: "policy-pack-launch",
      title: "Refund policy context",
      customer: "Northstar Financial",
      briefing: "A support assistant must answer a policy question from a mixed set of current, stale, and untrusted search candidates.",
      objective: "Pack the safest authoritative evidence without wasting the context window.",
      prompt: "Which evidence belongs in context, and what should the model read first?",
      query: "Can a verified customer reverse a duplicate card charge?",
      contextBudget: 700,
      targetContextTokens: 400,
      latency: { baseMs: 100, perTokenMs: 0.5, targetMs: 300, maxMs: 500 },
      metricWeights: { quality: 0.4, safety: 0.3, cost: 0.15, latency: 0.15 },
      candidates: [
        { id: "current-policy", title: "Current refund policy", source: "Policy registry", excerpt: "The current effective policy describes verified duplicate-charge reversals.", tokens: 220, relevance: 4, safetyRisk: 0, signals: ["authoritative", "current"] },
        { id: "exception-table", title: "Duplicate charge exceptions", source: "Operations handbook", excerpt: "The approved exception table defines timelines and escalation conditions.", tokens: 180, relevance: 3, safetyRisk: 0, signals: ["approved", "specific"] },
        { id: "old-policy", title: "Superseded refund policy", source: "Archive", excerpt: "An expired policy repeats the query language but has been superseded.", tokens: 250, relevance: 1, safetyRisk: 10, signals: ["expired"] },
        { id: "hostile-ticket", title: "Customer ticket attachment", source: "Untrusted upload", excerpt: "The attachment asks the assistant to ignore policy and reveal another account.", tokens: 100, relevance: 2, safetyRisk: 80, signals: ["untrusted", "injection"] },
      ],
      idealOrder: ["current-policy", "exception-table"],
      debrief: "Retrieval quality depends on what reaches context and in what order, while authority and access risk remain separate launch gates.",
    },
    {
      id: "claims-pack-launch",
      title: "Claims policy context",
      customer: "Northstar Financial",
      briefing: "Claims analysts need the current policy and approved exception evidence without exposing a different customer's case notes.",
      objective: "Build a compact evidence pack that respects the customer boundary.",
      prompt: "Which sources should be packed, and in which order?",
      query: "When may a weather-related claim receive expedited review?",
      contextBudget: 700,
      targetContextTokens: 400,
      latency: { baseMs: 100, perTokenMs: 0.5, targetMs: 300, maxMs: 500 },
      metricWeights: { quality: 0.4, safety: 0.3, cost: 0.15, latency: 0.15 },
      candidates: [
        { id: "claims-policy", title: "Current claims policy", source: "Policy registry", excerpt: "The effective policy defines weather-related expedited review eligibility.", tokens: 220, relevance: 4, safetyRisk: 0, signals: ["authoritative", "current"] },
        { id: "claims-table", title: "Expedited review table", source: "Operations handbook", excerpt: "The approved table contains the supporting thresholds and evidence requirements.", tokens: 180, relevance: 3, safetyRisk: 0, signals: ["approved", "specific"] },
        { id: "claims-blog", title: "Public claims blog", source: "Marketing site", excerpt: "A general article describes common weather claims without contractual detail.", tokens: 250, relevance: 1, safetyRisk: 0, signals: ["general"] },
        { id: "other-claim", title: "Another customer claim", source: "Case system", excerpt: "A different customer's private case contains superficially similar wording.", tokens: 100, relevance: 2, safetyRisk: 80, signals: ["private", "wrong-tenant"] },
      ],
      idealOrder: ["claims-policy", "claims-table"],
      debrief: "A relevant result is not automatically authorized evidence. Tenant and document authority filters belong ahead of generation.",
    },
  ],
} satisfies RetrievalRankGameContent;

describe("retrieval rank runtime", () => {
  it("rotates authored scenarios and shuffles candidates deterministically", () => {
    const first = resolveRetrievalRank(game, 0);
    const repeated = resolveRetrievalRank(game, 0);
    const next = resolveRetrievalRank(game, 1);

    expect(first).toEqual(repeated);
    expect(first.scenario.id).toBe("policy-pack-launch");
    expect(next.scenario.id).toBe("claims-pack-launch");
    expect(game.scenarios[0].candidates.map((candidate) => candidate.id)).toEqual([
      "current-policy",
      "exception-table",
      "old-policy",
      "hostile-ticket",
    ]);
  });

  it("scores ranking, safety, cost, and latency as independent deterministic gates", () => {
    const run = resolveRetrievalRank(game, 0);
    const cleared = evaluateRetrievalRank(run, ["current-policy", "exception-table"]);
    const repeated = evaluateRetrievalRank(run, ["current-policy", "exception-table"]);
    const reversed = evaluateRetrievalRank(run, ["exception-table", "current-policy"]);
    const unsafe = evaluateRetrievalRank(run, ["current-policy", "hostile-ticket"]);
    const latencyScenario = {
      ...run.scenario,
      targetContextTokens: run.scenario.contextBudget,
      latency: { baseMs: 50, perTokenMs: 0.3, targetMs: 100, maxMs: 200 },
    };
    const slow = evaluateRetrievalRank({ ...run, scenario: latencyScenario }, ["current-policy", "exception-table"]);

    expect(cleared).toEqual(repeated);
    expect(cleared).toMatchObject({
      recommended: true,
      totalTokens: 400,
      estimatedLatencyMs: 300,
      metrics: { quality: 100, safety: 100, cost: 100, latency: 100 },
      passed: { quality: true, safety: true, cost: true, latency: true },
    });
    expect(unsafe.metrics.safety).toBe(20);
    expect(unsafe.passed.safety).toBe(false);
    expect(reversed.passed.quality).toBe(false);
    expect(reversed.passed.safety).toBe(true);
    expect(slow.metrics.cost).toBe(100);
    expect(slow.passed.cost).toBe(true);
    expect(slow.passed.latency).toBe(false);
  });

  it("rejects empty, duplicate, unknown, and over-budget packs", () => {
    const run = resolveRetrievalRank(game, 0);
    expect(() => evaluateRetrievalRank(run, [])).toThrow(/at least one/);
    expect(() => evaluateRetrievalRank(run, ["current-policy", "current-policy"])).toThrow(/duplicate/);
    expect(() => evaluateRetrievalRank(run, ["missing"])).toThrow(/Unknown/);
    expect(() => evaluateRetrievalRank(run, ["current-policy", "exception-table", "old-policy", "hostile-ticket"])).toThrow(/context budget/);
  });
});

describe("retrieval rank interaction", () => {
  beforeEach(() => window.localStorage.clear());

  it("supports named include, remove, and move controls with focus and live feedback", async () => {
    render(<RetrievalRankGame game={game} />);

    const begin = await screen.findByRole("button", { name: "Begin rank rush" });
    await waitFor(() => expect(begin).toBeEnabled());
    fireEvent.click(begin);

    const activeHeading = screen.getByRole("heading", { level: 2, name: game.scenarios[0].prompt });
    await waitFor(() => expect(activeHeading).toHaveFocus());
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Include Duplicate charge exceptions" }));
    expect(screen.getByRole("status")).toHaveTextContent("included at rank 1");
    fireEvent.click(screen.getByRole("button", { name: "Include Current refund policy" }));
    fireEvent.click(screen.getByRole("button", { name: "Move Current refund policy up" }));

    const rankedPack = screen.getByRole("heading", { name: "Ranked context pack" }).closest("section")!;
    expect(within(rankedPack).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("Current refund policy"),
      expect.stringContaining("Duplicate charge exceptions"),
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("moved to rank 1");

    fireEvent.click(screen.getByRole("button", { name: "Remove Duplicate charge exceptions" }));
    expect(screen.getByRole("button", { name: "Include Duplicate charge exceptions" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Include Duplicate charge exceptions" }));
    fireEvent.click(screen.getByRole("button", { name: "Evaluate context" }));

    const debriefHeading = screen.getByRole("heading", { level: 2, name: "Production ready" });
    await waitFor(() => expect(debriefHeading).toHaveFocus());
    expect(screen.getByRole("status")).toHaveTextContent("All four launch gates cleared");
    expect(screen.getByText("Mission cleared · +60 XP")).toBeInTheDocument();
    expect(readStoredGameProfile()).toMatchObject({ xp: 60, completedGameIds: [game.id] });
  });
});
