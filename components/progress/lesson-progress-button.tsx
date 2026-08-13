"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useVisitorProgress } from "@/lib/visitor/use-visitor-progress";
import { writeVisitorLessonProgress } from "@/lib/visitor/progress";

export function LessonProgressButton({ lessonId, lessonSlug, trackSlug }: { lessonId: string; lessonSlug: string; trackSlug: string }) {
  const progress = useVisitorProgress();
  const completed = progress.lessons[lessonId]?.completed ?? false;
  const [message, setMessage] = useState("");

  function toggle() {
    const nextCompleted = !completed;
    const saved = writeVisitorLessonProgress({ lessonId, lessonSlug, trackSlug, completed: nextCompleted });
    setMessage(saved
      ? nextCompleted ? "Lesson completed and saved on this device." : "Marked incomplete on this device."
      : "Browser storage is unavailable. Your progress was not saved."
    );
  }

  return (
    <div className="text-right">
      <Button aria-pressed={completed} onClick={toggle} variant={completed ? "outline" : "default"}>
        <Check aria-hidden="true" className="size-4" />
        {completed ? "Completed" : "Mark complete"}
      </Button>
      <span aria-live="polite" className="mt-1 block min-h-4 text-xs text-muted-foreground">{message}</span>
    </div>
  );
}
