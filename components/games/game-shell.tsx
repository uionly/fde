import { ArrowLeft, Clock3, Keyboard, Target, Zap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { GameIcon } from "@/components/games/game-icon";
import type { FieldGame, GameScenario } from "@/lib/content/schemas";

const difficultyLabels: Record<FieldGame["difficulty"], string> = {
  beginner: "Warm-up",
  intermediate: "Field test",
  advanced: "Expert",
};

const modeLabels: Record<FieldGame["type"], string> = {
  "quick-decision": "Quick mission",
  "model-router": "Routing simulation",
  "retrieval-rank": "Ranking simulation",
};

export function GameShell({ game, scenario, children }: { game: FieldGame; scenario: GameScenario; children: ReactNode }) {
  return (
    <div className="pb-20">
      <section className="border-b bg-foreground text-background">
        <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-background/65 hover:text-background" href="/games">
            <ArrowLeft aria-hidden="true" className="size-4" /> Field Arcade
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-inverse-primary">
                <GameIcon category={game.category} className="size-4" /> {modeLabels[game.type]} / {difficultyLabels[game.difficulty]}
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{game.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-background/65">{game.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-background/55">
              <span className="flex items-center gap-1.5 rounded-full border border-background/15 px-3 py-1.5"><Clock3 aria-hidden="true" className="size-3.5 text-inverse-primary" />{game.estimatedMinutes} min</span>
              <span className="flex items-center gap-1.5 rounded-full border border-background/15 px-3 py-1.5"><Zap aria-hidden="true" className="size-3.5 text-inverse-primary" />+{game.xp} XP</span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={`${game.title} game`} className="mx-auto max-w-[1180px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 border-b pb-6 sm:grid-cols-3">
          <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Customer</p><p className="mt-2 text-sm font-semibold">{scenario.customer}</p></div>
          <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Scenario</p><p className="mt-2 text-sm font-semibold">{scenario.title}</p></div>
          <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Objective</p><p className="mt-2 text-sm font-semibold">{scenario.objective}</p></div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div>{children}</div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Target aria-hidden="true" className="size-4 text-primary" />Learning objective</div>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                {game.learningObjectives.map((objective) => <li className="border-l-2 border-primary/40 pl-3" key={objective}>{objective}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border bg-muted/25 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Keyboard aria-hidden="true" className="size-4 text-primary" />No typing required</div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{game.keyboardInstructions}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
