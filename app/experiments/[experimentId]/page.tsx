import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExperimentRenderer } from "@/components/experiments/registry";
import { getAllExperiments } from "@/lib/content";

type PageProps = { params: Promise<{ experimentId: string }> };
export function generateStaticParams() { return getAllExperiments().map((experiment) => ({ experimentId: experiment.id })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const { experimentId } = await params; const experiment = getAllExperiments().find((item) => item.id === experimentId); return experiment ? { title: experiment.title, description: experiment.description } : {}; }

export default async function ExperimentPage({ params }: PageProps) {
  const { experimentId } = await params; const experiment = getAllExperiments().find((item) => item.id === experimentId); if (!experiment) notFound();
  return <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-6 lg:px-8"><Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/experiments"><ArrowLeft aria-hidden="true" className="size-4" />All playgrounds</Link><ExperimentRenderer experiment={experiment} /></div>;
}
