import { z } from "zod";

export const visitorProgressStorageKey = "fde-learning-lab-visitor-progress-v1";
export const visitorProgressEventName = "fde:visitor-progress-updated";

const timestampSchema = z.iso.datetime({ offset: true });

export const visitorLessonProgressSchema = z.object({
  lessonId: z.string().min(1),
  lessonSlug: z.string().min(1),
  trackSlug: z.string().min(1),
  completed: z.boolean(),
  updatedAt: timestampSchema,
}).strict();

export const visitorPracticeAttemptSchema = z.object({
  questionId: z.string().min(1),
  answer: z.array(z.string().min(1)),
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  updatedAt: timestampSchema,
}).strict();

export const visitorLabProgressSchema = z.object({
  labId: z.string().min(1),
  currentStep: z.number().int().nonnegative(),
  state: z.record(z.string(), z.string()),
  completed: z.boolean(),
  updatedAt: timestampSchema,
}).strict();

export const visitorProgressSchema = z.object({
  version: z.literal(1),
  lessons: z.record(z.string(), visitorLessonProgressSchema),
  practiceAttempts: z.array(visitorPracticeAttemptSchema).max(500),
  labs: z.record(z.string(), visitorLabProgressSchema),
}).strict();

export type VisitorLessonProgress = z.infer<typeof visitorLessonProgressSchema>;
export type VisitorPracticeAttempt = z.infer<typeof visitorPracticeAttemptSchema>;
export type VisitorLabProgress = z.infer<typeof visitorLabProgressSchema>;
export type VisitorProgress = z.infer<typeof visitorProgressSchema>;

export const emptyVisitorProgress: VisitorProgress = {
  version: 1,
  lessons: {},
  practiceAttempts: [],
  labs: {},
};

function parseVisitorProgress(value: unknown): VisitorProgress {
  const parsed = visitorProgressSchema.safeParse(value);
  return parsed.success ? parsed.data : emptyVisitorProgress;
}

function emitVisitorProgressUpdated() {
  window.dispatchEvent(new CustomEvent(visitorProgressEventName));
}

function writeVisitorProgress(progress: VisitorProgress) {
  if (typeof window === "undefined") return false;
  const parsed = visitorProgressSchema.safeParse(progress);
  if (!parsed.success) return false;

  try {
    window.localStorage.setItem(visitorProgressStorageKey, JSON.stringify(parsed.data));
    emitVisitorProgressUpdated();
    return true;
  } catch {
    return false;
  }
}

export function readVisitorProgress(): VisitorProgress {
  if (typeof window === "undefined") return emptyVisitorProgress;

  try {
    const stored = window.localStorage.getItem(visitorProgressStorageKey);
    return stored ? parseVisitorProgress(JSON.parse(stored)) : emptyVisitorProgress;
  } catch {
    return emptyVisitorProgress;
  }
}

export function readVisitorLessonProgress(lessonId: string): VisitorLessonProgress | null {
  return readVisitorProgress().lessons[lessonId] ?? null;
}

export function writeVisitorLessonProgress(input: Omit<VisitorLessonProgress, "updatedAt"> & { updatedAt?: string }) {
  const progress = readVisitorProgress();
  const record = visitorLessonProgressSchema.safeParse({ ...input, updatedAt: input.updatedAt ?? new Date().toISOString() });
  if (!record.success) return false;

  return writeVisitorProgress({
    ...progress,
    lessons: { ...progress.lessons, [record.data.lessonId]: record.data },
  });
}

export function readVisitorPracticeAttempts(): VisitorPracticeAttempt[] {
  return readVisitorProgress().practiceAttempts;
}

export function writeVisitorPracticeAttempt(input: Omit<VisitorPracticeAttempt, "updatedAt"> & { updatedAt?: string }) {
  const progress = readVisitorProgress();
  const record = visitorPracticeAttemptSchema.safeParse({ ...input, updatedAt: input.updatedAt ?? new Date().toISOString() });
  if (!record.success) return false;

  return writeVisitorProgress({
    ...progress,
    practiceAttempts: [...progress.practiceAttempts, record.data].slice(-500),
  });
}

export function readVisitorLabProgress(labId: string): VisitorLabProgress | null {
  return readVisitorProgress().labs[labId] ?? null;
}

export function writeVisitorLabProgress(input: Omit<VisitorLabProgress, "updatedAt"> & { updatedAt?: string }) {
  const progress = readVisitorProgress();
  const record = visitorLabProgressSchema.safeParse({ ...input, updatedAt: input.updatedAt ?? new Date().toISOString() });
  if (!record.success) return false;

  return writeVisitorProgress({
    ...progress,
    labs: { ...progress.labs, [record.data.labId]: record.data },
  });
}

export function clearVisitorProgress() {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(visitorProgressStorageKey);
    emitVisitorProgressUpdated();
    return true;
  } catch {
    return false;
  }
}

export function subscribeVisitorProgress(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === visitorProgressStorageKey || event.key === null) listener();
  };
  window.addEventListener(visitorProgressEventName, listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(visitorProgressEventName, listener);
    window.removeEventListener("storage", handleStorage);
  };
}
