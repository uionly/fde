import type { LabProgressRecord, LabState } from "@/lib/labs/progress";

const globalLabs = globalThis as unknown as { developmentLabs?: Map<string, LabProgressRecord> };
const memoryLabs = globalLabs.developmentLabs ?? new Map<string, LabProgressRecord>();
if (process.env.NODE_ENV !== "production") globalLabs.developmentLabs = memoryLabs;
const key = (userId: string, labId: string) => `${userId}:${labId}`;

export async function getLabProgress(userId: string, labId: string): Promise<LabProgressRecord | null> {
  if (!process.env.DATABASE_URL) return memoryLabs.get(key(userId, labId)) ?? null;
  const { prisma } = await import("@/lib/db/prisma");
  const record = await prisma.labProgress.findUnique({ where: { userId_labId: { userId, labId } } });
  return record ? { labId: record.labId, currentStep: record.currentStep, state: record.stateJson as LabState, completed: record.completed, updatedAt: record.updatedAt } : null;
}

export async function getLabsForUser(userId: string): Promise<LabProgressRecord[]> {
  if (!process.env.DATABASE_URL) return [...memoryLabs.entries()].filter(([entryKey]) => entryKey.startsWith(`${userId}:`)).map(([, record]) => record);
  const { prisma } = await import("@/lib/db/prisma");
  const records = await prisma.labProgress.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  return records.map((record) => ({ labId: record.labId, currentStep: record.currentStep, state: record.stateJson as LabState, completed: record.completed, updatedAt: record.updatedAt }));
}

export async function saveLabProgress(input: { userId: string; email?: string | null; name?: string | null; labId: string; currentStep: number; state: LabState; completed: boolean }) {
  const record: LabProgressRecord = { labId: input.labId, currentStep: input.currentStep, state: input.state, completed: input.completed, updatedAt: new Date() };
  if (!process.env.DATABASE_URL) { memoryLabs.set(key(input.userId, input.labId), record); return record; }
  const { prisma } = await import("@/lib/db/prisma");
  await prisma.user.upsert({ where: { id: input.userId }, update: { email: input.email, name: input.name }, create: { id: input.userId, email: input.email, name: input.name } });
  const saved = await prisma.labProgress.upsert({ where: { userId_labId: { userId: input.userId, labId: input.labId } }, update: { currentStep: input.currentStep, stateJson: input.state, completed: input.completed }, create: { userId: input.userId, labId: input.labId, currentStep: input.currentStep, stateJson: input.state, completed: input.completed } });
  return { labId: saved.labId, currentStep: saved.currentStep, state: saved.stateJson as LabState, completed: saved.completed, updatedAt: saved.updatedAt };
}
