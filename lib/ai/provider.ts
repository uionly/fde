import type { AIProvider } from "@/lib/ai/contracts";
import { AIProviderError } from "@/lib/ai/errors";
import { MockAIProvider } from "@/lib/ai/mock-provider";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

type AIEnvironment = Partial<
  Record<"AI_MODE" | "AI_PROVIDER" | "ANTHROPIC_API_KEY" | "ANTHROPIC_MODEL", string | undefined>
>;

export async function createAIProvider(environment?: AIEnvironment): Promise<AIProvider> {
  const config: NodeJS.ProcessEnv | AIEnvironment = environment ?? process.env;
  const mode = config.AI_MODE?.trim().toLowerCase() || "mock";

  if (mode === "mock") return new MockAIProvider();

  if (mode !== "live") {
    throw new AIProviderError("not_configured", "AI_MODE must be either mock or live.");
  }

  const providerName = config.AI_PROVIDER?.trim().toLowerCase() || "anthropic";
  if (providerName !== "anthropic") {
    throw new AIProviderError("not_configured", "AI_PROVIDER must be anthropic when AI_MODE is live.");
  }

  const apiKey = config.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new AIProviderError(
      "not_configured",
      "Live AI coaching is not configured. Add ANTHROPIC_API_KEY on the server or use AI_MODE=mock.",
    );
  }

  // Keep the SDK and API key in a server-only module that is loaded only in live mode.
  const { AnthropicAIProvider } = await import("@/lib/ai/anthropic-provider");
  return new AnthropicAIProvider({
    apiKey,
    model: config.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL,
  });
}
