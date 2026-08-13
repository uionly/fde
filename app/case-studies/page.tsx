import { ArrowRight, BriefcaseBusiness, Building2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getAllCaseStudies } from "@/lib/content";

export const metadata: Metadata = { title: "Customer Engagement" };

export default function CaseStudiesPage() {
  const studies = getAllCaseStudies();

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Customer engagement</p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Stay with the customer.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
        Enterprise problems reveal themselves over time. Follow one system from vague request through security, production, adoption, and ROI.
      </p>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {studies.map((study) => (
          <Link className="group flex min-h-80 flex-col rounded-xl border bg-card p-6 hover:border-primary/35" href={`/case-studies/${study.slug}`} key={study.id}>
            <div className="flex items-start justify-between">
              <Building2 aria-hidden="true" className="size-6 text-primary" />
              <span className="font-mono text-[10px] uppercase text-muted-foreground">{study.scenarios.length} customer episodes</span>
            </div>
            <p className="mt-10 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Live customer file</p>
            <h2 className="mt-2 text-2xl font-semibold group-hover:text-primary">{study.company}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{study.profile}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-semibold text-primary">
              Open the engagement <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          </Link>
        ))}

        <Link className="group flex min-h-80 flex-col rounded-xl border border-dashed bg-muted/20 p-6 hover:border-primary/35" href="/capstone">
          <div className="flex items-start justify-between">
            <BriefcaseBusiness aria-hidden="true" className="size-6 text-primary" />
            <span className="font-mono text-[10px] uppercase text-muted-foreground">12 phases</span>
          </div>
          <p className="mt-10 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Capstone preview</p>
          <h2 className="mt-2 text-2xl font-semibold group-hover:text-primary">Lead the full transformation.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Carry Northstar from discovery and architecture through evaluation, rollout, adoption, and measurable ROI.</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-semibold text-primary">
            Preview the capstone <ArrowRight aria-hidden="true" className="size-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
