"use client";

import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  CircleDot,
  Cpu,
  Radio,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { OperationsDashboard } from "@/lib/operations/dashboard";
import { cn } from "@/lib/utils";

const toneClasses = {
  cyan: "border-[#05bee7]/25 bg-[#05bee7]/[0.06] text-[#81dff5]",
  magenta: "border-[#f45aa6]/25 bg-[#f45aa6]/[0.06] text-[#f88ac0]",
  emerald: "border-[#4cb182]/25 bg-[#4cb182]/[0.06] text-[#82c8a8]",
} as const;

const incidentClasses = {
  info: "border-[#05bee7]/30 bg-[#05bee7]/10 text-[#81dff5]",
  warning: "border-[#f5a623]/30 bg-[#f5a623]/10 text-[#f9cd84]",
  critical: "border-[#ef4d65]/30 bg-[#ef4d65]/10 text-[#f48293]",
} as const;

function formatMetric(value: number, unit: string) {
  if (unit === "%") return `${value.toFixed(2)}%`;
  if (unit === "ms") return `${Math.round(value)}ms`;
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function MetricCard({ metric, tick }: { metric: OperationsDashboard["metrics"][number]; tick: number }) {
  const liveValue = metric.value + (metric.id === "tokens" ? tick * 137 : metric.id === "requests" ? (tick % 5) * 7 : 0);

  return (
    <article className={cn("ops-panel group relative overflow-hidden border p-4", toneClasses[metric.tone])}>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-current opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a8a8b2]">{metric.label}</p>
        <Activity aria-hidden="true" className="size-4 opacity-70" />
      </div>
      <p className="mt-4 font-mono text-2xl font-semibold tracking-[-0.04em] text-[#f8f8fa] sm:text-[1.7rem]">
        {formatMetric(liveValue, metric.unit)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
        <span className={metric.delta >= 0 ? "text-[#82c8a8]" : "text-[#81dff5]"}>
          {metric.delta >= 0 ? "▲" : "▼"} {Math.abs(metric.delta)}%
        </span>
        <span className="text-[#7c7c88]">vs previous hour</span>
      </div>
    </article>
  );
}

function SystemMap({ data, tick }: { data: OperationsDashboard; tick: number }) {
  const nodes = [
    { label: "EDGE", detail: "1.8k rpm", x: 8, y: 44, tone: "cyan" },
    { label: "ROUTER", detail: "74% load", x: 31, y: 18, tone: "magenta" },
    { label: "RETRIEVAL", detail: "7 docs/run", x: 54, y: 54, tone: "cyan" },
    { label: "GUARD", detail: "142 queued", x: 76, y: 18, tone: "amber" },
    { label: "RESPONSE", detail: "99.7% ok", x: 91, y: 55, tone: "emerald" },
  ] as const;

  return (
    <section aria-labelledby="activity-map-title" className="ops-panel min-w-0 border border-[#2f3038] bg-[#0d0e13]">
      <div className="flex items-center justify-between border-b border-[#2f3038] px-4 py-3">
        <div>
          <p className="ops-eyebrow"><Radio aria-hidden="true" className="size-3.5" /> Live topology</p>
          <h2 className="mt-1 text-base font-semibold text-[#f8f8fa]" id="activity-map-title">AI activity grid</h2>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] text-[#82c8a8]">
          <span aria-hidden="true" className="ops-live-dot" /> STREAMING
        </span>
      </div>
      <div className="relative h-[300px] overflow-hidden sm:h-[340px]">
        <div aria-hidden="true" className="ops-grid absolute inset-0 opacity-60" />
        <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 72">
          <defs>
            <linearGradient id="signal" x1="0" x2="1">
              <stop offset="0" stopColor="#05bee7" stopOpacity=".2" />
              <stop offset=".5" stopColor="#f45aa6" stopOpacity=".9" />
              <stop offset="1" stopColor="#82c8a8" stopOpacity=".25" />
            </linearGradient>
          </defs>
          <path className="ops-signal-path" d="M12 47 C20 47 22 22 33 22 S44 57 56 57 S67 22 78 22 S86 58 93 58" fill="none" stroke="url(#signal)" strokeWidth=".65" />
          <path d="M12 47 C20 47 22 22 33 22 S44 57 56 57 S67 22 78 22 S86 58 93 58" fill="none" stroke="#05bee7" strokeDasharray="1 4" strokeOpacity=".2" strokeWidth=".25" />
        </svg>
        {nodes.map((node, index) => (
          <div
            className={cn(
              "ops-node absolute w-[84px] -translate-x-1/2 -translate-y-1/2 border bg-[#111218] px-2 py-2 text-center sm:w-[100px]",
              node.tone === "cyan" && "border-[#05bee7]/40 shadow-[0_0_24px_rgba(5,190,231,0.08)]",
              node.tone === "magenta" && "border-[#f45aa6]/40 shadow-[0_0_24px_rgba(244,90,166,0.08)]",
              node.tone === "amber" && "border-[#f5a623]/50 shadow-[0_0_24px_rgba(245,166,35,0.09)]",
              node.tone === "emerald" && "border-[#4cb182]/40 shadow-[0_0_24px_rgba(76,177,130,0.08)]",
            )}
            key={node.label}
            style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${index * 180}ms` }}
          >
            <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#e6e6ea]">{node.label}</span>
            <span className="mt-1 block font-mono text-[9px] text-[#7c7c88]">{index === 2 ? `${7 + (tick % 3)} docs/run` : node.detail}</span>
          </div>
        ))}
        <p className="absolute bottom-3 left-4 right-4 font-mono text-[9px] text-[#595964]">
          {data.activity.map((edge) => `${edge.source} → ${edge.target} ${edge.volume}%`).join("  //  ")}
        </p>
      </div>
    </section>
  );
}

export function AIOperationsCenter({ data }: { data: OperationsDashboard }) {
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const formatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1400);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="ops-shell min-h-[calc(100vh-4rem)] bg-[#08090d] text-[#e6e6ea]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 border-b border-[#2f3038] pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#81dff5]">
              <span className="rounded-sm border border-[#05bee7]/25 bg-[#05bee7]/10 px-2 py-1">Command deck 01</span>
              <span className="text-[#595964]">/</span>
              <span>{data.environment}</span>
            </div>
            <h1 className="text-balance text-3xl font-extrabold tracking-[-0.045em] text-[#f8f8fa] sm:text-4xl">
              AI Operations <span className="text-[#f45aa6]">Center</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a8a8b2]">
              Observe model traffic, token economics, safety controls, and customer-impacting incidents across Northstar&apos;s production AI estate.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ops-status"><ServerCog aria-hidden="true" className="size-3.5" /> {data.region}</span>
            <span className="ops-status text-[#82c8a8]"><CircleDot aria-hidden="true" className="size-3.5" /> 12 / 13 systems nominal</span>
            <Button className="border-[#f45aa6]/50 bg-[#f45aa6]/10 font-mono text-xs text-[#f88ac0] hover:bg-[#f45aa6]/20" onClick={() => setToast("Snapshot captured for the incident timeline.")} size="sm" variant="outline">
              <Sparkles aria-hidden="true" className="size-3.5" /> Capture snapshot
            </Button>
          </div>
        </header>

        <section aria-label="Live system metrics" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} tick={tick} />)}
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <SystemMap data={data} tick={tick} />

          <section aria-labelledby="fleet-title" className="ops-panel border border-[#2f3038] bg-[#0d0e13]">
            <div className="border-b border-[#2f3038] px-4 py-3">
              <p className="ops-eyebrow"><Cpu aria-hidden="true" className="size-3.5" /> Model fleet</p>
              <h2 className="mt-1 text-base font-semibold text-[#f8f8fa]" id="fleet-title">Active inference lanes</h2>
            </div>
            <div className="divide-y divide-[#212127]">
              {data.models.map((model, index) => {
                const load = Math.min(99, model.load + ((tick + index) % 3) - 1);
                return (
                  <article className="px-4 py-3.5" key={model.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#e6e6ea]">{model.name}</p>
                        <p className="mt-0.5 truncate font-mono text-[9px] text-[#7c7c88]">{model.model}</p>
                      </div>
                      <span className={cn("font-mono text-[9px] uppercase tracking-wider", model.status === "healthy" ? "text-[#82c8a8]" : "text-[#f9cd84]")}>
                        {model.status}
                      </span>
                    </div>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#212127]">
                      <div className={cn("h-full transition-[width] duration-700", model.status === "healthy" ? "bg-[#05bee7]" : "bg-[#f5a623]")} style={{ width: `${load}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[9px] text-[#7c7c88]">
                      <span>{load}% LOAD</span>
                      <span>{formatter.format(model.tokensPerSecond + (tick % 4) * 11)} tok/s</span>
                      <span>{model.latency + (tick % 3) * 4}ms</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <section aria-labelledby="terminal-title" className="ops-panel min-w-0 border border-[#2f3038] bg-[#0a0b0f]">
            <div className="flex items-center justify-between border-b border-[#2f3038] px-4 py-3">
              <div>
                <p className="ops-eyebrow"><Terminal aria-hidden="true" className="size-3.5" /> Event stream</p>
                <h2 className="mt-1 text-base font-semibold text-[#f8f8fa]" id="terminal-title">Production terminal</h2>
              </div>
              <span aria-label="Terminal connected" className="flex gap-1.5">
                <i className="size-2 rounded-full bg-[#ef4d65]" /><i className="size-2 rounded-full bg-[#f5a623]" /><i className="size-2 rounded-full bg-[#4cb182]" />
              </span>
            </div>
            <div className="min-h-[260px] overflow-x-auto p-4 font-mono text-[10px] leading-6 sm:text-[11px]">
              <p className="text-[#595964]">$ watch ai-runtime --env {data.environment} --follow</p>
              {data.terminal.map((entry, index) => (
                <p className="min-w-[620px]" key={`${entry.time}-${entry.message}`}>
                  <span className="text-[#595964]">{entry.time}</span>{" "}
                  <span className={cn(entry.level === "success" && "text-[#82c8a8]", entry.level === "warning" && "text-[#f9cd84]", entry.level === "info" && "text-[#81dff5]")}>
                    [{entry.level.toUpperCase()}]
                  </span>{" "}
                  <span className="text-[#d0d0d7]">{entry.message}</span>
                  {index === data.terminal.length - 1 ? <span aria-hidden="true" className="ops-cursor ml-1 inline-block h-3 w-1.5 bg-[#f45aa6] align-middle" /> : null}
                </p>
              ))}
            </div>
          </section>

          <section aria-labelledby="incidents-title" className="ops-panel border border-[#2f3038] bg-[#0d0e13]">
            <div className="flex items-center justify-between border-b border-[#2f3038] px-4 py-3">
              <div>
                <p className="ops-eyebrow"><AlertTriangle aria-hidden="true" className="size-3.5" /> Incident channel</p>
                <h2 className="mt-1 text-base font-semibold text-[#f8f8fa]" id="incidents-title">Live response feed</h2>
              </div>
              <span className="rounded-sm border border-[#ef4d65]/30 bg-[#ef4d65]/10 px-2 py-1 font-mono text-[9px] text-[#f48293]">2 ACTIVE</span>
            </div>
            <div className="divide-y divide-[#212127]">
              {data.incidents.map((incident) => (
                <article className="group px-4 py-3" key={incident.id}>
                  <div className="flex gap-3">
                    <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border", incidentClasses[incident.severity])}>
                      {incident.severity === "critical" ? <Zap aria-hidden="true" className="size-3.5" /> : incident.severity === "warning" ? <AlertTriangle aria-hidden="true" className="size-3.5" /> : <ShieldCheck aria-hidden="true" className="size-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-5 text-[#e6e6ea]">{incident.title}</p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[#7c7c88]">{incident.id} · {incident.service} · {incident.ageMinutes}m</p>
                    </div>
                    <button
                      aria-label={`Acknowledge ${incident.id}`}
                      className="grid size-8 shrink-0 place-items-center rounded-sm text-[#7c7c88] transition-colors hover:bg-[#212127] hover:text-[#81dff5]"
                      onClick={() => setToast(`${incident.id} acknowledged. Response lead notified.`)}
                      type="button"
                    >
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  <p className="ml-10 mt-2 font-mono text-[9px] uppercase tracking-wider text-[#a8a8b2]">Status: {incident.status}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div aria-atomic="true" aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[80] w-[min(360px,calc(100vw-2rem))]">
        {toast ? (
          <div className="ops-toast pointer-events-auto flex items-start gap-3 border border-[#05bee7]/40 bg-[#111218]/95 p-4 shadow-[0_16px_60px_rgba(0,0,0,0.5)] backdrop-blur">
            <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-[#4cb182]/15 text-[#82c8a8]"><Check aria-hidden="true" className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#81dff5]">Command accepted</p>
              <p className="mt-1 text-xs leading-5 text-[#d0d0d7]">{toast}</p>
            </div>
            <button aria-label="Dismiss notification" className="text-[#7c7c88] hover:text-[#f8f8fa]" onClick={() => setToast(null)} type="button"><X aria-hidden="true" className="size-4" /></button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
