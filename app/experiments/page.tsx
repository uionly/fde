import { ArrowRight, FlaskConical } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getAllExperiments } from "@/lib/content";

export const metadata: Metadata = { title: "Experiments" };

export default function ExperimentsPage() {
  const experiments = getAllExperiments();
  return <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8"><p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Explore</p><h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Change the variables.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Use deterministic technical playgrounds to see system choices and trade-offs—not just read about them.</p><div className="mt-10 grid gap-4 sm:grid-cols-2">{experiments.map((experiment) => <Link className="group rounded-xl border bg-card p-5 hover:border-primary/35" href={`/experiments/${experiment.id}`} key={experiment.id}><FlaskConical aria-hidden="true" className="size-5 text-primary" /><h2 className="mt-8 font-semibold group-hover:text-primary">{experiment.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{experiment.description}</p><span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Open playground <ArrowRight aria-hidden="true" className="size-3.5" /></span></Link>)}</div></div>;
}
