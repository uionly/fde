"use client";

import { Check, Play, X } from "lucide-react";
import { useState } from "react";

import { ExperimentShell } from "@/components/experiments/experiment-shell";
import { Button } from "@/components/ui/button";
import type { Experiment } from "@/lib/content/schemas";
import { scoreToolSequence } from "@/lib/experiments/simulations";

const tools = [{ id: "verify-identity", label: "Verify identity" }, { id: "lookup-payment", label: "Look up payment" }, { id: "search-policy", label: "Search support policy" }, { id: "create-ticket", label: "Create support ticket" }, { id: "issue-refund", label: "Issue refund" }];
export function ToolSelectionSimulator({ experiment }: { experiment: Experiment }) {
  const [sequence, setSequence] = useState<string[]>([]); const [result, setResult] = useState<ReturnType<typeof scoreToolSequence> | null>(null); const reset = () => { setSequence([]); setResult(null); };
  return <ExperimentShell {...experiment} onReset={reset}><p className="rounded-lg border-l-2 border-primary bg-muted/30 p-4 text-sm leading-6">A verified customer asks why a card payment was declined and wants a support ticket if unresolved.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{tools.map((tool) => <Button disabled={sequence.includes(tool.id) || Boolean(result)} key={tool.id} onClick={() => setSequence((items) => [...items, tool.id])} variant="outline">{tool.label}</Button>)}</div><div className="mt-5 rounded-lg border bg-muted/25 p-4"><p className="text-xs font-semibold">Selected sequence</p><ol className="mt-3 flex flex-wrap gap-2">{sequence.length ? sequence.map((id, index) => <li className="rounded-md border bg-background px-3 py-2 text-xs" key={id}>{index + 1}. {tools.find((tool) => tool.id === id)?.label}</li>) : <li className="text-sm text-muted-foreground">Choose the minimum safe tool path.</li>}</ol></div><div className="mt-5 flex gap-3"><Button disabled={!sequence.length || Boolean(result)} onClick={() => setResult(scoreToolSequence(sequence))}><Play aria-hidden="true" className="size-4" />Evaluate sequence</Button>{sequence.length && !result ? <Button onClick={reset} variant="ghost">Clear</Button> : null}</div>{result ? <div aria-live="polite" className={`mt-5 rounded-lg border p-4 text-sm ${result.exact ? "border-emerald-500/30 bg-emerald-500/8" : "border-amber-500/30 bg-amber-500/8"}`}><p className="flex items-center gap-2 font-semibold">{result.exact ? <Check aria-hidden="true" className="size-4" /> : <X aria-hidden="true" className="size-4" />}{result.exact ? "Safe, efficient sequence" : `${result.score}/100 — revise the sequence`}</p><p className="mt-2 text-muted-foreground">Verify identity, inspect the payment, consult policy, then create a ticket if unresolved. Issuing a refund is unauthorized and unrelated to a decline diagnosis.</p></div> : null}</ExperimentShell>;
}
