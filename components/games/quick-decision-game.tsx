"use client";

import { ArrowRight, Check, Gauge, Play, RotateCcw, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { GameShell } from "@/components/games/game-shell";
import { useGameProfile } from "@/components/games/use-game-profile";
import { Button } from "@/components/ui/button";
import type { GameMetric, QuickDecisionGame as QuickDecisionGameContent } from "@/lib/content/schemas";
import { trackAnalytics } from "@/lib/analytics/events";
import { recordGameEvaluation, scenarioProgressKey } from "@/lib/games/progress";
import { evaluateQuickDecision, gameMetricLabels, localDateKey, resolveQuickDecision, type GameEvaluation } from "@/lib/games/runtime";
import { cn } from "@/lib/utils";

const outcomeLabels = { "needs-review": "Needs review", viable: "Viable", "production-ready": "Production ready" } as const;
const actionKindLabels = { lesson: "Lesson", experiment: "Playground", lab: "Field mission", "case-study": "Customer file", resource: "Field kit", game: "Simulation" } as const;

export function QuickDecisionGame({ game }: { game: QuickDecisionGameContent }) {
  const { profile, hydrated, saveProfile } = useGameProfile();
  const [phase, setPhase] = useState<"briefing" | "active" | "debrief">("briefing");
  const [runIndex, setRunIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState("");
  const [evaluation, setEvaluation] = useState<GameEvaluation | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);
  const briefingHeadingRef = useRef<HTMLHeadingElement>(null);
  const decisionHeadingRef = useRef<HTMLHeadingElement>(null);
  const debriefHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousPhaseRef = useRef(phase);
  const run = useMemo(() => resolveQuickDecision(game, runIndex), [game, runIndex]);
  const progressKey = scenarioProgressKey(game.id, run.scenario.id);
  const personalBest = profile.bestScores[progressKey];
  const resultAnnouncement = phase === "debrief" && evaluation
    ? `Simulation result: ${outcomeLabels[evaluation.outcome]}. Overall score ${evaluation.overall} out of 100. ${evaluation.recommended ? "Mission cleared." : "Revise the decision and try again."}`
    : "";

  useEffect(() => {
    if (previousPhaseRef.current === phase) return;
    const heading = phase === "briefing" ? briefingHeadingRef.current : phase === "active" ? decisionHeadingRef.current : debriefHeadingRef.current;
    heading?.focus();
    previousPhaseRef.current = phase;
  }, [phase]);

  function beginMission() {
    const nextRun = profile.playCounts[game.id] ?? 0;
    setRunIndex(nextRun);
    setSelectedChoiceId("");
    setEvaluation(null);
    setXpAwarded(false);
    setPhase("active");
    trackAnalytics(profile.attemptCounts[game.id] ? "game_replayed" : "game_started", { gameId: game.id, runIndex: nextRun });
  }

  function simulate() {
    if (!selectedChoiceId) return;
    const result = evaluateQuickDecision(run, selectedChoiceId);
    const alreadyCompleted = profile.completedScenarioKeys.includes(progressKey);
    const legacyCompletion = profile.completedGameIds.includes(game.id) && !profile.completedScenarioKeys.some((key) => key.startsWith(`${game.id}:`));
    setEvaluation(result);
    setXpAwarded(result.recommended && !alreadyCompleted && !legacyCompletion);
    setPhase("debrief");
    const nextProfile = recordGameEvaluation(profile, game, run.scenario, result, localDateKey());
    saveProfile(nextProfile);
    trackAnalytics("game_completed", { gameId: game.id, scenarioId: run.scenario.id, score: result.overall, recommended: result.recommended });
  }

  function replay() {
    const nextRun = evaluation?.recommended ? profile.playCounts[game.id] ?? runIndex + 1 : runIndex;
    setRunIndex(nextRun);
    setSelectedChoiceId("");
    setEvaluation(null);
    setXpAwarded(false);
    setPhase("active");
    trackAnalytics("game_replayed", { gameId: game.id, runIndex: nextRun });
  }

  return (
    <GameShell game={game} scenario={run.scenario}>
      <p aria-atomic="true" aria-live="polite" className="sr-only" role="status">{resultAnnouncement}</p>
      {phase === "briefing" ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b bg-muted/30 p-5 sm:p-7">
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><Sparkles aria-hidden="true" className="size-3.5" />Mission briefing</div>
            <h2 className="mt-4 rounded-sm text-2xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={briefingHeadingRef} tabIndex={-1}>{run.scenario.title}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{run.scenario.briefing}</p>
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <p className="max-w-xl text-xs leading-5 text-muted-foreground">The simulation is deterministic. Replaying rotates through authored customer variants and never calls a live AI provider.</p>
            <Button disabled={!hydrated} onClick={beginMission} size="lg"><Play aria-hidden="true" className="size-4" />{hydrated ? "Begin mission" : "Loading profile…"}</Button>
          </div>
        </div>
      ) : null}

      {phase === "active" ? (
        <div className="rounded-xl border bg-card p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Decision point</p>{typeof personalBest === "number" ? <p className="text-xs text-muted-foreground">Personal best <strong className="text-foreground">{personalBest}</strong></p> : null}</div>
          <h2 className="mt-3 max-w-3xl rounded-sm text-xl font-semibold leading-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={decisionHeadingRef} tabIndex={-1}>{run.scenario.prompt}</h2>
          <fieldset className="mt-6 grid gap-3">
            <legend className="sr-only">Choose a field decision</legend>
            {run.choices.map((choice, index) => (
              <label className="cursor-pointer" key={choice.id}>
                <input checked={selectedChoiceId === choice.id} className="peer sr-only" name={`${game.id}-${run.seed}`} onChange={() => setSelectedChoiceId(choice.id)} type="radio" />
                <span className={cn("grid grid-cols-[auto_1fr] gap-4 rounded-lg border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/25 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2", selectedChoiceId === choice.id && "border-primary bg-accent/35")}>
                  <span className={cn("grid size-7 place-items-center rounded-full border font-mono text-xs font-semibold", selectedChoiceId === choice.id ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground")}>{selectedChoiceId === choice.id ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}</span>
                  <span className="pt-1 text-sm font-medium leading-6">{choice.text}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="mt-6 flex justify-end"><Button disabled={!selectedChoiceId} onClick={simulate} size="lg">Run simulation <ArrowRight aria-hidden="true" className="size-4" /></Button></div>
        </div>
      ) : null}

      {phase === "debrief" && evaluation ? (
        <div className="space-y-5">
          <section className={cn("rounded-xl border p-5 sm:p-7", evaluation.recommended ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/35 bg-amber-500/5")}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{evaluation.recommended ? <ShieldCheck aria-hidden="true" className="size-4 text-emerald-700 dark:text-emerald-400" /> : <Gauge aria-hidden="true" className="size-4 text-amber-700 dark:text-amber-400" />}Simulation result</div>
                <h2 className="mt-3 rounded-sm text-2xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={debriefHeadingRef} tabIndex={-1}>{outcomeLabels[evaluation.outcome]}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{evaluation.rationale}</p>
              </div>
              <div className="shrink-0 rounded-lg border bg-background px-5 py-4 text-center"><p className="text-3xl font-semibold">{evaluation.overall}</p><p className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Overall</p></div>
            </div>
            <p className="mt-5 border-l-2 border-primary pl-3 text-sm font-semibold">{evaluation.recommended ? `Mission cleared${xpAwarded ? ` · +${game.xp} XP` : " · personal best updated"}` : "Adjust the decision and run this scenario again to earn XP."}</p>
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-7">
            <h3 className="text-sm font-semibold">System scorecard</h3>
            <p className="mt-1 text-xs text-muted-foreground">Higher is healthier. Cost measures efficiency; latency measures response performance.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {(Object.keys(evaluation.metrics) as GameMetric[]).map((metric) => (
                <div key={metric}>
                  <div className="flex items-center justify-between text-xs"><span className="font-medium">{gameMetricLabels[metric]}</span><span className="font-mono font-semibold">{evaluation.metrics[metric]}</span></div>
                  <div aria-label={`${gameMetricLabels[metric]} score: ${evaluation.metrics[metric]}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={evaluation.metrics[metric]} className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar"><div className="h-full rounded-full bg-primary motion-safe:transition-[width]" style={{ width: `${evaluation.metrics[metric]}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-muted/25 p-5 sm:p-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Field debrief</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{evaluation.debrief}</p>
            <p className="mt-4 border-l-2 border-primary pl-3 text-sm font-semibold">{evaluation.principle}</p>
          </section>

          <section aria-labelledby="continue-field-loop" className="rounded-xl border bg-card p-5 sm:p-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Continue the field loop</p>
            <h3 className="mt-2 text-lg font-semibold" id="continue-field-loop">Test the variable or build the artifact.</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Carry this decision into a related technical or customer activity.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {game.nextActions.map((action) => (
                <Link
                  className="group grid grid-cols-[1fr_auto] gap-4 rounded-lg border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/25"
                  href={action.href}
                  key={`${action.kind}-${action.href}`}
                  onClick={() => trackAnalytics("game_debrief_action_clicked", { gameId: game.id, scenarioId: run.scenario.id, destination: action.href, destinationType: action.kind })}
                >
                  <span>
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">{actionKindLabels[action.kind]}</span>
                    <span className="mt-2 block text-sm font-semibold group-hover:text-primary">{action.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{action.description}</span>
                  </span>
                  <ArrowRight aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={() => setPhase("briefing")} variant="outline">Review briefing</Button>
            <Button onClick={replay}>{evaluation.recommended ? <Zap aria-hidden="true" className="size-4" /> : <RotateCcw aria-hidden="true" className="size-4" />}{evaluation.recommended ? "Next scenario" : "Try again"}</Button>
          </div>
        </div>
      ) : null}
    </GameShell>
  );
}
