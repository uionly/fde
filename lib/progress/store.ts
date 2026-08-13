import type { ProgressRecord } from "@/lib/progress/types";

type MemoryStore = Map<string, ProgressRecord>;
const globalProgress = globalThis as unknown as { developmentProgress?: MemoryStore };
const memoryStore = globalProgress.developmentProgress ?? new Map<string, ProgressRecord>();
if (process.env.NODE_ENV !== "production") globalProgress.developmentProgress = memoryStore;

function key(userId: string, lessonId: string) {
  return `${userId}:${lessonId}`;
}

export async function getProgressForUser(userId: string): Promise<ProgressRecord[]> {
  if (!process.env.DATABASE_URL) return [...memoryStore.entries()].filter(([entryKey]) => entryKey.startsWith(`${userId}:`)).map(([, record]) => record);
  const { prisma } = await import("@/lib/db/prisma");
  return prisma.lessonProgress.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function saveLessonProgress(input: { userId: string; email?: string | null; name?: string | null; lessonId: string; trackSlug: string; complete: boolean }): Promise<ProgressRecord> {
  const now = new Date();
  if (!process.env.DATABASE_URL) {
    const existing = memoryStore.get(key(input.userId, input.lessonId));
    const record: ProgressRecord = {
      lessonId: input.lessonId,
      trackSlug: input.trackSlug,
      status: input.complete ? "COMPLETED" : "STARTED",
      startedAt: existing?.startedAt ?? now,
      completedAt: input.complete ? now : null,
      updatedAt: now,
      timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    };
    memoryStore.set(key(input.userId, input.lessonId), record);
    return record;
  }

  const { prisma } = await import("@/lib/db/prisma");
  await prisma.user.upsert({ where: { id: input.userId }, update: { email: input.email, name: input.name }, create: { id: input.userId, email: input.email, name: input.name } });
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: input.userId, lessonId: input.lessonId } },
    update: { status: input.complete ? "COMPLETED" : "STARTED", completedAt: input.complete ? now : null, trackSlug: input.trackSlug },
    create: { userId: input.userId, lessonId: input.lessonId, trackSlug: input.trackSlug, status: input.complete ? "COMPLETED" : "STARTED", completedAt: input.complete ? now : null },
  });
}
