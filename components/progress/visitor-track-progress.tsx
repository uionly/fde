"use client";

import { ProgressBar } from "@/components/learning/progress-bar";
import { useVisitorProgress } from "@/lib/visitor/use-visitor-progress";

export function VisitorTrackProgress({ lessonIds }: { lessonIds: string[] }) {
  const progress = useVisitorProgress();
  const completed = lessonIds.filter((lessonId) => progress.lessons[lessonId]?.completed).length;
  const value = lessonIds.length ? Math.round((completed / lessonIds.length) * 100) : 0;

  return (
    <>
      <ProgressBar className="mt-5" label="Track progress" value={value} />
      <p className="mt-2 text-xs text-muted-foreground">{completed} of {lessonIds.length} lessons complete · saved on this device</p>
    </>
  );
}
