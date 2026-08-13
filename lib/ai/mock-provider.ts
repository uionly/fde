import type {
  AIProvider,
  StructuredGenerationRequest,
  StructuredGenerationResult,
} from "@/lib/ai/contracts";

const MOCK_MODEL = "deterministic-capstone-coach-v1";

function estimateTokens(value: string) {
  return Math.max(1, Math.ceil(value.length / 4));
}

export class MockAIProvider implements AIProvider {
  readonly mode = "mock" as const;
  readonly name = "mock" as const;
  readonly model = MOCK_MODEL;

  async generateStructured<Output>(
    request: StructuredGenerationRequest<Output>,
  ): Promise<StructuredGenerationResult<Output>> {
    const output = request.outputSchema.parse(request.mockOutput);

    return {
      output,
      mode: this.mode,
      provider: this.name,
      model: this.model,
      usage: {
        inputTokens: estimateTokens(`${request.systemPrompt}\n${request.userPrompt}`),
        outputTokens: estimateTokens(JSON.stringify(output)),
      },
    };
  }
}
