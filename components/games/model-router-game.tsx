"use client";

import { ArrowRight, Check, CircleAlert, Gauge, Play, RotateCcw, Route, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { GameShell } from "@/components/games/game-shell";
import { useGameProfile } from "@/components/games/use-game-profile";
import { Button } from "@/components/ui/button";
import type { GameMetric, ModelRouterGame } from "@/lib/content/schemas";
import { trackAnalytics } from "@/lib/analytics/events";
import {
  evaluateModelRouter,
  resolveModelRouter,
  type ModelRouterAssignments,
  type ModelRouterEvaluation,
  type ModelRouterRequest,
} from "@/lib/games/model-router";
import { recordGameEvaluation, scenarioProgressKey } from "@/lib/games/progress";
import { gameMetricLabels, localDateKey } from "@/lib/games/runtime";
import { cn } from "@/lib/utils";

const outcomeLabels = { "needs-review": "Needs review", viable: "Viable", "production-ready": "Production ready" } as const;
const actionKindLabels = { lesson: "Lesson", experiment: "Playground", lab: "Field mission", "case-study": "Customer file", resource: "Field kit", game: "Simulation" } as const;

export function ModelRouterGame({ game }: { game: ModelRouterGame }) {
  const { profile, hydrated, saveProfile } = useGameProfile();
  const [phase, setPhase] = useState<"briefing" | "active" | "debrief">("briefing");
  const [runIndex, setRunIndex] = useState(0);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [assignments, setAssignments] = useState<ModelRouterAssignments>({});
  const [evaluation, setEvaluation] = useState<ModelRouterEvaluation | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const briefingHeadingRef = useRef<HTMLHeadingElement>(null);
  const routingHeadingRef = useRef<HTMLHeadingElement>(null);
  const debriefHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousPhaseRef = useRef(phase);
  const run = useMemo(() => resolveModelRouter(game, runIndex), [game, runIndex]);
  const progressKey = scenarioProgressKey(game.id, run.scenario.id);
  const personalBest = profile.bestScores[progressKey];
  const activeRequest = run.requests.find((request) => request.id === activeRequestId) ?? run.requests[0];
  const assignedCount = Object.keys(assignments).length;

  useEffect(() => {
    if (previousPhaseRef.current === phase) return;
    const heading = phase === "briefing" ? briefingHeadingRef.current : phase === "active" ? routingHeadingRef.current : debriefHeadingRef.current;
    heading?.focus();
    previousPhaseRef.current = phase;
  }, [phase]);

  function resetRun(nextRunIndex: number) {
    setRunIndex(nextRunIndex);
    setAssignments({});
    setActiveRequestId("");
    setEvaluation(null);
    setXpAwarded(false);
    setAnnouncement("");
  }

  function beginMission() {
    const nextRun = profile.playCounts[game.id] ?? 0;
    resetRun(nextRun);
    setPhase("active");
    trackAnalytics(profile.attemptCounts[game.id] ? "game_replayed" : "game_started", { gameId: game.id, runIndex: nextRun });
  }

  function selectRequest(request: ModelRouterRequest) {
    setActiveRequestId(request.id);
    const assignedLane = run.scenario.lanes.find((lane) => lane.id === assignments[request.id]);
    setAnnouncement(`${request.title} selected.${assignedLane ? ` Currently routed to ${assignedLane.label}.` : " Choose a routing lane."}`);
  }

  function assignActiveRequest(laneId: string) {
    const lane = run.scenario.lanes.find((candidate) => candidate.id === laneId)!;
    const nextAssignments = { ...assignments, [activeRequest.id]: laneId };
    setAssignments(nextAssignments);
    const nextUnassigned = run.requests.find((request) => !nextAssignments[request.id]);
    if (nextUnassigned) setActiveRequestId(nextUnassigned.id);
    setAnnouncement(`${activeRequest.title} routed to ${lane.label}. ${Object.keys(nextAssignments).length} of ${run.requests.length} requests assigned.`);
  }

  function simulate() {
    if (assignedCount !== run.requests.length) return;
    const result = evaluateModelRouter(run, assignments);
    const alreadyCompleted = profile.completedScenarioKeys.includes(progressKey);
    const nextProfile = recordGameEvaluation(
      profile,
      game,
      run.scenario,
      result,
      localDateKey(),
    );
    setEvaluation(result);
    setXpAwarded(result.recommended && !alreadyCompleted);
    saveProfile(nextProfile);
    setAnnouncement(`Simulation result: ${outcomeLabels[result.outcome]}. Overall score ${result.overall} out of 100. ${result.recommended ? "Mission cleared." : "Review the routing misses and try again."}`);
    setPhase("debrief");
    trackAnalytics("game_completed", { gameId: game.id, scenarioId: run.scenario.id, score: result.overall, recommended: result.recommended });
  }

  function replay() {
    const nextRun = evaluation?.recommended ? Math.max(runIndex + 1, profile.playCounts[game.id] ?? 0) : runIndex;
    resetRun(nextRun);
    setPhase("active");
    trackAnalytics("game_replayed", { gameId: game.id, runIndex: nextRun });
  }

  return (
    <GameShell game={game} scenario={run.scenario}>
      <p aria-atomic="true" aria-live="polite" className="sr-only" role="status">{announcement}</p>

      {phase === "briefing" ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b bg-muted/30 p-5 sm:p-7">
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><Sparkles aria-hidden="true" className="size-3.5" />Routing briefing</div>
            <h2 className="mt-4 rounded-sm text-2xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={briefingHeadingRef} tabIndex={-1}>{run.scenario.title}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{run.scenario.briefing}</p>
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="max-w-xl text-xs leading-5 text-muted-foreground"><p>Sort every request into a model lane. Each decision changes quality, safety, cost, and latency.</p><p className="mt-2 font-medium text-foreground">No dragging required: select a request, then activate a named lane button.</p></div>
            <Button disabled={!hydrated} onClick={beginMission} size="lg"><Play aria-hidden="true" className="size-4" />{hydrated ? "Open routing board" : "Loading profile…"}</Button>
          </div>
        </div>
      ) : null}

      {phase === "active" ? (
        <section className="rounded-xl border bg-card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Routing board</p><h2 className="mt-3 max-w-3xl rounded-sm text-xl font-semibold leading-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={routingHeadingRef} tabIndex={-1}>{run.scenario.prompt}</h2></div>
            <div className="text-right text-xs text-muted-foreground"><p><strong className="text-foreground">{assignedCount}/{run.requests.length}</strong> assigned</p>{typeof personalBest === "number" ? <p className="mt-1">Personal best <strong className="text-foreground">{personalBest}</strong></p> : null}</div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <section aria-labelledby="request-queue-heading" className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-4"><h3 className="text-sm font-semibold" id="request-queue-heading">Request queue</h3><span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Select one</span></div>
              <div className="mt-3 grid gap-2">
                {run.requests.map((request) => {
                  const assignedLane = run.scenario.lanes.find((lane) => lane.id === assignments[request.id]);
                  const selected = activeRequest.id === request.id;
                  return (
                    <button
                      aria-label={`Select request: ${request.title}${assignedLane ? `. Routed to ${assignedLane.label}` : ". Unassigned"}`}
                      aria-pressed={selected}
                      className={cn("rounded-lg border bg-background p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", selected && "border-primary bg-accent/30")}
                      key={request.id}
                      onClick={() => selectRequest(request)}
                      type="button"
                    >
                      <span className="flex items-start justify-between gap-3"><span className="text-sm font-semibold leading-5">{request.title}</span><span className={cn("shrink-0 rounded-full px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em]", assignedLane ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>{assignedLane ? assignedLane.label : "Unassigned"}</span></span>
                      <span className="mt-2 block text-xs leading-5 text-muted-foreground">{request.description}</span>
                      <span className="mt-3 block font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">{request.volume}% of traffic</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="routing-lanes-heading">
              <div className="flex items-center justify-between gap-4"><h3 className="text-sm font-semibold" id="routing-lanes-heading">Send “{activeRequest.title}” to…</h3><span className="text-xs text-muted-foreground">Tab + Enter works</span></div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {run.scenario.lanes.map((lane) => {
                  const selected = assignments[activeRequest.id] === lane.id;
                  const laneCount = Object.values(assignments).filter((laneId) => laneId === lane.id).length;
                  return (
                    <button
                      aria-label={`Route ${activeRequest.title} to ${lane.label}`}
                      aria-pressed={selected}
                      className={cn("group min-h-32 rounded-lg border bg-background p-4 text-left transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", selected && "border-primary bg-primary/5")}
                      key={lane.id}
                      onClick={() => assignActiveRequest(lane.id)}
                      type="button"
                    >
                      <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-semibold"><Route aria-hidden="true" className="size-4 text-primary" />{lane.label}</span>{selected ? <Check aria-hidden="true" className="size-4 text-primary" /> : <span className="font-mono text-[9px] text-muted-foreground">{laneCount} routed</span>}</span>
                      <span className="mt-3 block text-xs leading-5 text-muted-foreground">{lane.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{assignedCount === run.requests.length ? "Routing plan complete. Run it against the authored traffic model." : `Assign ${run.requests.length - assignedCount} more request${run.requests.length - assignedCount === 1 ? "" : "s"} to continue.`}</p>
            <Button disabled={assignedCount !== run.requests.length} onClick={simulate} size="lg">Run traffic <ArrowRight aria-hidden="true" className="size-4" /></Button>
          </div>
        </section>
      ) : null}

      {phase === "debrief" && evaluation ? (
        <div className="space-y-5">
          <section className={cn("rounded-xl border p-5 sm:p-7", evaluation.recommended ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/35 bg-amber-500/5")}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div><div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{evaluation.recommended ? <ShieldCheck aria-hidden="true" className="size-4 text-emerald-600" /> : <Gauge aria-hidden="true" className="size-4 text-amber-600" />}Traffic result</div><h2 className="mt-3 rounded-sm text-2xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={debriefHeadingRef} tabIndex={-1}>{outcomeLabels[evaluation.outcome]}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{evaluation.rationale}</p></div>
              <div className="shrink-0 rounded-lg border bg-background px-5 py-4 text-center"><p className="text-3xl font-semibold">{evaluation.overall}</p><p className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Overall</p></div>
            </div>
            <p className="mt-5 border-l-2 border-primary pl-3 text-sm font-semibold">{evaluation.recommended ? `Mission cleared${xpAwarded ? ` · +${game.xp} XP` : " · personal best updated"}` : "Correct every route to clear this scenario and earn XP."}</p>
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-7">
            <h3 className="text-sm font-semibold">Route inspection</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {evaluation.requestResults.map((result) => (
                <article className={cn("rounded-lg border p-4", result.recommended ? "border-emerald-500/25 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5")} key={result.requestId}>
                  <div className="flex items-start gap-2">{result.recommended ? <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />}<div><h4 className="text-sm font-semibold">{result.requestTitle}</h4><p className="mt-1 text-xs font-medium">{result.assignedLaneLabel}{result.recommended ? " · correct lane" : ` → use ${result.recommendedLaneLabel}`}</p></div></div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{result.rationale}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-7">
            <h3 className="text-sm font-semibold">System scorecard</h3>
            <p className="mt-1 text-xs text-muted-foreground">Aggregate health across every routed request.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {(Object.keys(evaluation.metrics) as GameMetric[]).map((metric) => (
                <div key={metric}><div className="flex items-center justify-between text-xs"><span className="font-medium">{gameMetricLabels[metric]}</span><span className="font-mono font-semibold">{evaluation.metrics[metric]}</span></div><div aria-label={`${gameMetricLabels[metric]} score: ${evaluation.metrics[metric]}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={evaluation.metrics[metric]} className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar"><div className="h-full rounded-full bg-primary motion-safe:transition-[width]" style={{ width: `${evaluation.metrics[metric]}%` }} /></div></div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-muted/25 p-5 sm:p-7"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Field debrief</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{evaluation.debrief}</p><p className="mt-4 border-l-2 border-primary pl-3 text-sm font-semibold">{evaluation.principle}</p></section>

          <section aria-labelledby="router-next-actions" className="rounded-xl border bg-card p-5 sm:p-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Continue the field loop</p><h3 className="mt-2 text-lg font-semibold" id="router-next-actions">Validate the policy with evidence.</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {game.nextActions.map((action) => <Link className="group grid grid-cols-[1fr_auto] gap-4 rounded-lg border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/25" href={action.href} key={`${action.kind}-${action.href}`} onClick={() => trackAnalytics("game_debrief_action_clicked", { gameId: game.id, scenarioId: run.scenario.id, destination: action.href, destinationType: action.kind })}><span><span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">{actionKindLabels[action.kind]}</span><span className="mt-2 block text-sm font-semibold group-hover:text-primary">{action.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{action.description}</span></span><ArrowRight aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground group-hover:text-primary" /></Link>)}
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3"><Button onClick={() => setPhase("briefing")} variant="outline">Review briefing</Button><Button onClick={replay}>{evaluation.recommended ? <Zap aria-hidden="true" className="size-4" /> : <RotateCcw aria-hidden="true" className="size-4" />}{evaluation.recommended ? "Next scenario" : "Re-route requests"}</Button></div>
        </div>
      ) : null}
    </GameShell>
  );
}
