"use client";

import { ArrowRight, Check, Clock3, Flame, Gamepad2, Keyboard, Target, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { GameIcon } from "@/components/games/game-icon";
import { useGameProfile } from "@/components/games/use-game-profile";
import { Button } from "@/components/ui/button";
import type { FieldGame } from "@/lib/content/schemas";
import { localDateKey, selectDailyGame } from "@/lib/games/runtime";
import { cn } from "@/lib/utils";

const difficultyLabels: Record<FieldGame["difficulty"], string> = { beginner: "Warm-up", intermediate: "Field test", advanced: "Expert" };
const modeLabels: Record<FieldGame["type"], string> = { "quick-decision": "Quick mission", "model-router": "Routing simulation", "retrieval-rank": "Ranking simulation" };

export function FieldArcadeHome({ games }: { games: FieldGame[] }) {
  const { profile } = useGameProfile();
  const dailyGame = useMemo(() => selectDailyGame(games, localDateKey(), profile.completedGameIds), [games, profile.completedGameIds]);
  const level = Math.floor(profile.xp / 200) + 1;

  return (
    <div className="pb-20">
      <section className="border-b bg-foreground text-background">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/5 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-background/65"><span className="size-1.5 rounded-full bg-primary" />Games / Field Arcade</div>
              <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">Make the call. <span className="text-primary">Watch the system react.</span></h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-background/65">Fast customer decision missions with visible production trade-offs. No prompts to write, no setup, and no live AI credentials.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {dailyGame ? <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg"><Link href={`/games/${dailyGame.slug}`}>Play daily mission <ArrowRight aria-hidden="true" className="size-4" /></Link></Button> : null}
                <Button asChild className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background" size="lg" variant="outline"><Link href="/labs">Back to AI Labs</Link></Button>
              </div>
            </div>
            <aside aria-label="Field Arcade profile" className="rounded-xl border border-background/15 bg-background/[0.06] p-5">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><Target aria-hidden="true" className="size-4 text-primary" />Field profile</div><span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-primary">LEVEL {level}</span></div>
              <div className="mt-6 grid grid-cols-3 divide-x divide-background/15">
                <div className="pr-4"><Zap aria-hidden="true" className="size-4 text-primary" /><p className="mt-3 text-2xl font-semibold">{profile.xp}</p><p className="text-[9px] uppercase tracking-[0.1em] text-background/45">Field XP</p></div>
                <div className="px-4"><Trophy aria-hidden="true" className="size-4 text-primary" /><p className="mt-3 text-2xl font-semibold">{profile.completedGameIds.length}/{games.length}</p><p className="text-[9px] uppercase tracking-[0.1em] text-background/45">Games</p></div>
                <div className="pl-4"><Flame aria-hidden="true" className="size-4 text-primary" /><p className="mt-3 text-2xl font-semibold">{profile.streak}</p><p className="text-[9px] uppercase tracking-[0.1em] text-background/45">Streak</p></div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <section className="-mt-px grid border-x border-b bg-card sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b p-4 sm:border-b-0 sm:border-r"><Gamepad2 aria-hidden="true" className="size-4 text-primary" /><div><p className="text-sm font-semibold">{games.length} playable missions</p><p className="text-xs text-muted-foreground">Two deterministic variants each.</p></div></div>
          <div className="flex items-center gap-3 border-b p-4 sm:border-b-0 sm:border-r"><Keyboard aria-hidden="true" className="size-4 text-primary" /><div><p className="text-sm font-semibold">Zero typing</p><p className="text-xs text-muted-foreground">Pointer, touch, and keyboard ready.</p></div></div>
          <div className="flex items-center gap-3 p-4"><Target aria-hidden="true" className="size-4 text-primary" /><div><p className="text-sm font-semibold">4 system dimensions</p><p className="text-xs text-muted-foreground">Quality, safety, cost, latency.</p></div></div>
        </section>

        <section className="pt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Field simulations</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Choose a customer situation.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Route workloads, rank evidence, or make a focused deployment call. Each result exposes the production consequence.</p></div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{profile.completedScenarioKeys.length} scenarios cleared</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => {
              const completed = profile.completedGameIds.includes(game.id);
              const attempts = profile.attemptCounts[game.id] ?? 0;
              return (
                <Link className="group flex min-h-64 flex-col rounded-xl border bg-card p-5 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg" href={`/games/${game.slug}`} key={game.id}>
                  <div className="flex items-center justify-between"><span className={cn("grid size-10 place-items-center rounded-lg border", completed ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-600" : "bg-primary/8 text-primary")}>{completed ? <Check aria-hidden="true" className="size-4" /> : <GameIcon category={game.category} className="size-4" />}</span><span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{difficultyLabels[game.difficulty]}</span></div>
                  <p className="mt-7 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{game.category} / {modeLabels[game.type]}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-primary">{game.customerHeadline}</h3>
                  <p className="mt-2 text-xs font-semibold text-foreground/75">{game.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{game.mechanic}</p>
                  <div className="mt-auto flex items-center justify-between pt-6 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3.5" />{game.estimatedMinutes} min · +{game.xp} XP</span><span className="font-semibold text-primary">{attempts > 0 ? "Replay" : "Play"} →</span></div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
