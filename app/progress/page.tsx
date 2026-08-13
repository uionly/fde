import type { Metadata } from "next";

import { VisitorProgressDashboard } from "@/components/progress/visitor-progress-dashboard";
import { getAllGames, getAllLabs, getAllLessons, getAllQuestions, getAllTracks } from "@/lib/content";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  const lessons = getAllLessons().map((lesson) => ({
    id: lesson.frontmatter.id,
    trackSlug: lesson.frontmatter.track,
  }));
  const tracks = getAllTracks().map((track) => ({ slug: track.slug, title: track.title }));
  const questions = getAllQuestions().map((question) => ({ id: question.id, skills: question.skills }));
  const labs = getAllLabs().map((lab) => ({ id: lab.id, skills: lab.skills }));

  return (
    <VisitorProgressDashboard
      gameCount={getAllGames().length}
      labs={labs}
      lessons={lessons}
      questions={questions}
      tracks={tracks}
    />
  );
}
