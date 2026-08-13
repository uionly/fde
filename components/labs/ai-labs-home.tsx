import {
  AlertTriangle,
  ArrowRight,
  Beaker,
  Bot,
  CircleGauge,
  Clock3,
  FlaskConical,
  Gamepad2,
  Medal,
  Network,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

import { GameIcon } from "@/components/games/game-icon";
import { FeaturedIncident } from "@/components/labs/featured-incident";
import { FieldProfileSummary } from "@/components/labs/field-profile-summary";
import { FreshSessionNotice } from "@/components/labs/fresh-session-notice";
import { Button } from "@/components/ui/button";
import type { Experiment } from "@/lib/content/schemas";
import type { ResolvedAILabsShowcase } from "@/lib/ai-labs/showcase";

const modeIcons = {
  simulate: Gamepad2,
  experiment: FlaskConical,
  deliver: Medal,
};

const playgroundIcons = {
  chunking: Beaker,
  retrieval: Network,
  "tool-selection": Bot,
  injection: ShieldAlert,
  cost: CircleGauge,
  placeholder: FlaskConical,
};

function PlaygroundIcon({ type }: { type: Experiment["type"] }) {
  const Icon = playgroundIcons[type];
  return <Icon aria-hidden="true" className="size-4" />;
}

type AILabsHomeProps = {
  freshSessionStarted?: boolean;
  showcase: ResolvedAILabsShowcase;
  totals: { experiments: number; games: number; labs: number };
};

export function AILabsHome({ freshSessionStarted = false, showcase, totals }: AILabsHomeProps) {
  const { content, featuredGame, supportingGames, featuredExperiments, featuredLabs, northstarThread } = showcase;
  const modeStats = {
    simulate: `${totals.games} field simulations`,
    experiment: `${totals.experiments} system playgrounds`,
    deliver: `${totals.labs} guided missions`,
  };
  const threadSteps = [
    {
      eyebrow: "01 / Customer signal",
      title: northstarThread.scenario.title,
      description: northstarThread.scenario.signal,
      href: `/case-studies/${northstarThread.caseStudy.slug}?scenario=${northstarThread.scenario.id}#${northstarThread.scenario.id}`,
      Icon: AlertTriangle,
    },
    {
      eyebrow: "02 / Make the call",
      title: northstarThread.game.title,
      description: northstarThread.game.customerHeadline,
      href: `/games/${northstarThread.game.slug}`,
      Icon: Gamepad2,
    },
    {
      eyebrow: "03 / Test the system",
      title: northstarThread.experiment.title,
      description: northstarThread.experiment.learningGoal,
      href: `/experiments/${northstarThread.experiment.id}`,
      Icon: FlaskConical,
    },
    {
      eyebrow: "04 / Deliver the artifact",
      title: northstarThread.lab.title,
      description: northstarThread.lab.goals[0],
      href: `/labs/${northstarThread.lab.slug}`,
      Icon: Medal,
    },
  ];

  return (
    <div className="pb-20">
      <FreshSessionNotice show={freshSessionStarted} />
      <section className="border-b bg-foreground text-background">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-18">
          <div className="self-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/5 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-background/65">
              <span className="size-1.5 rounded-full bg-primary" />
              {content.hero.eyebrow}
            </div>
            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {content.hero.title} <span className="text-primary">{content.hero.accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-background/65">{content.hero.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                <Link href={`/games/${featuredGame.slug}`}>
                  Run today&apos;s incident
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button asChild className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background" size="lg" variant="outline">
                <Link href="#lab-modes">Choose a lab mode</Link>
              </Button>
            </div>
          </div>

          <FeaturedIncident customerName={northstarThread.caseStudy.company} game={featuredGame} />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <section aria-label="Choose an AI Lab mode" className="-mt-px grid scroll-mt-24 border-x border-b bg-card sm:grid-cols-3" id="lab-modes">
          {content.modes.map((mode) => {
            const Icon = modeIcons[mode.id];
            return (
              <Link className="group flex min-h-40 flex-col border-b p-5 transition-colors last:border-b-0 hover:bg-muted/30 sm:border-b-0 sm:border-r sm:last:border-r-0" href={mode.href} key={mode.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-4" /></span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{modeStats[mode.id]}</span>
                </div>
                <h2 className="mt-5 text-lg font-semibold group-hover:text-primary">{mode.title}</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{mode.description}</p>
              </Link>
            );
          })}
        </section>

        <section className="pt-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Northstar engagement thread</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Follow one failure from signal to delivery.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">The customer problem stays in view while the learning mode changes.</p>
            </div>
            <Link className="text-sm font-semibold text-primary" href={`/case-studies/${northstarThread.caseStudy.slug}`}>Open customer file →</Link>
          </div>
          <div className="mt-8 grid overflow-hidden rounded-xl border bg-card md:grid-cols-2 xl:grid-cols-4">
            {threadSteps.map(({ Icon, ...step }, index) => (
              <Link className="group relative flex min-h-64 flex-col border-b p-5 transition-colors hover:bg-muted/30 md:border-r md:[&:nth-child(2)]:border-r-0 xl:border-b-0 xl:[&:nth-child(2)]:border-r xl:last:border-r-0" href={step.href} key={step.eyebrow}>
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-lg border bg-background text-primary"><Icon aria-hidden="true" className="size-4" /></span>
                  {index < threadSteps.length - 1 ? <ArrowRight aria-hidden="true" className="hidden size-4 text-muted-foreground/50 xl:block" /> : null}
                </div>
                <p className="mt-7 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">{step.eyebrow}</p>
                <h3 className="mt-2 font-semibold leading-6 group-hover:text-primary">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.description}</p>
                <span className="mt-auto flex items-center gap-1.5 pt-6 text-xs font-semibold text-primary">Open step <ArrowRight aria-hidden="true" className="size-3.5" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="scroll-mt-24 pt-20" id="simulations">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Field Arcade / Quick missions</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Two more deployment calls.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Short authored situations for practicing customer judgment without setup or required typing.</p>
            </div>
            <Link className="text-sm font-semibold text-primary" href="/games">View all {totals.games} games →</Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {supportingGames.map((game) => (
              <Link className="group grid gap-5 rounded-xl border bg-card p-5 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg sm:grid-cols-[auto_1fr] sm:p-6" href={`/games/${game.slug}`} key={game.id}>
                <span className="grid size-11 place-items-center rounded-lg border bg-background text-primary"><GameIcon category={game.category} className="size-5" /></span>
                <span>
                  <span className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <span>{game.category}</span><span aria-hidden="true">·</span><span>{game.estimatedMinutes} min</span>
                  </span>
                  <span className="mt-3 block text-xl font-semibold tracking-tight group-hover:text-primary">{game.customerHeadline}</span>
                  <span className="mt-2 block text-sm font-medium">{game.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{game.mechanic}</span>
                  <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary">Run mission <ArrowRight aria-hidden="true" className="size-4" /></span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="scroll-mt-24 pt-20" id="playgrounds">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">System playgrounds</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Change the variable. Inspect the consequence.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Deterministic technical experiments expose the system behavior behind a field decision.</p>
            </div>
            <Link className="text-sm font-semibold text-primary" href="/experiments">View all {totals.experiments} playgrounds →</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredExperiments.map((experiment) => (
              <Link className="group flex min-h-64 flex-col rounded-xl border bg-card p-5 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg" href={`/experiments/${experiment.id}`} key={experiment.id}>
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><PlaygroundIcon type={experiment.type} /></span>
                <p className="mt-7 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">{experiment.type.replaceAll("-", " ")}</p>
                <h3 className="mt-2 text-lg font-semibold group-hover:text-primary">{experiment.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{experiment.description}</p>
                <p className="mt-4 border-l-2 border-primary/40 pl-3 text-xs leading-5 text-muted-foreground">{experiment.learningGoal}</p>
                <span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary">Launch playground <ArrowRight aria-hidden="true" className="size-4" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="scroll-mt-24 pt-20" id="field-missions">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Field missions</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Go deeper. Produce the artifact.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Longer, resumable engagements where the output is something an FDE would bring to a customer.</p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredLabs.map((lab, index) => (
              <Link className="group flex min-h-72 flex-col rounded-xl border bg-card p-6 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg" href={`/labs/${lab.slug}`} key={lab.id}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">MISSION {String(index + 1).padStart(2, "0")}</span>
                  <Medal aria-hidden="true" className="size-4 text-primary" />
                </div>
                <h3 className="mt-8 text-xl font-semibold group-hover:text-primary">{lab.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{lab.description}</p>
                <p className="mt-4 border-l-2 border-primary/40 pl-3 text-xs leading-5 text-muted-foreground">{lab.goals[0]}</p>
                <div className="mt-auto flex items-center justify-between pt-7 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-3.5" />{lab.estimatedMinutes} min</span>
                  <span className="flex items-center gap-1 font-semibold text-primary">Start mission <ArrowRight aria-hidden="true" className="size-3.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="pt-20">
          <FieldProfileSummary gameCount={totals.games} />
        </div>
      </div>
    </div>
  );
}
