"use client";

import { Check, LoaderCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";

import { updateLessonProgress } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";

export function LessonProgressButton({ lessonId, lessonSlug, trackSlug }: { lessonId: string; lessonSlug: string; trackSlug: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    fetch("/api/progress")
      .then((response) => response.ok ? response.json() as Promise<{ records: { lessonId: string; status: string }[] }> : { records: [] })
      .then((payload) => { if (active) setCompleted(payload.records.some((record) => record.lessonId === lessonId && record.status === "COMPLETED")); });
    return () => { active = false; };
  }, [lessonId, session?.user]);

  if (sessionStatus === "loading") return <Button disabled><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />Loading progress</Button>;
  if (!session?.user) return <Button asChild><Link href="/signin"><LogIn aria-hidden="true" className="size-4" />Sign in to complete</Link></Button>;

  function toggle() {
    setMessage("");
    startTransition(async () => {
      const result = await updateLessonProgress({ lessonId, lessonSlug, trackSlug, complete: !completed });
      if (result.ok) {
        setCompleted(result.status === "COMPLETED");
        setMessage(result.status === "COMPLETED" ? "Lesson completed." : "Marked incomplete.");
      } else setMessage(result.error);
    });
  }

  return (
    <div className="text-right">
      <Button aria-pressed={completed} disabled={pending} onClick={toggle} variant={completed ? "outline" : "default"}>
        {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Check aria-hidden="true" className="size-4" />}
        {completed ? "Completed" : "Mark complete"}
      </Button>
      <span aria-live="polite" className="mt-1 block min-h-4 text-xs text-muted-foreground">{message}</span>
    </div>
  );
}
