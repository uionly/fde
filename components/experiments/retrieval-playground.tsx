"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { ExperimentShell } from "@/components/experiments/experiment-shell";
import { Button } from "@/components/ui/button";
import type { Experiment } from "@/lib/content/schemas";
import { searchCorpus, type CorpusDocument, type RetrievalStrategy } from "@/lib/experiments/simulations";

const corpus: CorpusDocument[] = [
  { id: "public-refunds", title: "Card payment reimbursement", text: "Support may credit a rejected card payment after identity verification.", department: "support", roles: ["specialist", "manager"] },
  { id: "manager-refunds", title: "High-value refund exception", text: "Reimbursements above 1000 dollars require manager approval.", department: "risk", roles: ["manager"] },
  { id: "password", title: "Credential reset procedure", text: "Password resets require a verified recovery factor.", department: "it", roles: ["specialist", "manager"] },
  { id: "chargebacks", title: "Failed payment dispute", text: "A declined card transaction may be disputed only after settlement.", department: "support", roles: ["specialist", "manager"] },
];

export function RetrievalPlayground({ experiment }: { experiment: Experiment }) {
  const [query, setQuery] = useState("Why was my card declined?"); const [strategy, setStrategy] = useState<RetrievalStrategy>("hybrid"); const [topK, setTopK] = useState(3); const [role, setRole] = useState("specialist"); const [results, setResults] = useState<ReturnType<typeof searchCorpus>>([]);
  const reset = () => { setQuery("Why was my card declined?"); setStrategy("hybrid"); setTopK(3); setRole("specialist"); setResults([]); };
  return <ExperimentShell {...experiment} onReset={reset}><div className="grid gap-5 sm:grid-cols-[1fr_auto]"><label className="text-xs font-semibold">Query<input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm" onChange={(event) => setQuery(event.target.value)} value={query} /></label><Button className="self-end" onClick={() => setResults(searchCorpus(corpus, query, strategy, topK, role))}><Search aria-hidden="true" className="size-4" />Retrieve</Button></div><div className="mt-4 grid grid-cols-3 gap-3"><label className="text-xs font-semibold">Strategy<select className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-sm" onChange={(event) => setStrategy(event.target.value as RetrievalStrategy)} value={strategy}><option value="keyword">Keyword</option><option value="vector">Vector-like</option><option value="hybrid">Hybrid</option></select></label><label className="text-xs font-semibold">Top K<input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm" max={4} min={1} onChange={(event) => setTopK(Number(event.target.value))} type="number" value={topK} /></label><label className="text-xs font-semibold">User role<select className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-sm" onChange={(event) => setRole(event.target.value)} value={role}><option value="specialist">Specialist</option><option value="manager">Manager</option></select></label></div><div aria-live="polite" className="mt-6 space-y-3">{results.length ? results.map((result, index) => <div className="grid grid-cols-[auto_1fr_auto] gap-3 rounded-lg border p-4" key={result.id}><span className="font-mono text-xs text-primary">#{index + 1}</span><div><p className="text-sm font-semibold">{result.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{result.text}</p><span className="mt-2 inline-block font-mono text-[10px] uppercase text-muted-foreground">{result.department}</span></div><span className="font-mono text-xs">{result.score.toFixed(3)}</span></div>) : <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Run retrieval. Switch the role to reveal how access filters change results.</p>}</div></ExperimentShell>;
}
