export type ProgressRecord = {
  lessonId: string;
  trackSlug: string;
  status: "STARTED" | "COMPLETED";
  startedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
  timeSpentSeconds: number;
};

export type TrackProgress = {
  trackSlug: string;
  completed: number;
  total: number;
  percent: number;
};
