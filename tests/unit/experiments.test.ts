import { describe, expect, it } from "vitest";

import { getAllExperiments } from "@/lib/content/loaders";
import { createExperimentEvent } from "@/lib/experiments/types";
import { calculateAICost, chunkText, evaluateInjectionResponse, scoreToolSequence, searchCorpus } from "@/lib/experiments/simulations";

describe("experiment framework", () => {
  it("loads repository configuration by id", () => { expect(getAllExperiments().map((item) => item.id)).toContain("retrieval-playground"); });
  it("creates a typed event envelope", () => { const event = createExperimentEvent("experiment_run", "retrieval-playground", { strategy: "hybrid" }); expect(event).toMatchObject({ name: "experiment_run", experimentId: "retrieval-playground", metadata: { strategy: "hybrid" } }); expect(new Date(event.timestamp).toString()).not.toBe("Invalid Date"); });
  it("chunks with bounded overlap", () => { expect(chunkText("one two three four five", 3, 1, "words")).toEqual(["one two three", "three four five"]); });
  it("filters retrieval by role", () => { const corpus = [{ id: "one", title: "Refund", text: "manager reimbursement", department: "risk", roles: ["manager"] }, { id: "two", title: "Refund", text: "public reimbursement", department: "support", roles: ["specialist"] }]; expect(searchCorpus(corpus, "refund", "hybrid", 5, "specialist").map((item) => item.id)).toEqual(["two"]); });
  it("scores safe tool order and injection response", () => { expect(scoreToolSequence(["verify-identity", "lookup-payment", "search-policy", "create-ticket"]).exact).toBe(true); expect(evaluateInjectionResponse("ignore-and-report").safe).toBe(true); });
  it("calculates cache and retry economics", () => { const result = calculateAICost({ requests: 1000, inputTokens: 1000, outputTokens: 100, inputPrice: 2, outputPrice: 10, retryRate: 0, cacheHitRate: 50 }); expect(result.monthlyCost).toBeCloseTo(2); expect(result.costPerRequest).toBeCloseTo(0.002); });
});
