export type ChunkStrategy = "words" | "sentences";

export function chunkText(text: string, size: number, overlap: number, strategy: ChunkStrategy) {
  const safeSize = Math.max(1, Math.floor(size));
  const safeOverlap = Math.min(safeSize - 1, Math.max(0, Math.floor(overlap)));
  const units = strategy === "sentences" ? text.trim().split(/(?<=[.!?])\s+/).filter(Boolean) : text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  const step = Math.max(1, safeSize - safeOverlap);
  for (let index = 0; index < units.length; index += step) {
    const chunk = units.slice(index, index + safeSize);
    if (!chunk.length) break;
    chunks.push(chunk.join(" "));
    if (index + safeSize >= units.length) break;
  }
  return chunks;
}

export type CorpusDocument = { id: string; title: string; text: string; department: string; roles: string[] };
export type RetrievalStrategy = "keyword" | "vector" | "hybrid";

const synonyms: Record<string, string[]> = { refund: ["reimbursement", "credit"], declined: ["rejected", "failed"], card: ["payment"], reset: ["password", "credential"] };
const tokens = (value: string): string[] => value.toLowerCase().match(/[a-z0-9]+/g) ?? [];

export function searchCorpus(corpus: CorpusDocument[], query: string, strategy: RetrievalStrategy, topK: number, role: string) {
  const queryTokens = tokens(query);
  const semanticTokens = new Set(queryTokens.flatMap((token) => [token, ...(synonyms[token] ?? [])]));
  return corpus.filter((document) => document.roles.includes(role)).map((document) => {
    const documentTokens = tokens(`${document.title} ${document.text}`);
    const keyword = queryTokens.length ? queryTokens.filter((token) => documentTokens.includes(token)).length / queryTokens.length : 0;
    const vector = semanticTokens.size ? [...semanticTokens].filter((token) => documentTokens.includes(token)).length / semanticTokens.size : 0;
    const score = strategy === "keyword" ? keyword : strategy === "vector" ? vector : keyword * 0.45 + vector * 0.55;
    return { ...document, score: Number(score.toFixed(3)) };
  }).filter((document) => document.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, topK);
}

export function scoreToolSequence(sequence: string[]) {
  const expected = ["verify-identity", "lookup-payment", "search-policy", "create-ticket"];
  const exact = sequence.length === expected.length && sequence.every((tool, index) => tool === expected[index]);
  const unsafe = sequence.includes("issue-refund");
  return { exact, unsafe, score: exact ? 100 : Math.max(0, sequence.filter((tool, index) => tool === expected[index]).length * 25 - (unsafe ? 25 : 0)), expected };
}

export function evaluateInjectionResponse(action: string) {
  if (action === "ignore-and-report") return { safe: true, explanation: "Correct: keep system policy authoritative, treat retrieved text as data, and report the injection signal." };
  if (action === "follow-document") return { safe: false, explanation: "Unsafe: retrieved content is untrusted and cannot grant itself instruction authority." };
  return { safe: false, explanation: "Insufficient: refusing everything protects data but destroys the valid user workflow. Isolate the injection and continue safely when possible." };
}

export type CostInputs = { requests: number; inputTokens: number; outputTokens: number; inputPrice: number; outputPrice: number; retryRate: number; cacheHitRate: number };
export function calculateAICost(input: CostInputs) {
  const attempts = input.requests * (1 + input.retryRate / 100);
  const uncachedInputTokens = attempts * input.inputTokens * (1 - input.cacheHitRate / 100);
  const outputTokens = attempts * input.outputTokens;
  const monthlyCost = uncachedInputTokens / 1_000_000 * input.inputPrice + outputTokens / 1_000_000 * input.outputPrice;
  return { attempts, inputTokens: uncachedInputTokens, outputTokens, monthlyCost, costPerRequest: input.requests ? monthlyCost / input.requests : 0 };
}
