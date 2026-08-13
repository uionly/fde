"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { getLesson } from "@/lib/content";
import { saveLessonProgress } from "@/lib/progress/store";

const inputSchema = z.object({ lessonId: z.string().min(1), trackSlug: z.string().min(1), lessonSlug: z.string().min(1), complete: z.boolean() });

export async function updateLessonProgress(input: z.infer<typeof inputSchema>) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Sign in to save progress." };
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success || !getLesson(parsed.data.trackSlug, parsed.data.lessonSlug)) return { ok: false as const, error: "Invalid lesson." };
  const record = await saveLessonProgress({ userId: session.user.id, email: session.user.email, name: session.user.name, lessonId: parsed.data.lessonId, trackSlug: parsed.data.trackSlug, complete: parsed.data.complete });
  revalidatePath("/progress");
  revalidatePath("/dashboard");
  return { ok: true as const, status: record.status };
}
