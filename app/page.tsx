import {
  ArrowRight,
  Blocks,
  BookOpen,
  Check,
  CircleDot,
  Code2,
  FlaskConical,
  Gamepad2,
  Gauge,
  Medal,
  Network,
  Play,
  ShieldCheck,
  Target,
  TerminalSquare,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";

import { TrackCard } from "@/components/learning/track-card";
import { Button } from "@/components/ui/button";
import { resolveAILabsShowcase } from "@/lib/ai-labs/showcase";
import {
  getAILabsShowcase,
  getAllCaseStudies,
  getAllExperiments,
  getAllGames,
  getAllLabs,
  getAllLessons,
  getAllTracks,
} from "@/lib/content";

const framework = [
  ["01", "Discover", "Find the real problem"],
  ["02", "Define", "Set the outcome"],
  ["03", "De-risk", "Test assumptions"],
  ["04", "Design", "Shape the system"],
  ["05", "Demonstrate", "Make it tangible"],
  ["06", "Develop", "Build the path"],
  ["07", "Evaluate", "Prove quality"],
  ["08", "Deploy", "Ship safely"],
  ["09", "Drive adoption", "Change the workflow"],
  ["10", "Distill", "Productize learning"],
] as const;

const modes = [
  {
    href: "/learn",
    icon: BookOpen,
    eyebrow: "Learn",
    title: "Build your mental models",
    body: "Concise lessons connect architecture, AI, and delivery decisions to a live customer context.",
  },
  {
    href: "/experiments",
    icon: FlaskConical,
    eyebrow: "Explore",
    title: "Change the variables",
    body: "Use deterministic playgrounds to see how retrieval, chunking, security, and cost behave.",
  },
  {
    href: "/practice",
    icon: Target,
    eyebrow: "Practice",
    title: "Make the hard call",
    body: "Work through ambiguous requests, production failures, and trade-offs with useful feedback.",
  },
  {
    href: "/labs#field-missions",
    icon: Wrench,
    eyebrow: "Build",
    title: "Deliver the outcome",
    body: "Complete guided labs and one continuous enterprise engagement from discovery through ROI.",
  },
] as const;

const skills = [
  { icon: Users, label: "Discovery" },
  { icon: Network, label: "Architecture" },
  { icon: Code2, label: "AI engineering" },
  { icon: Blocks, label: "Enterprise data" },
  { icon: ShieldCheck, label: "Security" },
  { icon: Gauge, label: "Production" },
] as const;

const notThisItems = [
  { not: "Video LMS", instead: "Scenario-driven field work" },
  { not: "AI vocabulary quiz", instead: "Customer workflow decisions" },
  { not: "Toy demos", instead: "Retrieval, security, cost, and latency trade-offs" },
  { not: "Handoff at deploy", instead: "Adoption and ROI accountability" },
] as const;

const labModes = [
  {
    href: "/games",
    icon: Gamepad2,
    label: "Field Arcade",
    countKey: "games" as const,
    body: "Fast deployment decisions under time pressure with immediate consequences.",
  },
  {
    href: "/experiments",
    icon: FlaskConical,
    label: "Playgrounds",
    countKey: "experiments" as const,
    body: "Change retrieval, chunking, security, and cost variables in deterministic simulations.",
  },
  {
    href: "/labs#field-missions",
    icon: Medal,
    label: "Field Missions",
    countKey: "labs" as const,
    body: "Multi-step guided labs that build toward a production-ready enterprise artifact.",
  },
] as const;

export default function HomePage() {
  const tracks = getAllTracks();
  const lessons = getAllLessons();
  const featuredTracks = tracks.slice(0, 6);
  const games = getAllGames();
  const experiments = getAllExperiments();
  const labs = getAllLabs();
  const caseStudies = getAllCaseStudies();
  const northstar = caseStudies.find((study) => study.slug === "northstar") ?? caseStudies[0];

  const labTotals = { games: games.length, experiments: experiments.length, labs: labs.length };

  const featuredGame = resolveAILabsShowcase(getAILabsShowcase(), {
    games,
    experiments,
    labs,
    caseStudies,
  }).featuredGame;
  const featuredScenario = featuredGame.scenarios[0];

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div aria-hidden="true" className="dot-grid absolute inset-y-0 right-0 hidden w-[48%] opacity-55 lg:block" />
        <div className="relative mx-auto grid max-w-[1440px] gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:py-24 xl:gap-24 xl:py-28">
          <div className="fade-up max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-primary" />
              FDE Learning Lab · Interactive field training
            </div>
            <h1 className="text-balance text-[clamp(2.75rem,5.8vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
              Become a Forward Deployed Engineer
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg font-medium leading-8 sm:text-xl">
              Can you ship AI that survives the <span className="text-primary">enterprise?</span>
            </p>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Learn how to take ambiguous enterprise problems from discovery to architecture, AI implementation, production deployment, adoption, and measurable business impact.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">For experienced software engineers — not beginner programming.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/learn">
                  Start learning <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/games/${featuredGame.slug}`}>
                  <Play aria-hidden="true" className="size-4" /> Run a {featuredGame.estimatedMinutes}-minute AI mission
                </Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {["No API keys required", "No typing to start", "Production trade-offs"].map((item) => (
                <span className="flex items-center gap-2" key={item}>
                  <Check aria-hidden="true" className="size-3.5 text-primary" strokeWidth={2.5} /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px] lg:mx-0">
            <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-3xl bg-primary/7 blur-2xl" />
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <TerminalSquare aria-hidden="true" className="size-3.5" /> AI Lab / NS-ROUTE-01
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span className="size-1.5 rounded-full bg-primary" /> Ready
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Today&apos;s deployment call</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">{featuredGame.customerHeadline}</h2>
                  </div>
                  <span className="rounded-md border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">{featuredScenario.customer}</span>
                </div>

                <blockquote className="my-5 border-l-2 border-primary pl-4 text-sm leading-6 text-muted-foreground">
                  {featuredScenario.briefing}
                </blockquote>

                <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-y py-4 text-sm">
                  <span className="text-muted-foreground">Decision time</span>
                  <span className="font-mono text-xs">{featuredGame.estimatedMinutes} MIN</span>
                  <span className="text-muted-foreground">System dimensions</span>
                  <span className="font-mono text-xs">4 SCORED</span>
                  <span className="text-muted-foreground">Setup required</span>
                  <span className="font-mono text-xs font-medium text-emerald-800 dark:text-emerald-400">NONE</span>
                </div>

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your next move</p>
                    <span className="font-mono text-[10px] text-muted-foreground">MODELS / 01</span>
                  </div>
                  <div className="rounded-lg border border-primary/25 bg-accent/55 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                        <Target aria-hidden="true" className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">Choose the launch routing policy.</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{featuredScenario.objective} See the quality, safety, cost, and latency consequence immediately.</p>
                        <Link className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary" href={`/games/${featuredGame.slug}`}>
                          Take the deployment call <ArrowRight aria-hidden="true" className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 hidden items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs font-medium shadow-sm sm:flex">
              <CircleDot aria-hidden="true" className="size-3.5 text-primary" /> Consequences are immediate
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/35" id="what-is-fde">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-8 lg:py-28">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Why this exists</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">What is a Forward Deployed Engineer?</h2>
            <div className="mt-5 max-w-xl space-y-4 text-base leading-7 text-muted-foreground">
              <p>
                A Forward Deployed Engineer sits between the customer&apos;s business problem and the technical solution — owning discovery, design, build, deploy, and adoption.
              </p>
              <p>
                Most engineers learn features in isolation. FDE work is ambiguous requests, enterprise constraints, and production accountability.
              </p>
              <p>
                This lab exists because that skill set is rarely taught in traditional courses or internal onboarding.
              </p>
            </div>
            <p className="mt-6 max-w-xl text-sm font-medium leading-6 text-foreground">
              Every concept appears because a customer workflow, constraint, or production system demands it.
            </p>
          </div>
          <div className="rounded-xl border bg-background p-6 sm:p-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">This is not</p>
            <ul className="mt-6 space-y-5">
              {notThisItems.map((item) => (
                <li className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4" key={item.not}>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X aria-hidden="true" className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
                    {item.not}
                  </span>
                  <ArrowRight aria-hidden="true" className="hidden size-4 text-muted-foreground sm:block" />
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Check aria-hidden="true" className="size-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                    {item.instead}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b bg-foreground text-background">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-background/15 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {[
            ["01", "From tickets", "to business problems"],
            ["02", "From features", "to measurable outcomes"],
            ["03", "From handoff", "to end-to-end ownership"],
          ].map(([number, from, to]) => (
            <div className="flex gap-5 py-8 md:px-7 md:first:pl-0 md:last:pr-0" key={number}>
              <span className="font-mono text-xs text-inverse-primary">{number}</span>
              <p className="text-lg font-medium tracking-tight">
                <span className="text-background/50">{from}</span><br />{to}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">The learning loop</p>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Training that behaves like the job.</h2>
            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              You will not memorize AI vocabulary in isolation. Every idea appears because a customer workflow, constraint, or production system demands it.
            </p>
          </div>
          <div className="grid border-y sm:grid-cols-2">
            {modes.map((mode, index) => (
              <Link className={`group py-7 transition-colors hover:bg-muted/30 sm:p-7 ${index % 2 === 0 ? "sm:border-r" : ""} ${index < 2 ? "border-b" : ""}`} href={mode.href} key={mode.eyebrow}>
                <mode.icon aria-hidden="true" className="size-5 text-primary" />
                <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{mode.eyebrow}</p>
                <h3 className="mt-2 flex items-center justify-between gap-3 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                  {mode.title} <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{mode.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/35" id="roadmap">
        <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Curriculum</p>
              <h2 className="mt-4 max-w-2xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">A field-ready skills roadmap</h2>
              <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
                {tracks.length} connected tracks — from FDE foundations through discovery, architecture, LLMs, evaluations, RAG, agents, security, and production.
              </p>
            </div>
            <Button asChild className="shrink-0" variant="outline">
              <Link href="/learn">View full roadmap <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredTracks.map((track, index) => {
              const trackLessons = lessons.filter((lesson) => lesson.frontmatter.track === track.id);
              return (
                <TrackCard
                  estimatedMinutes={trackLessons.reduce((total, lesson) => total + lesson.frontmatter.durationMinutes, 0)}
                  index={index}
                  key={track.id}
                  lessonCount={trackLessons.length}
                  track={track}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="interactive-labs">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">AI Labs</p>
            <h2 className="mt-4 max-w-2xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Interactive labs for enterprise decisions</h2>
            <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
              Simulate deployment calls, change system variables, and complete guided missions — all without API keys or setup.
            </p>
          </div>
          <Button asChild className="shrink-0" variant="outline">
            <Link href="/labs">Explore AI Labs <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {labModes.map((mode) => (
            <Link className="group flex flex-col rounded-xl border bg-card p-6 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm" href={mode.href} key={mode.label}>
              <mode.icon aria-hidden="true" className="size-5 text-primary" />
              <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{labTotals[mode.countKey]} available</p>
              <h3 className="mt-2 flex items-center justify-between gap-3 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                {mode.label} <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{mode.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {northstar ? (
        <section className="border-y bg-muted/35 px-4 sm:px-6 lg:px-8" id="enterprise-scenario">
          <div className="dot-grid relative mx-auto max-w-[1376px] overflow-hidden rounded-2xl border bg-card px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/55" />
            <div className="relative max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Enterprise scenario</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Meet your customer: {northstar.company}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{northstar.profile}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                One fictional engagement threads through lessons, labs, practice, and the capstone — from a vague AI mandate to a secure, evaluated, adopted solution with a defensible ROI story.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={`/case-studies/${northstar.slug}`}>
                    Read the case study <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/capstone">Start the capstone</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y bg-muted/35" id="framework">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">A repeatable field system</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">The 10D FDE Framework</h2>
            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              A practical operating rhythm for moving from an ambiguous request to adopted, measurable software—and bringing what you learned back into the product.
            </p>
            <Button asChild className="mt-7" variant="outline">
              <Link href="/learn">View learning roadmap <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </Button>
          </div>
          <ol className="overflow-hidden rounded-xl border bg-background">
            {framework.map(([number, title, description]) => (
              <li className="grid grid-cols-[auto_1fr] items-center gap-4 border-b px-4 py-4 last:border-b-0 sm:px-6" key={title}>
                <span className="font-mono text-xs text-muted-foreground">{number}</span>
                <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="font-semibold tracking-tight">{title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground sm:mt-0">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your field toolkit</p>
            <h2 className="mt-4 max-w-2xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Technical depth meets customer judgment.</h2>
          </div>
          <p className="max-w-md leading-7 text-muted-foreground">Build evidence across the capabilities that separate an implementer from a trusted technical owner.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-xl border sm:grid-cols-3 lg:grid-cols-6">
          {skills.map((skill) => (
            <div className="-mb-px -mr-px min-h-36 border-b border-r p-5" key={skill.label}>
              <skill.icon aria-hidden="true" className="size-5 text-primary" />
              <p className="mt-10 text-sm font-semibold">{skill.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="dot-grid relative mx-auto max-w-[1376px] overflow-hidden rounded-2xl border bg-card px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/55" />
          <div className="relative max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Capstone engagement</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Your customer is waiting.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Take Northstar Financial from a vague AI mandate to a secure, evaluated, adopted solution with a defensible ROI story.
            </p>
            <Button asChild className="mt-8" size="lg">
              <Link href="/capstone">Lead the engagement <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
