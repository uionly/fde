"use client";

import { ArrowLeft, ArrowRight, Check, Eye, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ProgressBar } from "@/components/learning/progress-bar";
import { Button } from "@/components/ui/button";
import type { Lab } from "@/lib/content/schemas";
import { advanceLabStep, labPercent, type LabState } from "@/lib/labs/progress";
import { writeVisitorLabProgress, type VisitorLabProgress } from "@/lib/visitor/progress";
import { useVisitorProgress } from "@/lib/visitor/use-visitor-progress";

export function LabWorkspace({ lab }: { lab: Lab }) {
  const progress = useVisitorProgress().labs[lab.id] ?? null;
  const [reviewRequested, setReviewRequested] = useState(false);
  const reviewing = reviewRequested && Boolean(progress?.completed);
  const sessionKey = reviewing ? `${lab.id}:review` : `${lab.id}:${progress?.updatedAt ?? "new"}`;

  return (
    <LabWorkspaceSession
      initialProgress={progress}
      key={sessionKey}
      lab={lab}
      onReviewComplete={() => setReviewRequested(false)}
      onReviewStart={() => setReviewRequested(true)}
      reviewing={reviewing}
    />
  );
}

function LabWorkspaceSession({
  initialProgress,
  lab,
  onReviewComplete,
  onReviewStart,
  reviewing,
}: {
  initialProgress: VisitorLabProgress | null;
  lab: Lab;
  onReviewComplete: () => void;
  onReviewStart: () => void;
  reviewing: boolean;
}) {
  const lastStepIndex = Math.max(0, lab.steps.length - 1);
  const [stepIndex, setStepIndex] = useState(() => reviewing ? 0 : initialProgress ? Math.min(initialProgress.currentStep, lastStepIndex) : 0);
  const [state, setState] = useState<LabState>(() => initialProgress?.state ?? {});
  const [completed, setCompleted] = useState(initialProgress?.completed ?? false);
  const [hint, setHint] = useState(false);
  const [solution, setSolution] = useState(false);
  const [message, setMessage] = useState("");

  const step = lab.steps[stepIndex];
  const percent = labPercent(stepIndex, lab.steps.length, completed && !reviewing);

  function saveAndAdvance() {
    const next = advanceLabStep(stepIndex, lab.steps.length);
    const remainsCompleted = completed || next.completed;
    const saved = writeVisitorLabProgress({
      completed: remainsCompleted,
      currentStep: next.nextStep,
      labId: lab.id,
      state,
      updatedAt: new Date().toISOString(),
    });

    if (!saved) {
      setMessage("Could not save progress on this device. Check browser storage access and try again.");
      return;
    }

    setStepIndex(next.nextStep);
    setCompleted(remainsCompleted);
    setHint(false);
    setSolution(false);

    if (next.completed) {
      if (reviewing) onReviewComplete();
      setMessage("");
    } else {
      setMessage("Progress saved on this device.");
    }
  }

  if (completed && !reviewing) {
    return (
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-8 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-600 text-white">
          <Check aria-hidden="true" className="size-5" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">Engagement complete</h2>
        <p className="mt-2 text-muted-foreground">You worked through every deliverable in {lab.title}. Progress is saved on this device.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              setMessage("");
              onReviewStart();
            }}
          >
            Review from start
          </Button>
          <Button asChild variant="outline"><Link href="/labs#field-missions">All field missions</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Step {stepIndex + 1} of {lab.steps.length}</span>
        <span>{reviewing ? "Completed · reviewing" : `${percent}%`}</span>
      </div>
      <ProgressBar className="mt-2" label={`${lab.title} progress`} value={percent} />
      <p className="mt-2 text-xs text-muted-foreground">Progress and working notes are saved on this device when you choose Save &amp; continue.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <ol className="space-y-1">
          {lab.steps.map((item, index) => (
            <li className={`rounded-md px-3 py-2 text-sm ${index === stepIndex ? "bg-accent font-semibold text-accent-foreground" : index < stepIndex || completed ? "text-foreground" : "text-muted-foreground"}`} key={item.id}>
              <span className="mr-2 font-mono text-[10px]">{index < stepIndex || completed ? "✓" : String(index + 1).padStart(2, "0")}</span>
              {item.title}
            </li>
          ))}
        </ol>

        <section className="rounded-xl border bg-card p-5 sm:p-7">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{step.type.replaceAll("_", " ")}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{step.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.instruction}</p>

          {step.type !== "content" ? (
            <label className="mt-6 block text-xs font-semibold">
              Your working notes
              <textarea
                className="mt-2 min-h-40 w-full rounded-md border bg-background p-3 text-sm leading-6"
                onChange={(event) => setState((value) => ({ ...value, [step.id]: event.target.value }))}
                placeholder="Capture your reasoning and deliverable…"
                value={state[step.id] ?? ""}
              />
            </label>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {step.hint ? <Button onClick={() => setHint((value) => !value)} size="sm" variant="outline"><Lightbulb aria-hidden="true" className="size-4" />{hint ? "Hide hint" : "Show hint"}</Button> : null}
            {step.solution ? <Button onClick={() => setSolution((value) => !value)} size="sm" variant="ghost"><Eye aria-hidden="true" className="size-4" />{solution ? "Hide solution" : "Reveal solution"}</Button> : null}
          </div>

          {hint ? <p className="mt-4 rounded-md bg-accent/45 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Hint:</strong> {step.hint}</p> : null}
          {solution ? <p className="mt-4 rounded-md border border-primary/20 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Example solution:</strong> {step.solution}</p> : null}

          <div className="mt-8 flex items-center justify-between border-t pt-5">
            <Button
              disabled={stepIndex === 0}
              onClick={() => {
                setStepIndex((value) => value - 1);
                setHint(false);
                setSolution(false);
                setMessage("");
              }}
              variant="ghost"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />Back
            </Button>
            <div className="text-right">
              <Button onClick={saveAndAdvance}>
                {stepIndex === lab.steps.length - 1 ? (reviewing ? "Finish review" : "Complete mission") : "Save & continue"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <p aria-live="polite" className="mt-1 min-h-4 text-xs text-muted-foreground">{message}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
