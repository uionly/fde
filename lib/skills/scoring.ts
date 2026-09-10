import type { Skill } from "@/lib/content/schemas";

export type SkillEvidence = { source: "practice" | "lab" | "capstone"; skills: Skill[]; score: number; weight?: number };
export type SkillResult = { skill: Skill; score: number; evidenceCount: number };

export const allSkills: Skill[] = ["Discovery", "Architecture", "Software Engineering", "AI Engineering", "Data", "Security", "Production", "Customer Delivery", "Business Thinking"];

export function calculateSkillScores(evidence: SkillEvidence[]): SkillResult[] {
  return allSkills.map((skill) => {
    const relevant = evidence.filter((item) => item.skills.includes(skill));
    const weighted = relevant.reduce((sum, item) => sum + Math.max(0, Math.min(100, item.score)) * (item.weight ?? (item.source === "practice" ? 1 : item.source === "lab" ? 3 : 4)), 0);
    const totalWeight = relevant.reduce((sum, item) => sum + (item.weight ?? (item.source === "practice" ? 1 : item.source === "lab" ? 3 : 4)), 0);
    return { skill, score: totalWeight ? Math.round(weighted / totalWeight) : 0, evidenceCount: relevant.length };
  });
}

export function weakestSkills(results: SkillResult[], count = 3) {
  return [...results].sort((a, b) => a.score - b.score || a.evidenceCount - b.evidenceCount || allSkills.indexOf(a.skill) - allSkills.indexOf(b.skill)).slice(0, count);
}

const recommendations: Record<Skill, { title: string; href: string; reason: string }> = {
  Discovery: { title: "Practice customer discovery", href: "/labs/discovery-workshop", reason: "Turn ambiguity into a measurable problem." },
  Architecture: { title: "Design enterprise RAG", href: "/labs/enterprise-rag-architecture", reason: "Practice constraints, identity, and trade-offs." },
  "Software Engineering": { title: "Verify a customer code change", href: "/learn/ai-native-engineering/agent-assisted-verification", reason: "Review claims and test the customer boundary." },
  "AI Engineering": { title: "Run the retrieval playground", href: "/experiments/retrieval-playground", reason: "Strengthen retrieval and AI-system judgment." },
  Data: { title: "Recover data freshness", href: "/learn/data-engineering/freshness-reconciliation", reason: "Trace source revisions, ownership, and reconciliation." },
  Security: { title: "Simulate prompt injection", href: "/experiments/prompt-injection-simulator", reason: "Practice boundaries for untrusted context." },
  Production: { title: "Investigate duplicate tickets", href: "/challenges/duplicate-ticket-incident", reason: "Use logs and destination evidence to reason about safe retries." },
  "Customer Delivery": { title: "Investigate low adoption", href: "/case-studies/northstar#low-trust", reason: "Connect software quality to workflow trust." },
  "Business Thinking": { title: "Model AI unit economics", href: "/experiments/ai-cost-calculator", reason: "Connect architecture to measurable value." },
};

export function recommendNext(results: SkillResult[]) {
  const weakest = weakestSkills(results, 1)[0];
  return { skill: weakest.skill, ...recommendations[weakest.skill] };
}
