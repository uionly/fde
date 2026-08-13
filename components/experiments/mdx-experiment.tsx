import { ExperimentRenderer } from "@/components/experiments/registry";
import { getAllExperiments } from "@/lib/content";

export function MDXExperiment({ id }: { id: string }) {
  const experiment = getAllExperiments().find((item) => item.id === id);
  if (!experiment) return <p className="my-6 rounded-lg border border-destructive/30 p-4 text-sm text-destructive">Unknown experiment: {id}</p>;
  return <ExperimentRenderer experiment={experiment} />;
}
