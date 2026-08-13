// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AnthropicAIProvider } from "@/lib/ai/anthropic-provider";
import { capstoneCoachOutputSchema, type CapstoneCoachOutput } from "@/lib/ai/capstone-schemas";

const output: CapstoneCoachOutput = {
  summary: "The field decision is bounded and evidence-oriented.",
  scores: { customerAlignment: 88, architecture: 82, safety: 85, deliveryReadiness: 80 },
  strengths: ["The workflow and owner are explicit."],
  gaps: ["The rollback trigger still needs a threshold."],
  questions: ["Which evidence would stop the rollout?"],
  recommendedNextStep: "Define the rollback threshold with the support owner.",
};

function anthropicMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-test-model",
    content: [{ type: "text", text: JSON.stringify(output) }],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 120, output_tokens: 80 },
    ...overrides,
  };
}

function generationRequest() {
  return {
    systemPrompt: "Review one capstone phase.",
    userPrompt: '{"learnerSubmission":{"notes":"Bound the release."}}',
    outputSchema: capstoneCoachOutputSchema,
    mockOutput: output,
    maxTokens: 1_200,
  };
}

describe("AnthropicAIProvider", () => {
  it("makes one non-streaming structured-output request without tools", async () => {
    let sentBody: Record<string, unknown> | undefined;
    const providerFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      sentBody = (await request.json()) as Record<string, unknown>;
      return Response.json(anthropicMessage(), { headers: { "request-id": "req_test" } });
    }) as typeof fetch;
    const provider = new AnthropicAIProvider({
      apiKey: "test-key-not-a-secret",
      model: "claude-test-model",
      fetch: providerFetch,
    });

    const result = await provider.generateStructured(generationRequest());

    expect(providerFetch).toHaveBeenCalledTimes(1);
    expect(sentBody).toMatchObject({
      model: "claude-test-model",
      max_tokens: 1_200,
      system: generationRequest().systemPrompt,
      output_config: { format: { type: "json_schema" } },
    });
    expect(sentBody).not.toHaveProperty("tools");
    expect(sentBody).not.toHaveProperty("stream", true);
    expect(result).toMatchObject({
      output,
      mode: "live",
      provider: "anthropic",
      model: "claude-test-model",
      usage: { inputTokens: 120, outputTokens: 80 },
    });
  });

  it("turns refusals and truncation into typed safe errors", async () => {
    const refusalFetch = vi.fn(async () =>
      Response.json(
        anthropicMessage({
          content: [{ type: "text", text: "I cannot review this request." }],
          stop_reason: "refusal",
        }),
      ),
    ) as typeof fetch;
    const truncationFetch = vi.fn(async () =>
      Response.json(anthropicMessage({ stop_reason: "max_tokens" })),
    ) as typeof fetch;

    await expect(
      new AnthropicAIProvider({ apiKey: "test", model: "test", fetch: refusalFetch }).generateStructured(
        generationRequest(),
      ),
    ).rejects.toMatchObject({ code: "refused", retryable: false });
    await expect(
      new AnthropicAIProvider({ apiKey: "test", model: "test", fetch: truncationFetch }).generateStructured(
        generationRequest(),
      ),
    ).rejects.toMatchObject({ code: "truncated", retryable: true });
  });

  it("preserves provider retry guidance without exposing provider messages", async () => {
    const providerFetch = vi.fn(async () =>
      Response.json(
        { type: "error", error: { type: "rate_limit_error", message: "internal provider detail" } },
        { status: 429, headers: { "retry-after": "7", "request-id": "req_rate" } },
      ),
    ) as typeof fetch;

    await expect(
      new AnthropicAIProvider({ apiKey: "test", model: "test", fetch: providerFetch }).generateStructured(
        generationRequest(),
      ),
    ).rejects.toMatchObject({
      code: "rate_limited",
      message: "The AI coach is busy. Please try again shortly.",
      retryable: true,
      retryAfterSeconds: 7,
    });
  });
});
