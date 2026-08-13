import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";

import { DifficultyBadge } from "@/components/learning/difficulty-badge";
import type { Lesson } from "@/lib/content/loaders";

export function LessonListItem({ lesson, position }: { lesson: Lesson; position: number }) {
  const { frontmatter } = lesson;
  return (
    <Link className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b py-5 last:border-b-0" href={`/learn/${frontmatter.track}/${frontmatter.slug}`}>
      <span className="grid size-9 place-items-center rounded-full border bg-card font-mono text-xs text-muted-foreground">{String(position).padStart(2, "0")}</span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold tracking-tight transition-colors group-hover:text-primary">{frontmatter.title}</h2>
          <DifficultyBadge difficulty={frontmatter.difficulty} />
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 aria-hidden="true" className="size-3.5" />{frontmatter.durationMinutes} min</div>
      </div>
      <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
