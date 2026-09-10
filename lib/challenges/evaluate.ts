import { architectureGraphSchema, challengeDraftSchema, type ArchitectureChallenge, type ArchitectureGraph, type Challenge } from "@/lib/challenges/schemas";

function reachable(graph: ArchitectureGraph, from: string, to: string, blocked: string[] = []) {
  const ids = new Set(graph.nodes.map((node) => node.id));
  if (!ids.has(from) || !ids.has(to) || blocked.includes(from) || blocked.includes(to)) return false;
  const pending = [from]; const seen = new Set(blocked);
  while (pending.length) {
    const current = pending.pop()!;
    if (seen.has(current)) continue;
    if (current === to) return true;
    seen.add(current);
    pending.push(...graph.edges.filter((edge) => edge.source === current).map((edge) => edge.target));
  }
  return false;
}

export function evaluateArchitecture(challenge: ArchitectureChallenge, input: unknown) {
  const parsed = architectureGraphSchema.safeParse(input);
  if (!parsed.success) return [{ id: "graph", passed: false, message: "Graph is malformed: use unique catalog nodes and valid connections." }];
  const graph = parsed.data;
  if (graph.nodes.some((node) => !challenge.catalog.some((item) => item.id === node.id))) return [{ id: "catalog", passed: false, message: "Graph contains an unknown component." }];
  return challenge.rules.map((rule) => ({
    id: rule.id, message: rule.message,
    passed: rule.type === "node" ? graph.nodes.some((node) => node.id === rule.node)
      : rule.type === "path" ? reachable(graph, rule.from, rule.to)
        : reachable(graph, rule.from, rule.to) && rule.via.every((gate) => !reachable(graph, rule.from, rule.to, [gate])),
  }));
}

export function evaluateChallenge(challenge: Challenge, input: unknown) {
  const parsed = challengeDraftSchema.safeParse(input);
  if (!parsed.success) return { complete: false, score: 0, checks: [{ id: "draft", passed: false, message: "Saved work is invalid. Reset or import a valid draft." }] };
  const draft = parsed.data;
  const checks = challenge.kind === "architecture" ? evaluateArchitecture(challenge, draft.graph) : [
    { id: "cause", passed: draft.cause === challenge.correctCause, message: challenge.causes.find((option) => option.id === draft.cause)?.explanation ?? "Select a root cause supported by the evidence." },
    { id: "remediation", passed: draft.remediation === challenge.correctRemediation, message: challenge.remediations.find((option) => option.id === draft.remediation)?.explanation ?? "Select a remediation that addresses the failure safely." },
    { id: "evidence", passed: challenge.requiredEvidence.every((id) => draft.evidence.includes(id)) && draft.evidence.every((id) => challenge.evidence.some((item) => item.id === id)), message: "Cite the diagnostic evidence that distinguishes the cause from alternative explanations." },
  ];
  checks.push({ id: "reasoning", passed: draft.reasoning.trim().length >= 100, message: "Write at least 100 characters explaining the evidence, trade-off, and verification plan. Prose quality is self-reviewed." });
  return { complete: checks.every((check) => check.passed), score: Math.round(checks.filter((check) => check.passed).length / checks.length * 100), checks };
}
