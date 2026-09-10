import { z } from "zod";

import { difficultySchema, referenceSourceSchema, skillSchema, slugSchema } from "@/lib/content/schemas";

const positionSchema = z.object({ x: z.number().min(-5000).max(5000), y: z.number().min(-5000).max(5000) }).strict();
export const architectureGraphSchema = z.object({
  nodes: z.array(z.object({ id: slugSchema, position: positionSchema }).strict()).max(24),
  edges: z.array(z.object({ source: slugSchema, target: slugSchema }).strict()).max(64),
}).strict().superRefine((graph, ctx) => {
  const ids = graph.nodes.map((node) => node.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Node IDs must be unique" });
  const edges = graph.edges.map((edge) => `${edge.source}:${edge.target}`);
  if (new Set(edges).size !== edges.length) ctx.addIssue({ code: "custom", message: "Connections must be unique" });
  if (graph.edges.some((edge) => !ids.includes(edge.source) || !ids.includes(edge.target) || edge.source === edge.target)) ctx.addIssue({ code: "custom", message: "Connections must reference two distinct existing nodes" });
});

const optionSchema = z.object({ id: slugSchema, label: z.string().min(5), explanation: z.string().min(15) });
const base = {
  id: slugSchema, title: z.string().min(5), description: z.string().min(20),
  customer: z.string().min(5), difficulty: difficultySchema, estimatedMinutes: z.number().int().positive(),
  skills: z.array(skillSchema).min(1), relatedLessons: z.array(slugSchema).min(1),
  reviewedAt: z.iso.date(), sources: z.array(referenceSourceSchema).min(1),
  hint: z.string().min(20), expertReasoning: z.string().min(40),
};
export const debugChallengeSchema = z.object({
  ...base, kind: z.literal("debugging"),
  evidence: z.array(z.object({ id: slugSchema, title: z.string().min(3), type: z.enum(["ticket", "architecture", "logs", "metrics", "configuration", "api", "data"]), body: z.string().min(20) })).min(4),
  causes: z.array(optionSchema).min(3), remediations: z.array(optionSchema).min(3),
  correctCause: slugSchema, correctRemediation: slugSchema, requiredEvidence: z.array(slugSchema).min(2),
}).superRefine((challenge, ctx) => {
  for (const items of [challenge.evidence, challenge.causes, challenge.remediations]) if (new Set(items.map((item) => item.id)).size !== items.length) ctx.addIssue({ code: "custom", message: "Challenge IDs must be unique within each collection" });
  if (!challenge.causes.some((item) => item.id === challenge.correctCause) || !challenge.remediations.some((item) => item.id === challenge.correctRemediation) || challenge.requiredEvidence.some((id) => !challenge.evidence.some((item) => item.id === id))) ctx.addIssue({ code: "custom", message: "Answers must reference authored evidence and options" });
});

export const architectureChallengeSchema = z.object({
  ...base, kind: z.literal("architecture"),
  catalog: z.array(z.object({ id: slugSchema, label: z.string().min(2), responsibility: z.string().min(10) })).min(4).max(24),
  starter: architectureGraphSchema,
  example: architectureGraphSchema,
  rules: z.array(z.discriminatedUnion("type", [
    z.object({ id: slugSchema, type: z.literal("node"), node: slugSchema, message: z.string().min(10) }),
    z.object({ id: slugSchema, type: z.literal("path"), from: slugSchema, to: slugSchema, message: z.string().min(10) }),
    z.object({ id: slugSchema, type: z.literal("boundary"), from: slugSchema, to: slugSchema, via: z.array(slugSchema).min(1), message: z.string().min(10) }),
  ])).min(4),
}).superRefine((challenge, ctx) => {
  const ids = challenge.catalog.map((node) => node.id);
  if (new Set(ids).size !== ids.length || new Set(challenge.rules.map((rule) => rule.id)).size !== challenge.rules.length) ctx.addIssue({ code: "custom", message: "Catalog and rule IDs must be unique" });
  const referenced = challenge.rules.flatMap((rule) => rule.type === "node" ? [rule.node] : rule.type === "path" ? [rule.from, rule.to] : [rule.from, rule.to, ...rule.via]);
  if ([...referenced, ...challenge.starter.nodes.map((node) => node.id), ...challenge.example.nodes.map((node) => node.id)].some((id) => !ids.includes(id))) ctx.addIssue({ code: "custom", message: "Rules and graphs must reference catalog nodes" });
});
export const challengeSchema = z.discriminatedUnion("kind", [debugChallengeSchema, architectureChallengeSchema]);
export const challengeDraftSchema = z.object({
  reasoning: z.string().max(10000).default(""),
  cause: z.string().max(100).default(""), remediation: z.string().max(100).default(""),
  evidence: z.array(slugSchema).max(20).default([]),
  graph: architectureGraphSchema.default({ nodes: [], edges: [] }),
}).strict();
export type Challenge = z.infer<typeof challengeSchema>;
export type ArchitectureChallenge = z.infer<typeof architectureChallengeSchema>;
export type ArchitectureGraph = z.infer<typeof architectureGraphSchema>;
export type ChallengeDraft = z.infer<typeof challengeDraftSchema>;
