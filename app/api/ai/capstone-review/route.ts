import type { CapstonePhase } from "@/lib/content/schemas";
import { auditCapstoneAIRequest } from "@/lib/ai/audit";
import { getCapstonePhaseById } from "@/lib/content/loaders";
import { evaluateCapstonePhase } from "@/lib/capstone/evaluator";
import { reviewCapstonePhase, type ResolvedCapstoneReviewContext } from "@/lib/ai/capstone-coach";
import {
  capstoneReviewErrorResponseSchema,
  capstoneReviewRequestSchema,
  type CapstoneReviewApiErrorCode,
  type CapstoneReviewRequest,
} from "@/lib/ai/capstone-schemas";
import { AIProviderError } from "@/lib/ai/errors";
import { createAIProvider } from "@/lib/ai/provider";
import { consumeRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const responseHeaders = { "Cache-Control": "no-store" };

function errorResponse(
  code: CapstoneReviewApiErrorCode,
  message: string,
  status: number,
  options: { retryable?: boolean; retryAfterSeconds?: number; headers?: HeadersInit } = {},
) {
  const body = capstoneReviewErrorResponseSchema.parse({
    error: {
      code,
      message,
      retryable: options.retryable ?? false,
      ...(options.retryAfterSeconds === undefined
        ? {}
        : { retryAfterSeconds: options.retryAfterSeconds }),
    },
  });
  const headers = new Headers(responseHeaders);
  if (options.headers) {
    new Headers(options.headers).forEach((value, name) => headers.set(name, value));
  }
  if (options.retryAfterSeconds !== undefined) {
    headers.set("Retry-After", String(options.retryAfterSeconds));
  }
  return Response.json(body, { status, headers });
}

function requestAddress(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 100);
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwardedIp || "local-visitor").slice(0, 100);
}

function validateAndResolveSubmission(phase: CapstonePhase, request: CapstoneReviewRequest) {
  const controlsById = new Map(phase.controls.map((control) => [control.id, control]));

  for (const selection of request.selections) {
    const control = controlsById.get(selection.decisionId);
    if (!control) return undefined;
    if (selection.optionIds.length > control.maxSelections) return undefined;
    const optionIds = new Set(control.options.map((option) => option.id));
    if (selection.optionIds.some((optionId) => !optionIds.has(optionId))) return undefined;
  }

  const selections = Object.fromEntries(
    request.selections.map((selection) => [selection.decisionId, selection.optionIds]),
  );
  const evaluation = evaluateCapstonePhase(phase, {
    selections,
    reasoning: request.learnerNotes,
  });

  const rubric = Object.entries(phase.rubric).map(([dimension, criterion]) => ({
    dimension: dimension as keyof typeof phase.rubric,
    criteria: [criterion],
  }));
  const decisions = request.selections.map((selection) => {
    const control = controlsById.get(selection.decisionId)!;
    const selectedOptions = selection.optionIds.map((optionId) => {
      const option = control.options.find((candidate) => candidate.id === optionId)!;
      return `${option.label}: ${option.description}`;
    });
    return { prompt: control.prompt, selectedOptions };
  });

  return {
    phaseId: phase.id,
    phaseTitle: phase.title,
    customerContext: `${phase.context}\n\nProgressive reveal: ${phase.reveal}`,
    objective: phase.prompt,
    learnerNotes: request.learnerNotes,
    decisions,
    rubric,
    deterministicScores: evaluation.dimensions,
  } satisfies ResolvedCapstoneReviewContext;
}

function providerErrorResponse(error: AIProviderError, headers: HeadersInit) {
  const statusByCode = {
    not_configured: 503,
    rate_limited: 429,
    timeout: 504,
    refused: 422,
    truncated: 502,
    invalid_response: 502,
    provider_unavailable: 503,
  } as const;
  return errorResponse(error.code, error.message, statusByCode[error.code], {
    retryable: error.retryable,
    retryAfterSeconds: error.retryAfterSeconds,
    headers,
  });
}

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(`capstone-review:${requestAddress(request)}`, {
    limit: RATE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  const rateHeaders = {
    "X-RateLimit-Limit": String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
  };
  if (!rateLimit.allowed) {
    return errorResponse("rate_limited", "Too many coaching requests. Please try again shortly.", 429, {
      retryable: true,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      headers: rateHeaders,
    });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return errorResponse("request_too_large", "The coaching request is too large.", 413, {
      headers: rateHeaders,
    });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse("invalid_request", "The request body could not be read.", 400, {
      headers: rateHeaders,
    });
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse("request_too_large", "The coaching request is too large.", 413, {
      headers: rateHeaders,
    });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return errorResponse("invalid_request", "Send a valid JSON coaching request.", 400, {
      headers: rateHeaders,
    });
  }

  const parsedRequest = capstoneReviewRequestSchema.safeParse(json);
  if (!parsedRequest.success) {
    return errorResponse(
      "invalid_request",
      "Provide a valid phase, structured selections, and 20–6,000 characters of reasoning.",
      400,
      { headers: rateHeaders },
    );
  }

  const phase = getCapstonePhaseById(parsedRequest.data.phaseId);
  if (!phase) {
    return errorResponse("phase_not_found", "That capstone phase does not exist.", 404, {
      headers: rateHeaders,
    });
  }

  const context = validateAndResolveSubmission(phase, parsedRequest.data);
  if (!context) {
    return errorResponse("invalid_selection", "One or more selections do not belong to this capstone phase.", 400, {
      headers: rateHeaders,
    });
  }

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  auditCapstoneAIRequest({ event: "requested", phaseId: phase.id, requestId });

  try {
    const provider = await createAIProvider();
    const review = await reviewCapstonePhase(provider, context);
    auditCapstoneAIRequest({
      durationMs: Date.now() - startedAt,
      event: "completed",
      inputTokens: review.usage.inputTokens,
      model: review.model,
      outputTokens: review.usage.outputTokens,
      phaseId: phase.id,
      requestId,
    });
    return Response.json(review, {
      status: 200,
      headers: { ...responseHeaders, ...rateHeaders },
    });
  } catch (error) {
    if (error instanceof AIProviderError) {
      auditCapstoneAIRequest({
        durationMs: Date.now() - startedAt,
        errorCode: error.code,
        event: "failed",
        phaseId: phase.id,
        requestId,
      });
      return providerErrorResponse(error, rateHeaders);
    }
    auditCapstoneAIRequest({
      durationMs: Date.now() - startedAt,
      errorCode: "unknown",
      event: "failed",
      phaseId: phase.id,
      requestId,
    });
    return errorResponse("provider_unavailable", "The AI coach could not complete this review.", 503, {
      retryable: true,
      headers: rateHeaders,
    });
  }
}
