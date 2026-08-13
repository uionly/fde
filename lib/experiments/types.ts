export type ExperimentEventName = "experiment_started" | "experiment_run" | "experiment_reset" | "experiment_completed";

export type ExperimentEvent = {
  name: ExperimentEventName;
  experimentId: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
};

export function createExperimentEvent(name: ExperimentEventName, experimentId: string, metadata?: ExperimentEvent["metadata"]): ExperimentEvent {
  return { name, experimentId, timestamp: new Date().toISOString(), metadata };
}
