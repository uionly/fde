"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { getAllQuestions } from "@/lib/content";
import { scoreQuestion } from "@/lib/practice/scoring";
import { savePracticeAttempt } from "@/lib/practice/store";

const answerSchema = z.object({ questionId: z.string().min(1), answer: z.array(z.string()).min(1) });

export async function submitPracticeAttempt(input: z.infer<typeof answerSchema>) {
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Choose an answer before submitting." };
  const question = getAllQuestions().find((candidate) => candidate.id === parsed.data.questionId);
  if (!question) return { ok: false as const, error: "Question not found." };
  const result = scoreQuestion(question, parsed.data.answer);
  const session = await auth();
  if (session?.user) await savePracticeAttempt({ userId: session.user.id, email: session.user.email, name: session.user.name, questionId: question.id, answer: result.selected, correct: result.correct, score: result.score });
  return { ok: true as const, ...result, persisted: Boolean(session?.user) };
}
