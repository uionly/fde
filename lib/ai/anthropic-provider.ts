import "server-only";

import Anthropic, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import type {
  AIProvider,
  StructuredGenerationRequest,
  StructuredGenerationResult,
} from "@/lib/ai/contracts";
import { AIProviderError } from "@/lib/ai/errors";

const DEFAULT_TIMEOUT_MS = 30_000;

type AnthropicProviderOptions = {
  apiKey: string;
  model: string;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
};

function retryAfterSeconds(error: RateLimitError) {
  const retryAfter = error.headers.get("retry-after");
  if (!retryAfter) return undefined;

  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : undefined;
}

function mapAnthropicError(error: unknown): AIProviderError {
  if (error instanceof RateLimitError) {
    return new AIProviderError("rate_limited", "The AI coach is busy. Please try again shortly.", {
      retryable: true,
      retryAfterSeconds: retryAfterSeconds(error),
      cause: error,
    });
  }

  if (error instanceof APIConnectionTimeoutError) {
    return new AIProviderError("timeout", "The AI coach took too long to respond.", {
      retryable: true,
      cause: error,
    });
  }

  if (error instanceof APIConnectionError) {
    return new AIProviderError("provider_unavailable", "The AI coach is temporarily unavailable.", {
      retryable: true,
      cause: error,
    });
  }

  if (error instanceof APIError) {
    const retryable = error.status === undefined || error.status >= 500;
    return new AIProviderError("provider_unavailable", "The AI coach could not complete this review.", {
      retryable,
      cause: error,
    });
  }

  return new AIProviderError("provider_unavailable", "The AI coach could not complete this review.", {
    retryable: true,
    cause: error,
  });
}

export class AnthropicAIProvider implements AIProvider {
  readonly mode = "live" as const;
  readonly name = "anthropic" as const;
  readonly model: string;

  private readonly client: Anthropic;
  private readonly timeoutMs: number;

  constructor({ apiKey, model, timeoutMs = DEFAULT_TIMEOUT_MS, fetch }: AnthropicProviderOptions) {
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.client = new Anthropic({
      apiKey,
      maxRetries: 0,
      timeout: timeoutMs,
      fetch,
    });
  }

  async generateStructured<Output>(
    request: StructuredGenerationRequest<Output>,
  ): Promise<StructuredGenerationResult<Output>> {
    try {
      // No tools are supplied. Coaching is a single, non-streaming review call.
      const message = await this.client.messages.create(
        {
          model: this.model,
          max_tokens: request.maxTokens,
          system: request.systemPrompt,
          messages: [{ role: "user", content: request.userPrompt }],
          output_config: { format: zodOutputFormat(request.outputSchema) },
        },
        { maxRetries: 0, timeout: this.timeoutMs },
      );

      if (message.stop_reason === "refusal") {
        throw new AIProviderError("refused", "The AI coach could not review this entry.");
      }

      if (
        message.stop_reason === "max_tokens" ||
        message.stop_reason === "model_context_window_exceeded"
      ) {
        throw new AIProviderError("truncated", "The AI coach response was incomplete. Please try a shorter entry.", {
          retryable: true,
        });
      }

      const text = message.content.find((block) => block.type === "text")?.text;
      if (!text) {
        throw new AIProviderError("invalid_response", "The AI coach returned an invalid review.", {
          retryable: true,
        });
      }

      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch (error) {
        throw new AIProviderError("invalid_response", "The AI coach returned an invalid review.", {
          retryable: true,
          cause: error,
        });
      }

      const parsed = request.outputSchema.safeParse(json);
      if (!parsed.success) {
        throw new AIProviderError("invalid_response", "The AI coach returned an invalid review.", {
          retryable: true,
        });
      }

      return {
        output: parsed.data,
        mode: this.mode,
        provider: this.name,
        model: message.model,
        usage: {
          inputTokens:
            message.usage.input_tokens +
            (message.usage.cache_creation_input_tokens ?? 0) +
            (message.usage.cache_read_input_tokens ?? 0),
          outputTokens: message.usage.output_tokens,
        },
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw mapAnthropicError(error);
    }
  }
}
