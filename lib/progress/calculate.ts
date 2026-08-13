import type { Lesson } from "@/lib/content/loaders";
import type { ProgressRecord, TrackProgress } from "@/lib/progress/types";

export function calculateTrackProgress(lessons: Lesson[], records: ProgressRecord[]): TrackProgress[] {
  const completed = new Set(records.filter((record) => record.status === "COMPLETED").map((record) => record.lessonId));
  const trackSlugs = [...new Set(lessons.map((lesson) => lesson.frontmatter.track))];
  return trackSlugs.map((trackSlug) => {
    const trackLessons = lessons.filter((lesson) => lesson.frontmatter.track === trackSlug);
    const completedCount = trackLessons.filter((lesson) => completed.has(lesson.frontmatter.id)).length;
    return { trackSlug, completed: completedCount, total: trackLessons.length, percent: trackLessons.length ? Math.round((completedCount / trackLessons.length) * 100) : 0 };
  });
}

export function calculateOverallProgress(tracks: TrackProgress[]) {
  const total = tracks.reduce((sum, track) => sum + track.total, 0);
  const completed = tracks.reduce((sum, track) => sum + track.completed, 0);
  return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
}

export function latestProgress(records: ProgressRecord[]) {
  return [...records].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
}
