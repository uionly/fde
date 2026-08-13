import { ArrowRight, ChartNoAxesColumnIncreasing, LockKeyhole, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { ProgressBar } from "@/components/learning/progress-bar";
import { Button } from "@/components/ui/button";
import { getAllLessons, getAllTracks } from "@/lib/content";
import { calculateOverallProgress, calculateTrackProgress } from "@/lib/progress/calculate";
import { getProgressForUser } from "@/lib/progress/store";
import { getSkillSnapshot } from "@/lib/skills/service";
import { weakestSkills } from "@/lib/skills/scoring";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) return <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6"><div className="mx-auto grid size-12 place-items-center rounded-xl border bg-card text-primary"><LockKeyhole aria-hidden="true" className="size-5" /></div><h1 className="mt-6 text-3xl font-semibold tracking-tight">Sign in to see your progress.</h1><p className="mt-3 text-muted-foreground">Public lessons stay open. Your completion state and learning evidence are private to your workspace.</p><Button asChild className="mt-7"><Link href="/signin">Sign in <ArrowRight aria-hidden="true" className="size-4" /></Link></Button></div>;

  const lessons = getAllLessons();
  const tracks = getAllTracks();
  const [records, snapshot] = await Promise.all([getProgressForUser(session.user.id), getSkillSnapshot(session.user.id)]);
  const trackProgress = calculateTrackProgress(lessons, records);
  const overall = calculateOverallProgress(trackProgress);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="flex items-start gap-4"><div className="grid size-11 place-items-center rounded-lg border bg-card text-primary"><ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" /></div><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Learning evidence</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Your progress</h1></div></div>
      <section className="mt-10 rounded-xl border bg-card p-6"><div className="flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Curriculum complete</p><p className="mt-1 text-3xl font-semibold">{overall.percent}%</p></div><p className="text-sm text-muted-foreground">{overall.completed} of {overall.total} lessons</p></div><ProgressBar className="mt-5 h-2" label="Overall curriculum progress" value={overall.percent} /></section>
      <section className="mt-8"><h2 className="text-sm font-semibold">Track progress</h2><div className="mt-3 overflow-hidden rounded-xl border bg-card">{trackProgress.map((item) => { const track = tracks.find((candidate) => candidate.slug === item.trackSlug); return <Link className="group block border-b p-5 last:border-b-0 hover:bg-muted/25" href={`/learn/${item.trackSlug}`} key={item.trackSlug}><div className="flex items-center justify-between"><span className="font-semibold group-hover:text-primary">{track?.title ?? item.trackSlug}</span><span className="font-mono text-xs text-muted-foreground">{item.completed}/{item.total}</span></div><ProgressBar className="mt-3" label={`${track?.title ?? item.trackSlug} progress`} value={item.percent} /></Link>; })}</div></section>
      <section className="mt-8"><div className="flex items-end justify-between"><div><h2 className="text-sm font-semibold">Skill snapshot</h2><p className="mt-1 text-xs text-muted-foreground">Based on {snapshot.evidenceCount} practice and completed-lab evidence items—not lesson views.</p></div></div><div className="mt-3 grid gap-3 rounded-xl border bg-card p-5 sm:grid-cols-2">{snapshot.scores.map((item) => <div className="rounded-lg bg-muted/30 p-3" key={item.skill}><div className="flex justify-between text-xs"><span className="font-medium">{item.skill}</span><span className="font-mono text-muted-foreground">{item.score}</span></div><ProgressBar className="mt-2" label={`${item.skill} skill score`} value={item.score} /></div>)}</div></section>
      <section className="mt-8 grid gap-4 md:grid-cols-[1fr_1.3fr]"><div className="rounded-xl border bg-card p-5"><h2 className="text-sm font-semibold">Focus areas</h2><div className="mt-4 space-y-3">{weakestSkills(snapshot.scores).map((item) => <div className="flex items-center justify-between text-sm" key={item.skill}><span>{item.skill}</span><span className="font-mono text-xs text-muted-foreground">{item.score}/100</span></div>)}</div></div><div className="rounded-xl border border-primary/20 bg-accent/35 p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles aria-hidden="true" className="size-4 text-primary" />Recommended next</div><p className="mt-4 text-lg font-semibold">{snapshot.recommendation.title}</p><p className="mt-2 text-sm text-muted-foreground">{snapshot.recommendation.reason}</p><Button asChild className="mt-5"><Link href={snapshot.recommendation.href}>Build {snapshot.recommendation.skill} evidence <ArrowRight aria-hidden="true" className="size-4" /></Link></Button></div></section>
    </div>
  );
}
