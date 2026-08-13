"use client";

import { Play } from "lucide-react";
import { useState } from "react";

import { ExperimentShell } from "@/components/experiments/experiment-shell";
import { Button } from "@/components/ui/button";
import type { Experiment } from "@/lib/content/schemas";
import { createExperimentEvent } from "@/lib/experiments/types";

export function PlaceholderExperiment({ experiment }: { experiment: Experiment }) {
  const [ran, setRan] = useState(false);
  return <ExperimentShell description={experiment.description} learningGoal={experiment.learningGoal} onReset={() => { setRan(false); createExperimentEvent("experiment_reset", experiment.id); }} title={experiment.title}><div className="rounded-lg border border-dashed p-6 text-center"><p className="text-sm text-muted-foreground">The experiment contract is connected and ready for a deterministic implementation.</p><Button className="mt-5" onClick={() => { setRan(true); createExperimentEvent("experiment_run", experiment.id); }}><Play aria-hidden="true" className="size-4" />Run placeholder</Button>{ran ? <p aria-live="polite" className="mt-4 text-sm font-semibold text-primary">Mock run completed successfully.</p> : null}</div></ExperimentShell>;
}
