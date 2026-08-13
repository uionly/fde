import { z } from "zod";

import { capstonePhaseIdSchema } from "@/lib/content/schemas";

export const capstoneProgressStorageKey = "fde-learning-lab-capstone-progress-v1";
export const capstoneProgressEventName = "fde:capstone-progress-updated";

const timestampSchema = z.iso.datetime({ offset: true });
const identifierSchema = z.string().trim().min(1).max(120);
const scoreSchema = z.number().finite().min(0).max(100);
const feedbackListSchema = z.array(z.string().trim().min(1).max(500)).max(8);

export const capstoneDimensionScoresSchema = z
  .object({
    customerAlignment: scoreSchema,
    architecture: scoreSchema,
    safety: scoreSchema,
    deliveryReadiness: scoreSchema,
  })
  .strict();

export const capstoneDeterministicEvaluationSchema = z
  .object({
    overall: scoreSchema,
    dimensions: capstoneDimensionScoresSchema,
    strengths: feedbackListSchema,
    gaps: feedbackListSchema,
    evaluatedAt: timestampSchema,
  })
  .strict();

export const capstoneAIReviewSchema = z
  .object({
    provider: z.enum(["mock", "anthropic"]),
    model: z.string().trim().min(1).max(120),
    mode: z.enum(["mock", "live"]),
    summary: z.string().trim().min(1).max(2_000),
    scores: capstoneDimensionScoresSchema,
    strengths: feedbackListSchema,
    gaps: feedbackListSchema,
    questions: feedbackListSchema,
    recommendedNextStep: z.string().trim().min(1).max(2_000),
    usage: z
      .object({
        inputTokens: z.number().int().nonnegative().max(1_000_000),
        outputTokens: z.number().int().nonnegative().max(1_000_000),
      })
      .strict(),
    reviewedAt: timestampSchema,
  })
  .strict();

const capstoneSelectionsSchema = z
  .record(identifierSchema, z.array(identifierSchema).max(12))
  .superRefine((selections, context) => {
    if (Object.keys(selections).length > 20) {
      context.addIssue({ code: "custom", message: "a phase can contain at most 20 decision prompts" });
    }
    for (const [promptId, values] of Object.entries(selections)) {
      if (new Set(values).size !== values.length) {
        context.addIssue({ code: "custom", message: "selection ids must be unique", path: [promptId] });
      }
    }
  });

export const capstonePhaseProgressSchema = z
  .object({
    phaseId: capstonePhaseIdSchema,
    selections: capstoneSelectionsSchema,
    reasoning: z.string().max(6_000),
    deterministicEvaluation: capstoneDeterministicEvaluationSchema.nullable(),
    completed: z.boolean(),
    aiReview: capstoneAIReviewSchema.nullable(),
    updatedAt: timestampSchema,
  })
  .strict()
  .superRefine((phase, context) => {
    if (phase.completed && !phase.deterministicEvaluation) {
      context.addIssue({
        code: "custom",
        message: "a completed phase requires a deterministic evaluation",
        path: ["deterministicEvaluation"],
      });
    }
  });

export const capstoneProgressSchema = z
  .object({
    version: z.literal(1),
    currentPhaseId: capstonePhaseIdSchema.nullable(),
    phases: z.record(identifierSchema, capstonePhaseProgressSchema),
    updatedAt: timestampSchema,
  })
  .strict()
  .superRefine((progress, context) => {
    const phaseEntries = Object.entries(progress.phases);
    if (phaseEntries.length > 12) {
      context.addIssue({ code: "custom", message: "capstone can contain at most 12 phases", path: ["phases"] });
    }
    for (const [phaseId, phase] of phaseEntries) {
      if (!capstonePhaseIdSchema.safeParse(phaseId).success) {
        context.addIssue({ code: "custom", message: "unknown capstone phase", path: ["phases", phaseId] });
      }
      if (phase.phaseId !== phaseId) {
        context.addIssue({ code: "custom", message: "phase record key must match phaseId", path: ["phases", phaseId, "phaseId"] });
      }
    }
  });

export type CapstoneDimensionScores = z.infer<typeof capstoneDimensionScoresSchema>;
export type CapstoneDeterministicEvaluation = z.infer<typeof capstoneDeterministicEvaluationSchema>;
export type CapstoneAIReview = z.infer<typeof capstoneAIReviewSchema>;
export type CapstonePhaseProgress = z.infer<typeof capstonePhaseProgressSchema>;
export type CapstoneProgress = z.infer<typeof capstoneProgressSchema>;
export type CapstonePhaseProgressInput = {
  phaseId: string;
  selections?: Record<string, string[]>;
  reasoning?: string;
  deterministicEvaluation?: CapstoneDeterministicEvaluation | null;
  completed?: boolean;
  aiReview?: CapstoneAIReview | null;
  updatedAt?: string;
};

export const emptyCapstoneProgress: CapstoneProgress = {
  version: 1,
  currentPhaseId: null,
  phases: {},
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function parseCapstoneProgress(value: unknown): CapstoneProgress {
  const parsed = capstoneProgressSchema.safeParse(value);
  return parsed.success ? parsed.data : emptyCapstoneProgress;
}

function emitCapstoneProgressUpdated() {
  window.dispatchEvent(new CustomEvent(capstoneProgressEventName));
}

function writeCapstoneProgress(progress: CapstoneProgress) {
  if (typeof window === "undefined") return false;
  const parsed = capstoneProgressSchema.safeParse(progress);
  if (!parsed.success) return false;

  try {
    window.localStorage.setItem(capstoneProgressStorageKey, JSON.stringify(parsed.data));
    emitCapstoneProgressUpdated();
    return true;
  } catch {
    return false;
  }
}

export function readCapstoneProgress(): CapstoneProgress {
  if (typeof window === "undefined") return emptyCapstoneProgress;

  try {
    const stored = window.localStorage.getItem(capstoneProgressStorageKey);
    return stored ? parseCapstoneProgress(JSON.parse(stored)) : emptyCapstoneProgress;
  } catch {
    return emptyCapstoneProgress;
  }
}

export function readCapstonePhaseProgress(phaseId: string): CapstonePhaseProgress | null {
  return readCapstoneProgress().phases[phaseId] ?? null;
}

export function writeCapstonePhaseProgress(input: CapstonePhaseProgressInput) {
  const progress = readCapstoneProgress();
  const existing = progress.phases[input.phaseId];
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  const record = capstonePhaseProgressSchema.safeParse({
    phaseId: input.phaseId,
    selections: input.selections ?? existing?.selections ?? {},
    reasoning: input.reasoning ?? existing?.reasoning ?? "",
    deterministicEvaluation: input.deterministicEvaluation !== undefined
      ? input.deterministicEvaluation
      : existing?.deterministicEvaluation ?? null,
    completed: input.completed ?? existing?.completed ?? false,
    aiReview: input.aiReview !== undefined ? input.aiReview : existing?.aiReview ?? null,
    updatedAt,
  });
  if (!record.success) return false;

  return writeCapstoneProgress({
    ...progress,
    currentPhaseId: record.data.phaseId,
    phases: { ...progress.phases, [record.data.phaseId]: record.data },
    updatedAt,
  });
}

export function setCurrentCapstonePhase(phaseId: string | null, updatedAt = new Date().toISOString()) {
  const parsedPhaseId = capstonePhaseIdSchema.nullable().safeParse(phaseId);
  if (!parsedPhaseId.success || !timestampSchema.safeParse(updatedAt).success) return false;

  return writeCapstoneProgress({
    ...readCapstoneProgress(),
    currentPhaseId: parsedPhaseId.data,
    updatedAt,
  });
}

export function clearCapstoneProgress() {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(capstoneProgressStorageKey);
    emitCapstoneProgressUpdated();
    return true;
  } catch {
    return false;
  }
}

export function subscribeCapstoneProgress(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === capstoneProgressStorageKey || event.key === null) listener();
  };
  window.addEventListener(capstoneProgressEventName, listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(capstoneProgressEventName, listener);
    window.removeEventListener("storage", handleStorage);
  };
}
