import type { Metadata } from "next";

import { PracticeEngine } from "@/components/practice/practice-engine";
import { getAllLessons, getAllQuestions } from "@/lib/content";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const { lesson = "" } = await searchParams;
  const questions = getAllQuestions();
  const relatedLessons = Object.fromEntries(getAllLessons().map((lesson) => [lesson.frontmatter.id, `/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`]));
  const initialLessonId = lesson && relatedLessons[lesson] ? lesson : "";
  return <div className="mx-auto max-w-[900px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8"><div className="max-w-3xl"><p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Scenario practice</p><h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Make the hard call.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Work through ambiguous requests, architecture trade-offs, and production failures. Every option explains the system judgment behind it.</p></div><div className="mt-10"><PracticeEngine initialLessonId={initialLessonId} questions={questions} relatedLessons={relatedLessons} /></div></div>;
}
