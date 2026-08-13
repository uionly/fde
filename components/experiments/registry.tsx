"use client";

import type { ComponentType } from "react";

import { PlaceholderExperiment } from "@/components/experiments/placeholder-experiment";
import { ChunkingPlayground } from "@/components/experiments/chunking-playground";
import { RetrievalPlayground } from "@/components/experiments/retrieval-playground";
import { ToolSelectionSimulator } from "@/components/experiments/tool-selection-simulator";
import { PromptInjectionSimulator } from "@/components/experiments/prompt-injection-simulator";
import { CostCalculator } from "@/components/experiments/cost-calculator";
import type { Experiment } from "@/lib/content/schemas";

type ExperimentComponent = ComponentType<{ experiment: Experiment }>;

export const experimentRegistry: Record<Experiment["type"], ExperimentComponent | undefined> = {
  placeholder: PlaceholderExperiment,
  chunking: ChunkingPlayground,
  retrieval: RetrievalPlayground,
  "tool-selection": ToolSelectionSimulator,
  injection: PromptInjectionSimulator,
  cost: CostCalculator,
};

export function ExperimentRenderer({ experiment }: { experiment: Experiment }) {
  const Component = experimentRegistry[experiment.type];
  if (!Component) return <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Experiment “{experiment.title}” is registered but not implemented yet.</p>;
  return <Component experiment={experiment} />;
}
