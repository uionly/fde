"use client";

import { ArrowRight, Flame, Target, Trophy, Zap } from "lucide-react";
import Link from "next/link";

import { useGameProfile } from "@/components/games/use-game-profile";

export function FieldProfileSummary({ gameCount }: { gameCount: number }) {
  const { profile, hydrated } = useGameProfile();

  const values = {
    xp: hydrated ? String(profile.xp) : "—",
    cleared: hydrated ? `${profile.completedGameIds.length}/${gameCount}` : "—",
    streak: hydrated ? String(profile.streak) : "—",
  };

  return (
    <section aria-label="AI Labs field profile" className="grid overflow-hidden rounded-xl border bg-card lg:grid-cols-[1fr_auto]">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Target aria-hidden="true" className="size-4 text-primary" />
          Field evidence
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">Your decisions become evidence.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Complete quick missions to build a device-level record of the customer decisions you have practiced. Strong replays can improve a personal best without duplicating rewards.
        </p>
        <Link className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary" href="/games">
          Open your Field Arcade
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <dl className="grid min-w-0 grid-cols-3 border-t bg-muted/20 lg:border-l lg:border-t-0">
        <div className="min-w-0 p-3 sm:p-6">
          <Zap aria-hidden="true" className="size-4 text-primary" />
          <div className="mt-4 flex flex-col"><dt className="order-2 mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Field XP</dt><dd className="order-1 text-2xl font-semibold">{values.xp}</dd></div>
        </div>
        <div className="min-w-0 border-l p-3 sm:p-6">
          <Trophy aria-hidden="true" className="size-4 text-primary" />
          <div className="mt-4 flex flex-col"><dt className="order-2 mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Cleared</dt><dd className="order-1 text-2xl font-semibold">{values.cleared}</dd></div>
        </div>
        <div className="min-w-0 border-l p-3 sm:p-6">
          <Flame aria-hidden="true" className="size-4 text-primary" />
          <div className="mt-4 flex flex-col"><dt className="order-2 mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Day streak</dt><dd className="order-1 text-2xl font-semibold">{values.streak}</dd></div>
        </div>
      </dl>
    </section>
  );
}
