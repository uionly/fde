"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CircleGauge,
  FileCheck2,
  Lightbulb,
  LockKeyhole,
  Save,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { ProgressBar } from "@/components/learning/progress-bar";
import { Button } from "@/components/ui/button";
import {
  capstoneReviewErrorResponseSchema,
  capstoneReviewResponseSchema,
  type CapstoneReviewResponse,
} from "@/lib/ai/capstone-schemas";
import { evaluateCapstonePhase, capstoneDimensionLabels } from "@/lib/capstone/evaluator";
import {
  setCurrentCapstonePhase,
  writeCapstonePhaseProgress,
  type CapstoneAIReview,
  type CapstoneDeterministicEvaluation,
  type CapstonePhaseProgress,
} from "@/lib/capstone/progress";
import { useCapstoneProgress } from "@/lib/capstone/use-capstone-progress";
import { getVerifiedCapstoneEvaluation } from "@/lib/capstone/verification";
import {
  capstoneDimensions,
  type Capstone,
  type CapstoneDimension,
  type CapstoneEvaluation,
  type CapstonePhase,
  type CapstonePhaseId,
} from "@/lib/content/schemas";
import { trackAnalytics } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

type RelatedLesson = { href: string; title: string };
type PhaseEditorHandle = { saveDraft: () => boolean };

export function CapstoneWorkspace({
  capstone,
  relatedLessons,
}: {
  capstone: Capstone;
  relatedLessons: Record<string, RelatedLesson>;
}) {
  const { hydrated, progress } = useCapstoneProgress();
  const [selectedPhaseId, setSelectedPhaseId] = useState<CapstonePhaseId | null>(null);
  const [view, setView] = useState<"workspace" | "report">("workspace");
  const [focusToken, setFocusToken] = useState(0);
  const editorRef = useRef<PhaseEditorHandle>(null);

  const completedCount = capstone.phases.filter((phase) =>
    getVerifiedCapstoneEvaluation(phase, progress.phases[phase.id]),
  ).length;
  const completedPercent = Math.round((completedCount / capstone.phases.length) * 100);
  const allComplete = completedCount === capstone.phases.length;

  const savedPhase = capstone.phases.find((phase) => phase.id === progress.currentPhaseId);
  const firstIncomplete = capstone.phases.find(
    (phase) => !getVerifiedCapstoneEvaluation(phase, progress.phases[phase.id]),
  );
  const preferredPhaseId = selectedPhaseId ?? savedPhase?.id ?? firstIncomplete?.id ?? capstone.phases.at(-1)!.id;
  const preferredIndex = Math.max(0, capstone.phases.findIndex((phase) => phase.id === preferredPhaseId));
  const preferredUnlocked = capstone.phases
    .slice(0, preferredIndex)
    .every((phase) => Boolean(getVerifiedCapstoneEvaluation(phase, progress.phases[phase.id])));
  const activePhaseId = preferredUnlocked ? preferredPhaseId : firstIncomplete?.id ?? capstone.phases[0].id;
  const activeIndex = Math.max(0, capstone.phases.findIndex((phase) => phase.id === activePhaseId));
  const activePhase = capstone.phases[activeIndex];

  function isUnlocked(index: number) {
    return capstone.phases
      .slice(0, index)
      .every((phase) => Boolean(getVerifiedCapstoneEvaluation(phase, progress.phases[phase.id])));
  }

  function choosePhase(phaseId: string, shouldFocus = true) {
    const targetIndex = capstone.phases.findIndex((phase) => phase.id === phaseId);
    if (targetIndex < 0 || !isUnlocked(targetIndex)) return;
    const resolvedPhaseId = capstone.phases[targetIndex].id as CapstonePhaseId;
    if (view === "workspace" && resolvedPhaseId !== activePhaseId && !editorRef.current?.saveDraft()) return;
    if (!setCurrentCapstonePhase(resolvedPhaseId)) return;
    setSelectedPhaseId(resolvedPhaseId);
    setView("workspace");
    if (shouldFocus) setFocusToken((value) => value + 1);
  }

  return (
    <div className="mt-10">
      <section aria-label="Capstone progress" className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">This-device engagement</p>
            <p className="mt-2 text-2xl font-semibold">{completedCount} of {capstone.phases.length} phases complete</p>
            <p className="mt-1 text-xs text-muted-foreground">Drafts, decisions, reviews, and the active phase resume in this browser.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allComplete ? (
              <Button
                onClick={() => {
                  if (view === "workspace" && !editorRef.current?.saveDraft()) return;
                  setView("report");
                }}
                variant={view === "report" ? "default" : "outline"}
              >
                <FileCheck2 aria-hidden="true" className="size-4" />Engagement report
              </Button>
            ) : null}
            {view === "report" ? <Button onClick={() => setView("workspace")} variant="ghost">Return to workspace</Button> : null}
          </div>
        </div>
        <ProgressBar className="mt-5 h-2" label="Northstar capstone progress" value={completedPercent} />
      </section>

      {view === "report" && allComplete ? (
        <CapstoneReport capstone={capstone} onReviewPhase={choosePhase} />
      ) : hydrated ? (
        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <label className="block text-xs font-semibold lg:hidden">
              Current phase
              <select
                aria-label="Choose capstone phase"
                className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm"
                onChange={(event) => choosePhase(event.target.value)}
                value={activePhase.id}
              >
                {capstone.phases.map((phase, index) => (
                  <option disabled={!isUnlocked(index)} key={phase.id} value={phase.id}>
                    {index + 1}. {phase.title}{!isUnlocked(index) ? " · locked" : progress.phases[phase.id]?.completed ? " · complete" : ""}
                  </option>
                ))}
              </select>
            </label>

            <nav aria-label="Capstone phases" className="hidden lg:block">
              <ol className="space-y-1 rounded-xl border bg-card p-2">
                {capstone.phases.map((phase, index) => {
                  const unlocked = isUnlocked(index);
                  const completed = Boolean(getVerifiedCapstoneEvaluation(phase, progress.phases[phase.id]));
                  const active = phase.id === activePhase.id;
                  return (
                    <li key={phase.id}>
                      <button
                        aria-current={active ? "step" : undefined}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active ? "bg-accent font-semibold text-accent-foreground" : unlocked ? "hover:bg-muted/60" : "cursor-not-allowed text-muted-foreground",
                        )}
                        disabled={!unlocked}
                        onClick={() => choosePhase(phase.id)}
                        type="button"
                      >
                        <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[9px]", completed && "border-emerald-600 bg-emerald-600 text-white")}>{completed ? <Check aria-hidden="true" className="size-3" /> : unlocked ? index + 1 : <LockKeyhole aria-hidden="true" className="size-3" />}</span>
                        <span><span className="block">{phase.title}</span><span className="mt-0.5 block font-mono text-[9px] font-normal uppercase tracking-[0.1em] text-muted-foreground">{phase.stage.replaceAll("-", " ")}</span></span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          <PhaseEditor
            focusToken={focusToken}
            key={activePhase.id}
            onNext={activeIndex < capstone.phases.length - 1 ? () => choosePhase(capstone.phases[activeIndex + 1].id) : () => {
              if (editorRef.current?.saveDraft()) setView("report");
            }}
            onPrevious={activeIndex > 0 ? () => choosePhase(capstone.phases[activeIndex - 1].id) : undefined}
            phase={activePhase}
            ref={editorRef}
            relatedLessons={relatedLessons}
            saved={progress.phases[activePhase.id] ?? null}
          />
        </div>
      ) : (
        <div aria-live="polite" className="mt-6 rounded-xl border bg-card p-8 text-sm text-muted-foreground">
          Restoring this-device engagement…
        </div>
      )}
    </div>
  );
}

const PhaseEditor = forwardRef<PhaseEditorHandle, {
  focusToken: number;
  onNext: () => void;
  onPrevious?: () => void;
  phase: CapstonePhase;
  relatedLessons: Record<string, RelatedLesson>;
  saved: CapstonePhaseProgress | null;
}>(function PhaseEditor({
  focusToken,
  onNext,
  onPrevious,
  phase,
  relatedLessons,
  saved,
}, ref) {
  const [selections, setSelections] = useState<Record<string, string[]>>(() => saved?.selections ?? {});
  const [reasoning, setReasoning] = useState(() => saved?.reasoning ?? "");
  const [result, setResult] = useState<CapstoneEvaluation | null>(null);
  const [status, setStatus] = useState("");
  const [storageError, setStorageError] = useState("");
  const [coaching, setCoaching] = useState(false);
  const [coachError, setCoachError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const missingAlertRef = useRef<HTMLDivElement>(null);
  const requestAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const unmountSaveRef = useRef<() => void>(() => undefined);

  const savedAnswer = useMemo(
    () => JSON.stringify({ reasoning: saved?.reasoning ?? "", selections: saved?.selections ?? {} }),
    [saved?.reasoning, saved?.selections],
  );
  const currentAnswer = useMemo(() => JSON.stringify({ reasoning, selections }), [reasoning, selections]);
  const answerFingerprintRef = useRef(currentAnswer);
  const dirty = currentAnswer !== savedAnswer;
  const verifiedSavedEvaluation = getVerifiedCapstoneEvaluation(phase, saved);
  const completed = Boolean(verifiedSavedEvaluation);

  useEffect(() => {
    if (focusToken > 0) headingRef.current?.focus();
  }, [focusToken]);

  useEffect(() => {
    if (result && !result.complete) missingAlertRef.current?.focus();
  }, [result]);

  const persistDraft = useCallback((announce: boolean) => {
    if (!dirty) {
      if (announce) setStatus("Draft already saved on this device.");
      return true;
    }

    const evaluation = evaluateCapstonePhase(phase, { reasoning, selections });
    const remainsCompleted = Boolean(completed && evaluation.complete);
    const stored = writeCapstonePhaseProgress({
      aiReview: null,
      completed: remainsCompleted,
      deterministicEvaluation: remainsCompleted ? persistedEvaluation(evaluation) : null,
      phaseId: phase.id,
      reasoning,
      selections,
    });
    setStorageError(stored ? "" : "Could not save this draft. Check browser storage access and try again.");
    if (stored && announce) setStatus("Draft saved on this device.");
    return stored;
  }, [completed, dirty, phase, reasoning, selections]);

  useImperativeHandle(ref, () => ({ saveDraft: () => persistDraft(false) }), [persistDraft]);

  useEffect(() => {
    if (!dirty) return;
    const timeout = window.setTimeout(() => {
      persistDraft(true);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [dirty, persistDraft]);

  useEffect(() => {
    unmountSaveRef.current = () => {
      if (!dirty) return;
      const evaluation = evaluateCapstonePhase(phase, { reasoning, selections });
      const remainsCompleted = Boolean(completed && evaluation.complete);
      writeCapstonePhaseProgress({
        aiReview: null,
        completed: remainsCompleted,
        deterministicEvaluation: remainsCompleted ? persistedEvaluation(evaluation) : null,
        phaseId: phase.id,
        reasoning,
        selections,
      });
    };
  }, [completed, dirty, phase, reasoning, selections]);

  useEffect(() => {
    const saveBeforeLeaving = () => unmountSaveRef.current();
    window.addEventListener("pagehide", saveBeforeLeaving);
    return () => window.removeEventListener("pagehide", saveBeforeLeaving);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      unmountSaveRef.current();
      mountedRef.current = false;
      requestAbortRef.current?.abort();
    };
  }, []);

  function invalidatePendingCoaching() {
    if (!requestAbortRef.current) return;
    requestAbortRef.current.abort();
    requestAbortRef.current = null;
    setCoaching(false);
    setCoachError("Your answer changed, so the pending coach review was cancelled. Request a fresh review when ready.");
  }

  function choose(controlId: string, optionId: string, multiple: boolean) {
    setResult(null);
    setStatus("");
    setCoachError("");
    invalidatePendingCoaching();
    setSelections((current) => {
      const selected = current[controlId] ?? [];
      const nextSelections = !multiple ? { ...current, [controlId]: [optionId] } : {
        ...current,
        [controlId]: selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      };
      answerFingerprintRef.current = JSON.stringify({ reasoning, selections: nextSelections });
      return nextSelections;
    });
  }

  function completePhase() {
    invalidatePendingCoaching();
    const evaluation = evaluateCapstonePhase(phase, { reasoning, selections });
    setResult(evaluation);
    if (!evaluation.complete) {
      setStatus("Complete the required decisions and reasoning before finishing this phase.");
      headingRef.current?.focus();
      return;
    }
    const stored = writeCapstonePhaseProgress({
      aiReview: null,
      completed: true,
      deterministicEvaluation: persistedEvaluation(evaluation),
      phaseId: phase.id,
      reasoning,
      selections,
    });
    if (!stored) {
      setStorageError("The phase was evaluated but could not be saved on this device.");
      return;
    }
    setStorageError("");
    setStatus("Phase complete. Deterministic evidence was added to your field profile.");
    trackAnalytics("capstone_phase_completed", { phaseId: phase.id, score: evaluation.score });
  }

  async function requestCoaching() {
    if (!persistDraft(false)) {
      setCoachError("Save this draft before requesting coaching.");
      return;
    }
    const submissionFingerprint = currentAnswer;
    answerFingerprintRef.current = submissionFingerprint;
    const controller = new AbortController();
    requestAbortRef.current?.abort();
    requestAbortRef.current = controller;
    setCoaching(true);
    setCoachError("");
    setStatus("");
    try {
      const response = await fetch("/api/ai/capstone-review", {
        body: JSON.stringify({
          learnerNotes: reasoning,
          phaseId: phase.id,
          selections: Object.entries(selections)
            .filter(([, optionIds]) => optionIds.length > 0)
            .map(([decisionId, optionIds]) => ({ decisionId, optionIds })),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const parsedError = capstoneReviewErrorResponseSchema.safeParse(payload);
        throw new Error(parsedError.success ? parsedError.data.error.message : "The AI coach could not review this phase.");
      }
      const review = capstoneReviewResponseSchema.parse(payload);
      if (answerFingerprintRef.current !== submissionFingerprint) {
        setCoachError("Your answer changed while coaching was running. Request a fresh review for the current draft.");
        return;
      }
      if (!writeCapstonePhaseProgress({ aiReview: persistedAIReview(review), phaseId: phase.id })) {
        throw new Error("The review was returned but could not be saved on this device.");
      }
      setStatus(`${review.mode === "live" ? "Anthropic" : "Mock"} coaching saved. It does not affect phase completion or skill evidence.`);
    } catch (error) {
      if (controller.signal.aborted) return;
      setCoachError(error instanceof Error ? error.message : "The AI coach could not review this phase.");
    } finally {
      if (requestAbortRef.current === controller) requestAbortRef.current = null;
      if (mountedRef.current) setCoaching(false);
    }
  }

  const displayedEvaluation = result?.complete
    ? result
    : verifiedSavedEvaluation;
  const canRequestCoaching = reasoning.trim().length >= 20 && Object.values(selections).some((items) => items.length > 0);

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <header className="border-b bg-muted/25 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Phase {phase.order} · {phase.stage.replaceAll("-", " ")}</p>
          <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", completed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "text-muted-foreground")}>{completed ? "Completed" : dirty ? "Saving draft…" : saved ? "Draft saved" : "Not started"}</span>
        </div>
        <h2 className="mt-3 scroll-mt-28 text-3xl font-semibold tracking-[-0.03em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" ref={headingRef} tabIndex={-1}>{phase.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{phase.context}</p>
        <div className="mt-5 rounded-lg border border-primary/20 bg-accent/35 p-4">
          <p className="text-xs font-semibold text-primary">New customer evidence</p>
          <p className="mt-1 text-sm leading-6">{phase.reveal}</p>
        </div>
        <p className="mt-5 text-base font-semibold leading-7">{phase.prompt}</p>
      </header>

      <div className="p-5 sm:p-7">
        <div className="space-y-7">
          {phase.controls.map((control) => (
            <fieldset aria-describedby={`${phase.id}-${control.id}-help`} key={control.id}>
              <legend className="text-sm font-semibold">{control.prompt}</legend>
              <p className="mt-1 text-xs text-muted-foreground" id={`${phase.id}-${control.id}-help`}>{control.type === "multiple" ? `Select ${control.minSelections}${control.maxSelections !== control.minSelections ? `–${control.maxSelections}` : ""}.` : "Select one."}</p>
              <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
                {control.options.map((option) => {
                  const checked = (selections[control.id] ?? []).includes(option.id);
                  return (
                    <label className={cn("flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:border-primary/35", checked && "border-primary bg-accent/40")} key={option.id}>
                      <input checked={checked} className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]" name={control.id} onChange={() => choose(control.id, option.id, control.type === "multiple")} type={control.type === "multiple" ? "checkbox" : "radio"} />
                      <span className="min-w-0"><span className="block text-sm font-medium">{option.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span></span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div>
            <label className="block text-sm font-semibold" htmlFor={`${phase.id}-reasoning`}>{phase.reasoningLabel}</label>
            <textarea
              aria-describedby={`${phase.id}-reasoning-help`}
              className="mt-2 min-h-44 w-full rounded-md border bg-background p-3 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id={`${phase.id}-reasoning`}
              maxLength={6_000}
              onChange={(event) => {
                const nextReasoning = event.target.value;
                answerFingerprintRef.current = JSON.stringify({ reasoning: nextReasoning, selections });
                setReasoning(nextReasoning);
                setResult(null);
                setStatus("");
                setCoachError("");
                invalidatePendingCoaching();
              }}
              placeholder={phase.reasoningPlaceholder}
              value={reasoning}
            />
            <span className="mt-1 flex justify-between gap-3 text-[10px] font-normal text-muted-foreground" id={`${phase.id}-reasoning-help`}><span>At least {phase.minReasoningCharacters} characters. Saved locally; sent to the coach only when you request a review.</span><span>{reasoning.length}/6000</span></span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <details className="rounded-lg border p-4"><summary className="cursor-pointer text-sm font-semibold"><Lightbulb aria-hidden="true" className="mr-2 inline size-4 text-primary" />Field hint</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{phase.hint}</p></details>
          <details className="rounded-lg border p-4"><summary className="cursor-pointer text-sm font-semibold"><CircleGauge aria-hidden="true" className="mr-2 inline size-4 text-primary" />Transparent rubric</summary><ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">{capstoneDimensions.map((dimension) => <li key={dimension}><strong className="text-foreground">{capstoneDimensionLabels[dimension]}:</strong> {phase.rubric[dimension]}</li>)}</ul></details>
        </div>

        {displayedEvaluation ? <DeterministicReview evaluation={displayedEvaluation} expertExample={phase.expertExample} /> : null}
        {saved?.aiReview && !dirty ? <CoachReview review={saved.aiReview} /> : null}

        <section className="mt-6 rounded-xl border border-teal-500/20 bg-teal-500/[0.04] p-5" aria-labelledby={`coach-${phase.id}`}>
          <div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300"><Bot aria-hidden="true" className="size-4" /></div><div><h3 className="text-sm font-semibold" id={`coach-${phase.id}`}>Optional AI field coach</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Advisory only. It can critique your written reasoning, but it cannot complete, block, or change the deterministic phase result. Do not enter real customer or confidential information.</p></div></div>
          <Button className="mt-4" disabled={!canRequestCoaching || coaching} onClick={requestCoaching} size="sm" variant="outline"><Sparkles aria-hidden="true" className="size-4" />{coaching ? "Reviewing reasoning…" : saved?.aiReview && !dirty ? "Refresh coach review" : "Get coach feedback"}</Button>
          {!canRequestCoaching ? <p className="mt-2 text-[10px] text-muted-foreground">Add one decision and at least 20 characters of reasoning to request coaching.</p> : null}
          {coachError ? <p className="mt-3 text-xs text-rose-600 dark:text-rose-400" role="alert">{coachError} Your deterministic work remains available.</p> : null}
        </section>

        {result && !result.complete ? <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/8 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" ref={missingAlertRef} role="alert" tabIndex={-1}><div className="flex gap-2 text-sm font-semibold"><TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />Finish these requirements</div><ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{result.missing.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
        {storageError ? <p className="mt-4 text-xs text-rose-600 dark:text-rose-400" role="alert">{storageError}</p> : null}
        <p aria-live="polite" className="mt-3 min-h-5 text-xs text-muted-foreground">{status}</p>

        <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button disabled={!onPrevious} onClick={onPrevious} variant="ghost"><ArrowLeft aria-hidden="true" className="size-4" />Previous phase</Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button onClick={() => persistDraft(true)} variant="outline"><Save aria-hidden="true" className="size-4" />Save draft</Button>
            {completed && !dirty ? <Button onClick={onNext}>Continue <ArrowRight aria-hidden="true" className="size-4" /></Button> : <Button onClick={completePhase}>Complete phase <ArrowRight aria-hidden="true" className="size-4" /></Button>}
          </div>
        </div>

        <div className="mt-6 border-t pt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Related field lessons</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{phase.relatedLessons.flatMap((lessonId) => relatedLessons[lessonId] ? [<Link className="text-xs font-semibold text-primary hover:underline" href={relatedLessons[lessonId].href} key={lessonId}>{relatedLessons[lessonId].title} →</Link>] : [])}</div></div>
      </div>
    </article>
  );
});

function persistedEvaluation(evaluation: CapstoneEvaluation): CapstoneDeterministicEvaluation {
  return {
    dimensions: evaluation.dimensions,
    evaluatedAt: new Date().toISOString(),
    gaps: evaluation.gaps.slice(0, 8),
    overall: evaluation.score,
    strengths: evaluation.strengths.slice(0, 8),
  };
}

function persistedAIReview(review: CapstoneReviewResponse): CapstoneAIReview {
  return { ...review, reviewedAt: new Date().toISOString() };
}

function DeterministicReview({ evaluation, expertExample }: { evaluation: CapstoneEvaluation; expertExample: string }) {
  return (
    <section className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5" aria-label="Deterministic field review">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 aria-hidden="true" className="size-4 text-emerald-700 dark:text-emerald-400" />Deterministic field review</div><span className="font-mono text-lg font-semibold">{evaluation.score}/100</span></div>
      <p className="mt-2 text-xs text-muted-foreground">This authored score—not AI coaching—controls completion and skill evidence.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{capstoneDimensions.map((dimension) => <DimensionScore dimension={dimension} key={dimension} value={evaluation.dimensions[dimension]} />)}</div>
      {evaluation.strengths.length || evaluation.gaps.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2"><FeedbackList items={evaluation.strengths} label="Strengths" tone="positive" /><FeedbackList items={evaluation.gaps} label="Trade-offs to revisit" tone="warning" /></div> : null}
      {evaluation.complete ? <details className="mt-5 rounded-lg border bg-background/70 p-4"><summary className="cursor-pointer text-sm font-semibold">Compare with an expert artifact</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{expertExample}</p></details> : null}
    </section>
  );
}

function CoachReview({ review }: { review: CapstoneAIReview }) {
  return (
    <section className="mt-6 rounded-xl border border-teal-500/25 bg-teal-500/[0.04] p-5" aria-label="Advisory AI coach review">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" />Advisory {review.mode === "live" ? "Anthropic" : "mock"} coach review</div><span className="font-mono text-[10px] text-muted-foreground">{review.model}</span></div>
      <p className="mt-3 break-words text-sm leading-6">{review.summary}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-800 dark:text-teal-300">Does not affect completion or skill evidence</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{capstoneDimensions.map((dimension) => <DimensionScore dimension={dimension} key={dimension} value={review.scores[dimension]} />)}</div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3"><FeedbackList items={review.strengths} label="Observed strengths" tone="positive" /><FeedbackList items={review.gaps} label="Possible gaps" tone="warning" /><FeedbackList items={review.questions} label="Questions to test" /></div>
      <p className="mt-5 break-words rounded-lg border bg-background/70 p-4 text-sm"><strong>Recommended next step:</strong> {review.recommendedNextStep}</p>
      <p className="mt-2 text-[10px] text-muted-foreground">Usage: {review.usage.inputTokens} input · {review.usage.outputTokens} output tokens</p>
    </section>
  );
}

function DimensionScore({ dimension, value }: { dimension: CapstoneDimension; value: number }) {
  return <div className="rounded-lg border bg-background/70 p-3"><div className="flex justify-between text-xs"><span className="font-medium">{capstoneDimensionLabels[dimension]}</span><span className="font-mono text-muted-foreground">{value}</span></div><ProgressBar className="mt-2" label={`${capstoneDimensionLabels[dimension]} score`} value={value} /></div>;
}

function FeedbackList({ items, label, tone }: { items: string[]; label: string; tone?: "positive" | "warning" }) {
  return <div><p className="text-xs font-semibold">{label}</p>{items.length ? <ul className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">{items.map((item) => <li className="flex gap-2" key={item}><span aria-hidden="true" className={cn("mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground", tone === "positive" && "bg-emerald-600", tone === "warning" && "bg-amber-600")} />{item}</li>)}</ul> : <p className="mt-2 text-xs text-muted-foreground">No items recorded.</p>}</div>;
}

function CapstoneReport({ capstone, onReviewPhase }: { capstone: Capstone; onReviewPhase: (phaseId: string) => void }) {
  const { progress } = useCapstoneProgress();
  const reportHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => reportHeadingRef.current?.focus(), []);
  const evaluations = capstone.phases.flatMap((phase) => {
    const evaluation = getVerifiedCapstoneEvaluation(phase, progress.phases[phase.id]);
    return evaluation ? [evaluation] : [];
  });
  const overall = evaluations.length ? Math.round(evaluations.reduce((total, evaluation) => total + evaluation.score, 0) / evaluations.length) : 0;
  const dimensions = Object.fromEntries(capstoneDimensions.map((dimension) => [dimension, evaluations.length ? Math.round(evaluations.reduce((total, evaluation) => total + evaluation.dimensions[dimension], 0) / evaluations.length) : 0])) as Record<CapstoneDimension, number>;

  return (
    <section className="mt-6 rounded-xl border bg-card p-5 sm:p-8">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Compiled engagement artifact</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" ref={reportHeadingRef} tabIndex={-1}>Northstar transformation report</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Your twelve saved decisions and field notes, supported by deterministic evidence. AI coaching is shown as advice only and is excluded from the report score.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-[180px_1fr]"><div className="rounded-xl border bg-muted/20 p-5"><p className="text-xs text-muted-foreground">Deterministic engagement score</p><p className="mt-2 font-mono text-4xl font-semibold">{overall}</p><p className="mt-1 text-xs text-muted-foreground">12/12 phases complete</p></div><div className="grid gap-3 sm:grid-cols-2">{capstoneDimensions.map((dimension) => <DimensionScore dimension={dimension} key={dimension} value={dimensions[dimension]} />)}</div></div>
      <ol className="mt-8 min-w-0 space-y-4">{capstone.phases.map((phase) => { const saved = progress.phases[phase.id]!; const evaluation = getVerifiedCapstoneEvaluation(phase, saved); return <li className="min-w-0 rounded-xl border p-5" key={phase.id}><div className="flex min-w-0 flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary">Phase {phase.order} · {phase.stage.replaceAll("-", " ")}</p><h3 className="mt-1 break-words text-lg font-semibold">{phase.title}</h3></div><span className="font-mono text-sm font-semibold">{evaluation?.score ?? 0}/100</span></div><p className="mt-4 break-words whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{saved.reasoning}</p>{saved.aiReview ? <p className="mt-4 break-words rounded-lg bg-teal-500/[0.05] p-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Optional coach note:</strong> {saved.aiReview.summary}</p> : null}<Button className="mt-4" onClick={() => onReviewPhase(phase.id)} size="sm" variant="ghost">Review phase <ArrowRight aria-hidden="true" className="size-3.5" /></Button></li>; })}</ol>
    </section>
  );
}
