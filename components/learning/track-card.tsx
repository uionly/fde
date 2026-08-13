import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import Link from "next/link";

import { ProgressBar } from "@/components/learning/progress-bar";
import type { Track } from "@/lib/content/schemas";

export function TrackCard({
  track,
  lessonCount,
  estimatedMinutes,
  index,
}: {
  track: Track;
  lessonCount: number;
  estimatedMinutes: number;
  index: number;
}) {
  return (
    <Link className="group flex min-h-64 flex-col rounded-xl border bg-card p-6 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg" href={`/learn/${track.slug}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">TRACK {String(index + 1).padStart(2, "0")}</span>
        <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
      </div>
      <h2 className="mt-8 text-xl font-semibold tracking-tight group-hover:text-primary">{track.title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{track.description}</p>
      <div className="mt-auto pt-8">
        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><BookOpen aria-hidden="true" className="size-3.5" />{lessonCount} lessons</span>
          <span className="flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-3.5" />{estimatedMinutes} min</span>
        </div>
        <ProgressBar label={`${track.title} progress`} value={0} />
      </div>
    </Link>
  );
}
