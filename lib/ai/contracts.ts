import type { z } from "zod";

export type AIMode = "mock" | "live";

export type AIProviderName = "mock" | "anthropic";

export type AIUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type StructuredGenerationRequest<Output> = {
  systemPrompt: string;
  userPrompt: string;
  outputSchema: z.ZodType<Output>;
  mockOutput: Output;
  maxTokens: number;
};

export type StructuredGenerationResult<Output> = {
  output: Output;
  mode: AIMode;
  provider: AIProviderName;
  model: string;
  usage: AIUsage;
};

/**
 * Provider-neutral boundary for server-side model calls. Domain code supplies a
 * schema and receives validated data; provider SDK objects never cross it.
 */
export interface AIProvider {
  readonly mode: AIMode;
  readonly name: AIProviderName;
  readonly model: string;

  generateStructured<Output>(
    request: StructuredGenerationRequest<Output>,
  ): Promise<StructuredGenerationResult<Output>>;
}
