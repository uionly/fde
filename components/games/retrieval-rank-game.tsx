"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Gauge,
  Layers3,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { GameShell } from "@/components/games/game-shell";
import { useGameProfile } from "@/components/games/use-game-profile";
import { Button } from "@/components/ui/button";
import type { GameMetric, RetrievalRankGame } from "@/lib/content/schemas";
import { trackAnalytics } from "@/lib/analytics/events";
import { recordGameEvaluation, scenarioProgressKey } from "@/lib/games/progress";
import {
  evaluateRetrievalRank,
  resolveRetrievalRank,
  type RetrievalRankEvaluation,
} from "@/lib/games/retrieval-rank";
import { gameMetricLabels, localDateKey } from "@/lib/games/runtime";
import { cn } from "@/lib/utils";

const outcomeLabels = {
  "needs-review": "Needs review",
  viable: "Viable",
  "production-ready": "Production ready",
} as const;

const actionKindLabels = {
  lesson: "Lesson",
  experiment: "Playground",
  lab: "Field mission",
  "case-study": "Customer file",
  resource: "Field kit",
  game: "Simulation",
} as const;

export function RetrievalRankGame({ game }: { game: RetrievalRankGame }) {
  const { profile, hydrated, saveProfile } = useGameProfile();
  const [phase, setPhase] = useState<"briefing" | "active" | "debrief">("briefing");
  const [runIndex, setRunIndex] = useState(0);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<RetrievalRankEvaluation | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [xpAwarded, setXpAwarded] = useState(false);
  const briefingHeadingRef = useRef<HTMLHeadingElement>(null);
  const activeHeadingRef = useRef<HTMLHeadingElement>(null);
  const debriefHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousPhaseRef = useRef(phase);
  const run = useMemo(() => resolveRetrievalRank(game, runIndex), [game, runIndex]);
  const candidateMap = useMemo(
    () => new Map(run.scenario.candidates.map((candidate) => [candidate.id, candidate])),
    [run.scenario.candidates],
  );
  const selectedCandidates = selectedCandidateIds.map((candidateId) => candidateMap.get(candidateId)!);
  const availableCandidates = run.candidates.filter((candidate) => !selectedCandidateIds.includes(candidate.id));
  const usedTokens = selectedCandidates.reduce((total, candidate) => total + candidate.tokens, 0);
  const remainingTokens = run.scenario.contextBudget - usedTokens;
  const progressKey = scenarioProgressKey(game.id, run.scenario.id);
  const personalBest = profile.bestScores[progressKey];

  useEffect(() => {
    if (previousPhaseRef.current === phase) return;
    const heading = phase === "briefing" ? briefingHeadingRef.current : phase === "active" ? activeHeadingRef.current : debriefHeadingRef.current;
    heading?.focus();
    previousPhaseRef.current = phase;
  }, [phase]);

  function startMission() {
    const nextRun = profile.playCounts[game.id] ?? 0;
    setRunIndex(nextRun);
    setSelectedCandidateIds([]);
    setEvaluation(null);
    setAnnouncement("");
    setXpAwarded(false);
    setPhase("active");
    trackAnalytics(profile.attemptCounts[game.id] ? "game_replayed" : "game_started", { gameId: game.id, runIndex: nextRun });
  }

  function includeCandidate(candidateId: string) {
    const candidate = candidateMap.get(candidateId);
    if (!candidate || selectedCandidateIds.includes(candidateId) || candidate.tokens > remainingTokens) return;
    setSelectedCandidateIds((current) => [...current, candidateId]);
    setAnnouncement(`${candidate.title} included at rank ${selectedCandidateIds.length + 1}. ${remainingTokens - candidate.tokens} tokens remain.`);
  }

  function removeCandidate(candidateId: string) {
    const candidate = candidateMap.get(candidateId);
    if (!candidate) return;
    setSelectedCandidateIds((current) => current.filter((id) => id !== candidateId));
    setAnnouncement(`${candidate.title} removed from the context pack.`);
  }

  function moveCandidate(candidateId: string, direction: -1 | 1) {
    const currentIndex = selectedCandidateIds.indexOf(candidateId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= selectedCandidateIds.length) return;
    const candidate = candidateMap.get(candidateId);
    setSelectedCandidateIds((current) => {
      const reordered = [...current];
      [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
      return reordered;
    });
    setAnnouncement(`${candidate?.title ?? "Candidate"} moved to rank ${nextIndex + 1}.`);
  }

  function evaluatePack() {
    if (selectedCandidateIds.length === 0) return;
    const result = evaluateRetrievalRank(run, selectedCandidateIds);
    const alreadyCompleted = profile.completedScenarioKeys.includes(progressKey);
    setEvaluation(result);
    setXpAwarded(result.recommended && !alreadyCompleted);
    setAnnouncement(`Retrieval result: ${outcomeLabels[result.outcome]}. Overall score ${result.overall} out of 100. ${result.recommended ? "All four launch gates cleared." : "One or more launch gates need revision."}`);
    setPhase("debrief");
    saveProfile(recordGameEvaluation(profile, game, run.scenario, result, localDateKey()));
    trackAnalytics("game_completed", {
      gameId: game.id,
      scenarioId: run.scenario.id,
      score: result.overall,
      recommended: result.recommended,
    });
  }

  function replay() {
    const nextRun = evaluation?.recommended ? profile.playCounts[game.id] ?? runIndex + 1 : runIndex;
    setRunIndex(nextRun);
    setSelectedCandidateIds([]);
    setEvaluation(null);
    setAnnouncement("");
    setXpAwarded(false);
    setPhase("active");
    trackAnalytics("game_replayed", { gameId: game.id, runIndex: nextRun });
  }

  return (
    <GameShell game={game} scenario={run.scenario}>
      <p aria-atomic="true" aria-live="polite" className="sr-only" role="status">{announcement}</p>

      {phase === "briefing" ? (
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b bg-muted/30 p-5 sm:p-7">
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><Layers3 aria-hidden="true" className="size-3.5" />Rank-and-pack briefing</div>
            <h2 className="mt-4 rounded-sm text-2xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={briefingHeadingRef} tabIndex={-1}>{run.scenario.title}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{run.scenario.briefing}</p>
            <div className="mt-5 rounded-lg border bg-background p-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Customer query</p>
              <p className="mt-2 text-sm font-medium leading-6">“{run.scenario.query}”</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <p className="max-w-xl text-xs leading-5 text-muted-foreground">Choose evidence, keep it inside the {run.scenario.contextBudget}-token context budget, then rank the strongest evidence first. Scores are deterministic and no live model is called.</p>
            <Button disabled={!hydrated} onClick={startMission} size="lg"><Play aria-hidden="true" className="size-4" />{hydrated ? "Begin rank rush" : "Loading profile…"}</Button>
          </div>
        </section>
      ) : null}

      {phase === "active" ? (
        <div className="space-y-5">
          <section className="rounded-xl border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Build the context pack</p>
                <h2 className="mt-3 max-w-3xl rounded-sm text-xl font-semibold leading-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={activeHeadingRef} tabIndex={-1}>{run.scenario.prompt}</h2>
              </div>
              {typeof personalBest === "number" ? <p className="text-xs text-muted-foreground">Personal best <strong className="text-foreground">{personalBest}</strong></p> : null}
            </div>
            <div className="mt-5" id="retrieval-budget">
              <div className="flex items-center justify-between gap-4 text-xs"><span className="font-medium">Context budget</span><span className="font-mono font-semibold">{usedTokens} / {run.scenario.contextBudget} tokens</span></div>
              <div aria-label={`${usedTokens} of ${run.scenario.contextBudget} context tokens used`} aria-valuemax={run.scenario.contextBudget} aria-valuemin={0} aria-valuenow={usedTokens} className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar"><div className={cn("h-full rounded-full", usedTokens > run.scenario.targetContextTokens ? "bg-amber-500" : "bg-primary")} style={{ width: `${Math.min(100, (usedTokens / run.scenario.contextBudget) * 100)}%` }} /></div>
              <p className="mt-2 text-xs text-muted-foreground">Efficiency target: {run.scenario.targetContextTokens} tokens · {remainingTokens} remaining</p>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <section aria-labelledby="candidate-pool-heading" className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold" id="candidate-pool-heading">Candidate pool</h3><span className="font-mono text-[10px] text-muted-foreground">{availableCandidates.length} available</span></div>
              <ul className="mt-4 space-y-3">
                {availableCandidates.map((candidate) => {
                  const fits = candidate.tokens <= remainingTokens;
                  return (
                    <li className="rounded-lg border bg-background p-4" key={candidate.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-sm font-semibold leading-5">{candidate.title}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{candidate.source} · {candidate.tokens} tokens</p></div>
                        <Button aria-describedby="retrieval-budget" aria-label={`Include ${candidate.title}`} disabled={!fits} onClick={() => includeCandidate(candidate.id)} size="icon" variant="outline"><Plus aria-hidden="true" className="size-4" /></Button>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">{candidate.excerpt}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">{candidate.signals.map((signal) => <span className="rounded-full bg-muted px-2 py-1 font-mono text-[9px] font-medium text-muted-foreground" key={signal}>{signal}</span>)}</div>
                      {!fits ? <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-400">Remove another item to make room.</p> : null}
                    </li>
                  );
                })}
              </ul>
              {availableCandidates.length === 0 ? <p className="mt-4 rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Every candidate is currently packed.</p> : null}
            </section>

            <section aria-labelledby="ranked-pack-heading" className="rounded-xl border bg-muted/20 p-5">
              <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold" id="ranked-pack-heading">Ranked context pack</h3><span className="font-mono text-[10px] text-muted-foreground">Highest priority first</span></div>
              {selectedCandidates.length > 0 ? (
                <ol className="mt-4 space-y-3">
                  {selectedCandidates.map((candidate, index) => (
                    <li className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border bg-background p-4" key={candidate.id}>
                      <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">{index + 1}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold leading-5">{candidate.title}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{candidate.source} · {candidate.tokens} tokens</p></div></div>
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{candidate.excerpt}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button aria-label={`Move ${candidate.title} up`} disabled={index === 0} onClick={() => moveCandidate(candidate.id, -1)} size="sm" variant="outline"><ArrowUp aria-hidden="true" className="size-3.5" />Move up</Button>
                          <Button aria-label={`Move ${candidate.title} down`} disabled={index === selectedCandidates.length - 1} onClick={() => moveCandidate(candidate.id, 1)} size="sm" variant="outline"><ArrowDown aria-hidden="true" className="size-3.5" />Move down</Button>
                          <Button aria-label={`Remove ${candidate.title}`} onClick={() => removeCandidate(candidate.id)} size="sm" variant="ghost"><X aria-hidden="true" className="size-3.5" />Remove</Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-4 rounded-lg border border-dashed p-5 text-center text-xs leading-5 text-muted-foreground">Include at least one candidate, then use Move up and Move down to set evidence priority.</p>}
              <div className="mt-5 flex justify-end"><Button disabled={selectedCandidateIds.length === 0} onClick={evaluatePack} size="lg">Evaluate context <ArrowRight aria-hidden="true" className="size-4" /></Button></div>
            </section>
          </div>
        </div>
      ) : null}

      {phase === "debrief" && evaluation ? (
        <div className="space-y-5">
          <section className={cn("rounded-xl border p-5 sm:p-7", evaluation.recommended ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/35 bg-amber-500/5")}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{evaluation.recommended ? <ShieldCheck aria-hidden="true" className="size-4 text-emerald-600" /> : <Gauge aria-hidden="true" className="size-4 text-amber-600" />}Retrieval result</div>
                <h2 className="mt-3 rounded-sm text-2xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" ref={debriefHeadingRef} tabIndex={-1}>{outcomeLabels[evaluation.outcome]}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{evaluation.rationale}</p>
              </div>
              <div className="shrink-0 rounded-lg border bg-background px-5 py-4 text-center"><p className="text-3xl font-semibold">{evaluation.overall}</p><p className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Overall</p></div>
            </div>
            <p className="mt-5 border-l-2 border-primary pl-3 text-sm font-semibold">{evaluation.recommended ? `Mission cleared${xpAwarded ? ` · +${game.xp} XP` : " · personal best updated"}` : "Repair the missed launch gates and evaluate this scenario again to earn XP."}</p>
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-sm font-semibold">Independent launch gates</h3><p className="mt-1 text-xs text-muted-foreground">Every dimension must clear its own threshold; a high average cannot mask a critical miss.</p></div><p className="font-mono text-[10px] text-muted-foreground">{evaluation.totalTokens} tokens · ~{evaluation.estimatedLatencyMs} ms</p></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(Object.keys(evaluation.metrics) as GameMetric[]).map((metric) => (
                <div className={cn("rounded-lg border p-4", evaluation.passed[metric] ? "border-emerald-500/25" : "border-amber-500/35")} key={metric}>
                  <div className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 font-semibold">{evaluation.passed[metric] ? <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" /> : <XCircle aria-hidden="true" className="size-4 text-amber-600" />}{gameMetricLabels[metric]}</span><span className="font-mono font-semibold">{evaluation.metrics[metric]} / {evaluation.thresholds[metric]}</span></div>
                  <div aria-label={`${gameMetricLabels[metric]} score: ${evaluation.metrics[metric]}%; gate: ${evaluation.thresholds[metric]}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={evaluation.metrics[metric]} className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar"><div className={cn("h-full rounded-full", evaluation.passed[metric] ? "bg-emerald-600" : "bg-amber-500")} style={{ width: `${evaluation.metrics[metric]}%` }} /></div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{evaluation.feedback[metric]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-muted/25 p-5 sm:p-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Field debrief</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{evaluation.debrief}</p>
            <p className="mt-4 border-l-2 border-primary pl-3 text-sm font-semibold">{evaluation.principle}</p>
          </section>

          <section aria-labelledby="retrieval-next-actions" className="rounded-xl border bg-card p-5 sm:p-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Continue the field loop</p>
            <h3 className="mt-2 text-lg font-semibold" id="retrieval-next-actions">Test the retrieval system or build the artifact.</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {game.nextActions.map((action) => (
                <Link className="group grid grid-cols-[1fr_auto] gap-4 rounded-lg border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/25" href={action.href} key={`${action.kind}-${action.href}`} onClick={() => trackAnalytics("game_debrief_action_clicked", { gameId: game.id, scenarioId: run.scenario.id, destination: action.href, destinationType: action.kind })}>
                  <span><span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">{actionKindLabels[action.kind]}</span><span className="mt-2 block text-sm font-semibold group-hover:text-primary">{action.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{action.description}</span></span>
                  <ArrowRight aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={() => setPhase("briefing")} variant="outline">Review briefing</Button>
            <Button onClick={replay}>{evaluation.recommended ? <Zap aria-hidden="true" className="size-4" /> : <RotateCcw aria-hidden="true" className="size-4" />}{evaluation.recommended ? "Next scenario" : "Revise this pack"}</Button>
          </div>
        </div>
      ) : null}
    </GameShell>
  );
}
