import type { Metadata } from "next";

import { TrackCard } from "@/components/learning/track-card";
import { getAllLessons, getAllTracks } from "@/lib/content";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  const tracks = getAllTracks();
  const lessons = getAllLessons();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Curriculum</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Learn through the customer problem.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Structured paths connect customer discovery, architecture, AI engineering, and delivery into one field-ready operating model.</p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {tracks.map((track, index) => (
          <TrackCard index={index} key={track.id} lessonCount={lessons.filter((lesson) => lesson.frontmatter.track === track.id).length} track={track} />
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm font-medium">More field tracks are being prepared.</p>
        <p className="mt-1 text-sm text-muted-foreground">Discovery, Architecture, Evaluations, RAG, Agents, and Security are the initial MVP curriculum.</p>
      </div>
    </div>
  );
}
