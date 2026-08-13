import { AlertTriangle, ArrowLeft, Building2, Database, Network } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Northstar Financial",
  description: "The continuous fictional customer engagement for FDE Learning Lab.",
};

type NorthstarPageProps = {
  searchParams: Promise<{ scenario?: string | string[] }>;
};

export default async function NorthstarPage({ searchParams }: NorthstarPageProps) {
  const study = getAllCaseStudies().find((item) => item.slug === "northstar");
  if (!study) notFound();

  const scenarioParam = (await searchParams).scenario;
  const requestedScenarioId = Array.isArray(scenarioParam) ? scenarioParam[0] : scenarioParam;
  const defaultOpenScenarioId = study.scenarios.some((scenario) => scenario.id === requestedScenarioId)
    ? requestedScenarioId
    : undefined;
  const scenarios = [...study.scenarios].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        href="/case-studies"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Customer engagements
      </Link>

      <header className="mt-10 grid gap-8 border-b pb-10 md:grid-cols-[1fr_280px]">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Active customer file / NS-01
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">{study.company}</h1>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">{study.profile}</p>
          <blockquote className="mt-7 border-l-2 border-primary pl-4 text-lg font-medium">
            “{study.startingRequest}”
          </blockquote>
        </div>
        <dl className="rounded-xl border bg-card p-5 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Building2 aria-hidden="true" className="size-4 text-primary" />
            Customer profile
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Industry</dt>
              <dd className="mt-1 font-medium">{study.industry}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Employees</dt>
              <dd className="mt-1 font-medium">~{study.employeeCount.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Environment</dt>
              <dd className="mt-1 font-medium">Hybrid</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Data</dt>
              <dd className="mt-1 font-medium">Synthetic</dd>
            </div>
          </div>
        </dl>
      </header>

      <section className="py-12">
        <div className="flex items-center gap-2">
          <Network aria-hidden="true" className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">System landscape</h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {study.systems.map((system) => (
            <div className="rounded-lg border bg-card p-4" key={system.name}>
              <span className="font-mono text-[10px] uppercase text-primary">{system.type}</span>
              <h3 className="mt-2 font-semibold">{system.name}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{system.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t py-12">
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">Progressive reveals</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Open each release as the engagement evolves. The initial request never tells the whole story.
        </p>
        <div className="mt-6 space-y-3">
          {scenarios.map((scenario) => (
            <details
              className="group scroll-mt-32 rounded-lg border bg-card open:border-primary/25"
              id={scenario.id}
              key={scenario.id}
              open={scenario.id === defaultOpenScenarioId}
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 p-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs text-muted-foreground">
                  {String(scenario.order).padStart(2, "0")}
                </span>
                <span className="font-semibold group-open:text-primary">{scenario.title}</span>
                <span className="ml-auto text-xs text-muted-foreground group-open:hidden">Reveal</span>
              </summary>
              <div className="border-t px-5 py-5 sm:pl-16">
                <p className="text-sm font-medium">{scenario.signal}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{scenario.customerProblem}</p>
                <div className="mt-4 rounded-md bg-muted/45 p-3 text-sm">
                  <strong>Field question:</strong> {scenario.fieldQuestion}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {scenario.skills.map((skill) => (
                    <span
                      className="rounded-full border px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-12 flex items-start gap-3 rounded-lg border border-primary/20 bg-accent/35 p-5">
        <Database aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">Safe training data</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            All people, accounts, tickets, balances, policies, and system names in the Northstar dataset are
            synthetic. They do not represent a real customer or person.
          </p>
        </div>
      </section>
    </div>
  );
}
