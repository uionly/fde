import { ArrowRight, BookOpen, Gauge, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProgressBar } from "@/components/learning/progress-bar";
import { Button } from "@/components/ui/button";
import { getAllLessons } from "@/lib/content";
import { calculateOverallProgress, calculateTrackProgress, latestProgress } from "@/lib/progress/calculate";
import { getProgressForUser } from "@/lib/progress/store";
import { getSkillSnapshot } from "@/lib/skills/service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const lessons = getAllLessons();
  const [records, snapshot] = await Promise.all([getProgressForUser(session.user.id), getSkillSnapshot(session.user.id)]);
  const latest = latestProgress(records);
  const latestLesson = latest ? lessons.find((lesson) => lesson.frontmatter.id === latest.lessonId) : lessons[0];
  const overall = calculateOverallProgress(calculateTrackProgress(lessons, records));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Field workspace</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Welcome back, {session.user.name?.split(" ")[0] ?? "learner"}.</h1>
      <p className="mt-3 text-muted-foreground">Pick up the customer problem where you left it.</p>
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-xl border bg-card p-6"><div className="flex items-center gap-2 text-sm font-semibold"><BookOpen aria-hidden="true" className="size-4 text-primary" />Continue learning</div>{latestLesson ? <><p className="mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{latestLesson.frontmatter.track.replaceAll("-", " ")}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{latestLesson.frontmatter.title}</h2><p className="mt-3 text-sm text-muted-foreground">{latestLesson.frontmatter.durationMinutes} min · {latest?.status === "COMPLETED" ? "Completed—review anytime" : "Ready to continue"}</p><Button asChild className="mt-7"><Link href={`/learn/${latestLesson.frontmatter.track}/${latestLesson.frontmatter.slug}`}>Resume lesson <ArrowRight aria-hidden="true" className="size-4" /></Link></Button></> : null}</section>
        <section className="rounded-xl border bg-card p-6"><div className="flex items-center gap-2 text-sm font-semibold"><Gauge aria-hidden="true" className="size-4 text-primary" />Curriculum</div><p className="mt-8 text-4xl font-semibold">{overall.percent}%</p><p className="mt-1 text-sm text-muted-foreground">{overall.completed} lessons completed</p><ProgressBar className="mt-5" value={overall.percent} /><Link className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary" href="/progress">View progress <ArrowRight aria-hidden="true" className="size-3.5" /></Link></section>
      </div>
      <section className="mt-5 rounded-xl border border-dashed p-6"><div className="flex items-center gap-2 font-semibold"><Target aria-hidden="true" className="size-4 text-primary" />Recommended challenge</div><h2 className="mt-4 text-lg font-semibold">{snapshot.recommendation.title}</h2><p className="mt-2 text-sm text-muted-foreground">{snapshot.recommendation.reason}</p><Button asChild className="mt-5" variant="outline"><Link href={snapshot.recommendation.href}>Build {snapshot.recommendation.skill} evidence <ArrowRight aria-hidden="true" className="size-4" /></Link></Button></section>
    </div>
  );
}
