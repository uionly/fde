import Link from "next/link";
import type { Metadata } from "next";

import { AILabsHome } from "@/components/labs/ai-labs-home";
import { resolveAILabsShowcase } from "@/lib/ai-labs/showcase";
import { getAILabsShowcase, getAllCaseStudies, getAllExperiments, getAllGames, getAllLabs } from "@/lib/content";

export const metadata: Metadata = {
  title: "AI Labs",
  description: "Play AI system games, run technical playgrounds, and complete enterprise FDE missions.",
};

export default async function LabsPage({ searchParams }: { searchParams: Promise<{ fresh?: string | string[] }> }) {
  const query = await searchParams;
  const games = getAllGames();
  const experiments = getAllExperiments();
  const labs = getAllLabs();
  const showcase = resolveAILabsShowcase(getAILabsShowcase(), {
    games,
    experiments,
    labs,
    caseStudies: getAllCaseStudies(),
  });

  return <><div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6"><Link href="/challenges" className="text-sm font-semibold text-primary underline">Field challenges: investigate incidents and design architectures →</Link></div><AILabsHome freshSessionStarted={query.fresh === "1"} showcase={showcase} totals={{ experiments: experiments.length, games: games.length, labs: labs.length }} /></>;
}
