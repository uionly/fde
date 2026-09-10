import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllChallenges } from "@/lib/content";
import { evaluateArchitecture, evaluateChallenge } from "@/lib/challenges/evaluate";
import { architectureGraphSchema, challengeDraftSchema } from "@/lib/challenges/schemas";
import { challengeStorageKey, readChallenges, saveChallenge } from "@/lib/challenges/storage";
import { clearVisitorSessionData } from "@/lib/visitor/reset";
const challenges = getAllChallenges();
const reasoning = "The evidence identifies the failing boundary. I would preserve caller permissions and test allowed and denied cases, then verify the customer outcome after recovery.";
describe("authored field challenges", () => {
  beforeEach(() => localStorage.clear());
  it("requires diagnostic evidence and the safe remediation, not just a guessed cause", () => {
    for (const challenge of challenges) {
      if (challenge.kind !== "debugging") continue;
      const answer = challengeDraftSchema.parse({ cause: challenge.correctCause, remediation: challenge.correctRemediation, evidence: challenge.requiredEvidence, reasoning });
      expect(evaluateChallenge(challenge, answer).complete).toBe(true);
      expect(evaluateChallenge(challenge, { ...answer, evidence: [] }).complete).toBe(false);
      expect(evaluateChallenge(challenge, { ...answer, remediation: "unknown" }).complete).toBe(false);
      expect(evaluateChallenge(challenge, { ...answer, reasoning: " " }).complete).toBe(false);
    }
  });
  it("evaluates connectivity, rejects disconnected guards and bypasses, and accepts alternate layout", () => {
    const challenge = challenges.find((item) => item.id === "permission-aware-architecture");
    if (!challenge || challenge.kind !== "architecture") throw new Error("Missing architecture");
    const graph = challenge.example;
    expect(evaluateArchitecture(challenge, graph).every((check) => check.passed)).toBe(true);
    expect(evaluateArchitecture(challenge, { ...graph, nodes: graph.nodes.map((node) => ({ ...node, position: { x: 1, y: 2 } })) }).every((check) => check.passed)).toBe(true);
    expect(evaluateArchitecture(challenge, { ...graph, edges: [] }).every((check) => check.passed)).toBe(false);
    expect(evaluateArchitecture(challenge, { ...graph, edges: [...graph.edges, { source: "data", target: "model" }] }).find((check) => check.id === "data-model-boundary")?.passed).toBe(false);
    const alternate = { ...graph, edges: [...graph.edges.filter((edge) => !(edge.source === "data" && edge.target === "retrieval")), { source: "data", target: "queue" }, { source: "queue", target: "retrieval" }] };
    expect(evaluateArchitecture(challenge, alternate).every((check) => check.passed)).toBe(true);
    expect(evaluateArchitecture(challenge, { ...alternate, edges: [...alternate.edges, { source: "queue", target: "model" }] }).every((check) => check.passed)).toBe(false);
  });
  it("enforces approval and current policy on every action path, including cycles", () => {
    const challenge = challenges.find((item) => item.id === "approved-action-architecture");
    if (!challenge || challenge.kind !== "architecture") throw new Error("Missing architecture");
    const graph = challenge.example;
    expect(evaluateArchitecture(challenge, graph).every((check) => check.passed)).toBe(true);
    const bypass = { ...graph, edges: [...graph.edges, { source: "model", target: "tool" }, { source: "tool", target: "model" }] };
    expect(evaluateArchitecture(challenge, bypass).every((check) => check.passed)).toBe(false);
    expect(evaluateArchitecture(challenge, { ...graph, edges: graph.edges.filter((edge) => edge.source !== "approval") }).every((check) => check.passed)).toBe(false);
  });
  it("rejects malformed, duplicate, oversized, and unknown graph data", () => {
    expect(architectureGraphSchema.safeParse({ nodes: [], edges: [{ source: "a", target: "b" }] }).success).toBe(false);
    expect(architectureGraphSchema.safeParse({ nodes: Array.from({ length: 25 }, () => ({ id: "a", position: { x: 0, y: 0 } })), edges: [] }).success).toBe(false);
    const challenge = challenges.find((item) => item.kind === "architecture")!;
    if (challenge.kind !== "architecture") throw new Error("Missing architecture");
    expect(evaluateArchitecture(challenge, { nodes: [{ id: "invented", position: { x: 0, y: 0 } }], edges: [] })[0].passed).toBe(false);
  });
  it("persists validated drafts and scopes reset to application keys", () => {
    const draft = challengeDraftSchema.parse({ reasoning });
    expect(saveChallenge(challenges[0].id, draft)).toBe(true);
    expect(readChallenges().drafts[challenges[0].id]).toEqual(draft);
    localStorage.setItem(challengeStorageKey, "{malformed");
    expect(readChallenges().drafts).toEqual({});
    expect(readChallenges().drafts).toEqual({});
    localStorage.setItem("theme", "dark"); localStorage.setItem("customer-setting", "keep");
    expect(clearVisitorSessionData()).toBe(true);
    expect(localStorage.getItem(challengeStorageKey)).toBeNull();
    expect(localStorage.getItem("theme")).toBe("dark"); expect(localStorage.getItem("customer-setting")).toBe("keep");
    localStorage.setItem(challengeStorageKey, '{"version":99}'); expect(readChallenges().drafts).toEqual({});
  });
  it("reports storage failure without throwing", () => {
    const blocked = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota"); });
    expect(saveChallenge("test", challengeDraftSchema.parse({}))).toBe(false);
    blocked.mockRestore();
  });
});
