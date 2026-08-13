export type Attempt = { questionId: string; answer: string[]; correct: boolean; score: number; createdAt: Date };
const globalAttempts = globalThis as unknown as { developmentAttempts?: Map<string, Attempt[]> };
const memoryAttempts = globalAttempts.developmentAttempts ?? new Map<string, Attempt[]>();
if (process.env.NODE_ENV !== "production") globalAttempts.developmentAttempts = memoryAttempts;

export async function savePracticeAttempt(input: { userId: string; email?: string | null; name?: string | null; questionId: string; answer: string[]; correct: boolean; score: number }) {
  if (!process.env.DATABASE_URL) {
    const attempts = memoryAttempts.get(input.userId) ?? [];
    const attempt = { questionId: input.questionId, answer: input.answer, correct: input.correct, score: input.score, createdAt: new Date() };
    attempts.push(attempt);
    memoryAttempts.set(input.userId, attempts);
    return attempt;
  }
  const { prisma } = await import("@/lib/db/prisma");
  await prisma.user.upsert({ where: { id: input.userId }, update: { email: input.email, name: input.name }, create: { id: input.userId, email: input.email, name: input.name } });
  return prisma.practiceAttempt.create({ data: { userId: input.userId, questionId: input.questionId, answerJson: input.answer, correct: input.correct, score: input.score } });
}

export async function getPracticeAttempts(userId: string) {
  if (!process.env.DATABASE_URL) return memoryAttempts.get(userId) ?? [];
  const { prisma } = await import("@/lib/db/prisma");
  const records = await prisma.practiceAttempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return records.map((record): Attempt => ({ questionId: record.questionId, answer: record.answerJson as string[], correct: record.correct, score: record.score, createdAt: record.createdAt }));
}
