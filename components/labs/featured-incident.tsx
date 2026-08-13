"use client";

import { ArrowRight, CheckCircle2, Clock3, Target } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { useGameProfile } from "@/components/games/use-game-profile";
import { Button } from "@/components/ui/button";
import type { FieldGame } from "@/lib/content/schemas";
import { resolveGameScenario } from "@/lib/games/runtime";

export function FeaturedIncident({ game, customerName = game.scenarios[0].customer }: { game: FieldGame; customerName?: string }) {
  const { profile, hydrated } = useGameProfile();
  const runIndex = hydrated ? profile.playCounts[game.id] ?? 0 : 0;
  const run = useMemo(() => resolveGameScenario(game, runIndex), [game, runIndex]);
  const attempted = hydrated && (profile.attemptCounts[game.id] ?? 0) > 0;

  return (
    <aside aria-label="Featured AI Labs incident" className="self-center overflow-hidden rounded-xl border border-background/15 bg-background/[0.06]">
      <div className="border-b border-background/15 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{customerName} / Live incident</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-background/15 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-background/55">
            <Clock3 aria-hidden="true" className="size-3 text-primary" />
            {game.estimatedMinutes} min
          </span>
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-background">{run.scenario.title}</h2>
        <p className="mt-3 text-sm leading-6 text-background/60">{run.scenario.briefing}</p>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Target aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-background/45">Your objective</p>
            <p className="mt-1.5 text-sm font-medium leading-6 text-background/85">{run.scenario.objective}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-background/50">
            {attempted ? <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-400" /> : <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />}
            {attempted ? "Your next authored scenario is ready." : "No setup or API keys required."}
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={`/games/${game.slug}`}>
              {attempted ? "Continue incident" : "Run this incident"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
