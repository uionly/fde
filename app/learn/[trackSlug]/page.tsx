import { ArrowLeft, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonListItem } from "@/components/learning/lesson-list-item";
import { VisitorTrackProgress } from "@/components/progress/visitor-track-progress";
import { getAllTracks, getLessonsForTrack, getTrackBySlug } from "@/lib/content";

type PageProps = { params: Promise<{ trackSlug: string }> };

export function generateStaticParams() {
  return getAllTracks().map((track) => ({ trackSlug: track.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { trackSlug } = await params;
  const track = getTrackBySlug(trackSlug);
  return track ? { title: track.title, description: track.description } : {};
}

export default async function TrackPage({ params }: PageProps) {
  const { trackSlug } = await params;
  const track = getTrackBySlug(trackSlug);
  if (!track) notFound();
  const lessons = getLessonsForTrack(track.slug);

  return (
    <div className="mx-auto max-w-[1040px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground" href="/learn"><ArrowLeft aria-hidden="true" className="size-4" />All tracks</Link>
      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_260px] md:items-start">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Learning track</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{track.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{track.description}</p>
        </div>
        <aside className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Layers3 aria-hidden="true" className="size-4 text-primary" />Track overview</div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs text-muted-foreground">Lessons</dt><dd className="mt-1 font-semibold">{lessons.length}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Time</dt><dd className="mt-1 font-semibold">{lessons.reduce((sum, lesson) => sum + lesson.frontmatter.durationMinutes, 0)} min</dd></div>
          </dl>
          <VisitorTrackProgress lessonIds={lessons.map((lesson) => lesson.frontmatter.id)} />
        </aside>
      </div>

      <section className="mt-14">
        <div className="border-b pb-3"><h2 className="text-sm font-semibold">Lessons</h2></div>
        {lessons.map((lesson, index) => <LessonListItem key={lesson.frontmatter.id} lesson={lesson} position={index + 1} />)}
      </section>
    </div>
  );
}
