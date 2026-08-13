import { BriefcaseBusiness, Bot, FileCheck2, Save } from "lucide-react";
import type { Metadata } from "next";

import { CapstoneWorkspace } from "@/components/capstone/capstone-workspace";
import { getAllLessons, getCapstone } from "@/lib/content";

export const metadata: Metadata = {
  title: "Northstar Transformation Capstone",
  description: "Lead a resumable twelve-phase enterprise AI engagement with deterministic evidence and optional AI coaching.",
};

export default function CapstonePage() {
  const capstone = getCapstone();
  const relatedLessons = Object.fromEntries(
    getAllLessons().map((lesson) => [
      lesson.frontmatter.id,
      {
        href: `/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`,
        title: lesson.frontmatter.title,
      },
    ]),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <div className="grid size-11 place-items-center rounded-xl border bg-card text-primary"><BriefcaseBusiness aria-hidden="true" className="size-5" /></div>
          <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Full FDE engagement</p>
          <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Lead the Northstar transformation.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Carry one fictional customer from an ambiguous AI mandate through architecture, safety, production, adoption, and defensible ROI. Make the decisions, record your reasoning, and build a complete engagement artifact.</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-semibold">How assessment works</p>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-muted-foreground">
            <li className="flex gap-2"><FileCheck2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="text-foreground">Deterministic rules</strong> control completion and skill evidence.</span></li>
            <li className="flex gap-2"><Bot aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="text-foreground">Optional AI coaching</strong> critiques written reasoning but cannot block progress.</span></li>
            <li className="flex gap-2"><Save aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="text-foreground">Browser-local save</strong> resumes drafts without an account.</span></li>
          </ul>
        </div>
      </div>

      <CapstoneWorkspace capstone={capstone} relatedLessons={relatedLessons} />
    </div>
  );
}
