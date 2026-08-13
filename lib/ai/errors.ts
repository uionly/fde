export const aiErrorCodes = [
  "not_configured",
  "rate_limited",
  "timeout",
  "refused",
  "truncated",
  "invalid_response",
  "provider_unavailable",
] as const;

export type AIErrorCode = (typeof aiErrorCodes)[number];

export class AIProviderError extends Error {
  readonly code: AIErrorCode;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number;

  constructor(
    code: AIErrorCode,
    message: string,
    options: { retryable?: boolean; retryAfterSeconds?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AIProviderError";
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}
