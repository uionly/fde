import { ArrowLeft, ArrowRight, Check, Clock3, List } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonBody } from "@/components/lesson/lesson-body";
import { DifficultyBadge } from "@/components/learning/difficulty-badge";
import { LessonProgressButton } from "@/components/progress/lesson-progress-button";
import { getAllLessons, getLesson, getLessonNavigation, getTrackBySlug } from "@/lib/content";

type PageProps = { params: Promise<{ trackSlug: string; lessonSlug: string }> };

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ trackSlug: lesson.frontmatter.track, lessonSlug: lesson.frontmatter.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { trackSlug, lessonSlug } = await params;
  const lesson = getLesson(trackSlug, lessonSlug);
  return lesson ? { title: lesson.frontmatter.title, description: lesson.frontmatter.objectives.join(" ") } : {};
}

function headingsFrom(source: string) {
  return [...source.matchAll(/^##\s+(.+)$/gm)].map((match) => ({ title: match[1], id: match[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }));
}

export default async function LessonPage({ params }: PageProps) {
  const { trackSlug, lessonSlug } = await params;
  const lesson = getLesson(trackSlug, lessonSlug);
  const track = getTrackBySlug(trackSlug);
  if (!lesson || !track) notFound();
  const navigation = getLessonNavigation(trackSlug, lessonSlug);
  const headings = headingsFrom(lesson.content);
  const { frontmatter } = lesson;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link className="hover:text-foreground" href="/learn">Learn</Link><span>/</span>
        <Link className="hover:text-foreground" href={`/learn/${track.slug}`}>{track.title}</Link><span>/</span>
        <span aria-current="page" className="text-foreground">{frontmatter.title}</span>
      </nav>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,780px)_240px] lg:justify-center lg:gap-16">
        <article>
          <header className="border-b pb-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">{frontmatter.module.replaceAll("-", " ")}</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{frontmatter.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-4" />{frontmatter.durationMinutes} min</span>
              <DifficultyBadge difficulty={frontmatter.difficulty} />
            </div>
            <div className="mt-7 rounded-lg bg-muted/45 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">After this lesson</p>
              <ul className="mt-3 space-y-2">
                {frontmatter.objectives.map((objective) => <li className="flex gap-2 text-sm" key={objective}><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />{objective}</li>)}
              </ul>
            </div>
          </header>

          <div className="mt-8"><LessonBody source={lesson.content} /></div>

          <div className="mt-14 rounded-xl border bg-card p-5 sm:flex sm:items-center sm:justify-between">
            <div><p className="font-semibold">Ready to keep moving?</p><p className="mt-1 text-sm text-muted-foreground">Complete the lesson to update your track progress.</p></div>
            <div className="mt-4 sm:mt-0"><LessonProgressButton lessonId={frontmatter.id} lessonSlug={frontmatter.slug} trackSlug={frontmatter.track} /></div>
          </div>

          <nav aria-label="Lesson navigation" className="mt-8 grid gap-3 sm:grid-cols-2">
            {navigation.previous ? <Link className="rounded-lg border p-4 transition-colors hover:border-primary/35 hover:bg-muted/30" href={`/learn/${trackSlug}/${navigation.previous.frontmatter.slug}`}><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ArrowLeft aria-hidden="true" className="size-3.5" />Previous</span><span className="mt-2 block text-sm font-semibold">{navigation.previous.frontmatter.title}</span></Link> : <div />}
            {navigation.next ? <Link className="rounded-lg border p-4 text-right transition-colors hover:border-primary/35 hover:bg-muted/30" href={`/learn/${trackSlug}/${navigation.next.frontmatter.slug}`}><span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">Next<ArrowRight aria-hidden="true" className="size-3.5" /></span><span className="mt-2 block text-sm font-semibold">{navigation.next.frontmatter.title}</span></Link> : <Link className="rounded-lg border p-4 text-right transition-colors hover:border-primary/35 hover:bg-muted/30" href={`/learn/${trackSlug}`}><span className="text-xs text-muted-foreground">Track complete</span><span className="mt-2 block text-sm font-semibold">Back to track</span></Link>}
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"><List aria-hidden="true" className="size-4" />On this page</div>
            <nav aria-label="Table of contents" className="mt-4 border-l">
              {headings.map((heading) => <a className="block border-l border-transparent px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground" href={`#${heading.id}`} key={heading.id}>{heading.title}</a>)}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
