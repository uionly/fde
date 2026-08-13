"use client";

import { ArrowRight, ChartNoAxesColumnIncreasing, Gamepad2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { useGameProfile } from "@/components/games/use-game-profile";
import { ProgressBar } from "@/components/learning/progress-bar";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/lib/content/schemas";
import { calculateSkillScores, recommendNext, type SkillEvidence, weakestSkills } from "@/lib/skills/scoring";
import { useVisitorProgress } from "@/lib/visitor/use-visitor-progress";

type LessonSummary = { id: string; trackSlug: string };
type TrackSummary = { slug: string; title: string };
type EvidenceSource = { id: string; skills: Skill[] };

export function VisitorProgressDashboard({
  gameCount,
  labs,
  lessons,
  questions,
  tracks,
}: {
  gameCount: number;
  labs: EvidenceSource[];
  lessons: LessonSummary[];
  questions: EvidenceSource[];
  tracks: TrackSummary[];
}) {
  const progress = useVisitorProgress();
  const { hydrated: gameProfileHydrated, profile: gameProfile } = useGameProfile();
  const completedLessonIds = useMemo(
    () => new Set(Object.values(progress.lessons).filter((record) => record.completed).map((record) => record.lessonId)),
    [progress.lessons],
  );
  const completedLabIds = useMemo(
    () => new Set(Object.values(progress.labs).filter((record) => record.completed).map((record) => record.labId)),
    [progress.labs],
  );
  const trackProgress = tracks.map((track) => {
    const trackLessons = lessons.filter((lesson) => lesson.trackSlug === track.slug);
    const completed = trackLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    return {
      ...track,
      completed,
      total: trackLessons.length,
      percent: trackLessons.length ? Math.round((completed / trackLessons.length) * 100) : 0,
    };
  });
  const completedLessons = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const curriculumPercent = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const labById = new Map(labs.map((lab) => [lab.id, lab]));
  const evidence: SkillEvidence[] = [
    ...progress.practiceAttempts.flatMap((attempt) => {
      const question = questionById.get(attempt.questionId);
      return question ? [{ source: "practice" as const, skills: question.skills, score: attempt.score * 100 }] : [];
    }),
    ...[...completedLabIds].flatMap((labId) => {
      const lab = labById.get(labId);
      return lab ? [{ source: "lab" as const, skills: lab.skills, score: 100 }] : [];
    }),
  ];
  const skillScores = calculateSkillScores(evidence);
  const recommendation = recommendNext(skillScores);
  const completedGames = gameProfile.completedGameIds.length;
  const hasProgress = completedLessons > 0 || progress.practiceAttempts.length > 0 || Object.keys(progress.labs).length > 0 || completedGames > 0;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 place-items-center rounded-lg border bg-card text-primary"><ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" /></div>
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">This-device evidence</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Your progress</h1>
          <p className="mt-2 text-sm text-muted-foreground">Saved only in this browser. No account or sign-in is required.</p>
        </div>
      </div>

      {!hasProgress && gameProfileHydrated ? (
        <section className="mt-10 rounded-xl border border-dashed bg-card p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold">No progress yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Complete a lesson, scenario, Field Mission, or Arcade mission to build your field profile on this device.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link href="/games/model-router-arena">Start a 3-minute mission <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
            <Button asChild variant="outline"><Link href="/learn">Browse lessons</Link></Button>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Visitor progress summary">
        <SummaryStat label="Lessons" value={`${completedLessons}/${lessons.length}`} />
        <SummaryStat label="Practice evidence" value={String(progress.practiceAttempts.length)} />
        <SummaryStat label="Field Missions" value={`${completedLabIds.size}/${labs.length}`} />
        <SummaryStat label="Arcade missions" value={gameProfileHydrated ? `${completedGames}/${gameCount}` : "—"} />
      </section>

      <section className="mt-8 rounded-xl border bg-card p-6">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm text-muted-foreground">Curriculum complete</p><p className="mt-1 text-3xl font-semibold">{curriculumPercent}%</p></div>
          <p className="text-sm text-muted-foreground">{completedLessons} of {lessons.length} lessons</p>
        </div>
        <ProgressBar className="mt-5 h-2" label="Overall curriculum progress" value={curriculumPercent} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Track progress</h2>
        <div className="mt-3 overflow-hidden rounded-xl border bg-card">
          {trackProgress.map((track) => (
            <Link className="group block border-b p-5 last:border-b-0 hover:bg-muted/25" href={`/learn/${track.slug}`} key={track.slug}>
              <div className="flex items-center justify-between"><span className="font-semibold group-hover:text-primary">{track.title}</span><span className="font-mono text-xs text-muted-foreground">{track.completed}/{track.total}</span></div>
              <ProgressBar className="mt-3" label={`${track.title} progress`} value={track.percent} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><h2 className="text-sm font-semibold">Skill snapshot</h2><p className="mt-1 text-xs text-muted-foreground">Based on {evidence.length} saved practice and completed-Field-Mission evidence items—not lesson views.</p></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gamepad2 aria-hidden="true" className="size-3.5" />Arcade: {gameProfile.xp} XP</div>
        </div>
        <div className="mt-3 grid gap-3 rounded-xl border bg-card p-5 sm:grid-cols-2">
          {skillScores.map((item) => <div className="rounded-lg bg-muted/30 p-3" key={item.skill}><div className="flex justify-between text-xs"><span className="font-medium">{item.skill}</span><span className="font-mono text-muted-foreground">{item.score}</span></div><ProgressBar className="mt-2" label={`${item.skill} skill score`} value={item.score} /></div>)}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <div className="rounded-xl border bg-card p-5"><h2 className="text-sm font-semibold">Focus areas</h2><div className="mt-4 space-y-3">{weakestSkills(skillScores).map((item) => <div className="flex items-center justify-between text-sm" key={item.skill}><span>{item.skill}</span><span className="font-mono text-xs text-muted-foreground">{item.score}/100</span></div>)}</div></div>
        <div className="rounded-xl border border-primary/20 bg-accent/35 p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles aria-hidden="true" className="size-4 text-primary" />Recommended next</div><p className="mt-4 text-lg font-semibold">{recommendation.title}</p><p className="mt-2 text-sm text-muted-foreground">{recommendation.reason}</p><Button asChild className="mt-5"><Link href={recommendation.href}>Build {recommendation.skill} evidence <ArrowRight aria-hidden="true" className="size-4" /></Link></Button></div>
      </section>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-card p-5"><p className="font-mono text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
