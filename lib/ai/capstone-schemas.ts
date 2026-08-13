import { z } from "zod";

import { aiErrorCodes } from "@/lib/ai/errors";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Use a lowercase, hyphenated identifier.");

export const capstoneSelectionSchema = z
  .object({
    decisionId: identifierSchema,
    optionIds: z.array(identifierSchema).min(1).max(8),
  })
  .strict()
  .superRefine((selection, context) => {
    if (new Set(selection.optionIds).size !== selection.optionIds.length) {
      context.addIssue({
        code: "custom",
        message: "A decision cannot include the same option more than once.",
        path: ["optionIds"],
      });
    }
  });

export const capstoneReviewRequestSchema = z
  .object({
    phaseId: identifierSchema,
    learnerNotes: z.string().trim().min(20).max(6_000),
    selections: z.array(capstoneSelectionSchema).min(1).max(12),
  })
  .strict()
  .superRefine((request, context) => {
    const decisionIds = request.selections.map((selection) => selection.decisionId);
    if (new Set(decisionIds).size !== decisionIds.length) {
      context.addIssue({
        code: "custom",
        message: "Each decision may appear only once.",
        path: ["selections"],
      });
    }
  });

const feedbackItemSchema = z.string().trim().min(1).max(280);

export const capstoneCoachScoresSchema = z
  .object({
    customerAlignment: z.number().int().min(0).max(100),
    architecture: z.number().int().min(0).max(100),
    safety: z.number().int().min(0).max(100),
    deliveryReadiness: z.number().int().min(0).max(100),
  })
  .strict();

/** The exact schema constrained at the model boundary and revalidated locally. */
export const capstoneCoachOutputSchema = z
  .object({
    summary: z.string().trim().min(1).max(700),
    scores: capstoneCoachScoresSchema,
    strengths: z.array(feedbackItemSchema).min(1).max(4),
    gaps: z.array(feedbackItemSchema).min(1).max(4),
    questions: z.array(feedbackItemSchema).min(1).max(4),
    recommendedNextStep: z.string().trim().min(1).max(360),
  })
  .strict();

export const capstoneReviewResponseSchema = capstoneCoachOutputSchema.extend({
  mode: z.enum(["mock", "live"]),
  provider: z.enum(["mock", "anthropic"]),
  model: z.string().min(1).max(120),
  usage: z
    .object({
      inputTokens: z.number().int().nonnegative(),
      outputTokens: z.number().int().nonnegative(),
    })
    .strict(),
});

export const capstoneReviewApiErrorCodes = [
  "invalid_request",
  "request_too_large",
  "phase_not_found",
  "invalid_selection",
  ...aiErrorCodes,
] as const;

export const capstoneReviewErrorResponseSchema = z
  .object({
    error: z
      .object({
        code: z.enum(capstoneReviewApiErrorCodes),
        message: z.string().min(1).max(300),
        retryable: z.boolean(),
        retryAfterSeconds: z.number().int().nonnegative().optional(),
      })
      .strict(),
  })
  .strict();

export type CapstoneSelection = z.infer<typeof capstoneSelectionSchema>;
export type CapstoneReviewRequest = z.infer<typeof capstoneReviewRequestSchema>;
export type CapstoneCoachScores = z.infer<typeof capstoneCoachScoresSchema>;
export type CapstoneCoachOutput = z.infer<typeof capstoneCoachOutputSchema>;
export type CapstoneReviewResponse = z.infer<typeof capstoneReviewResponseSchema>;
export type CapstoneReviewErrorResponse = z.infer<typeof capstoneReviewErrorResponseSchema>;
export type CapstoneReviewApiErrorCode = (typeof capstoneReviewApiErrorCodes)[number];
