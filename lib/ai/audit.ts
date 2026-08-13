import "server-only";

import type { AIErrorCode } from "@/lib/ai/errors";

type CapstoneAIAuditRecord = {
  requestId: string;
  phaseId: string;
  event: "requested" | "completed" | "failed";
  durationMs?: number;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  errorCode?: AIErrorCode | "unknown";
};

/**
 * Emits metadata-only live-provider audit records to the server log. Learner
 * notes, selected labels, prompts, IP addresses, and secrets are never logged.
 */
export function auditCapstoneAIRequest(record: CapstoneAIAuditRecord) {
  if (process.env.AI_MODE?.trim().toLowerCase() !== "live") return;

  console.info("[capstone-ai-audit]", JSON.stringify({
    ...record,
    provider: "anthropic",
    timestamp: new Date().toISOString(),
  }));
}
