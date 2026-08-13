"use client";

import { Play } from "lucide-react";
import { useState } from "react";

import { ExperimentShell } from "@/components/experiments/experiment-shell";
import { Button } from "@/components/ui/button";
import type { Experiment } from "@/lib/content/schemas";
import { chunkText, type ChunkStrategy } from "@/lib/experiments/simulations";

const sample = "Northstar support specialists search three repositories for refund policy. Public procedures are available to all support staff. Manager exceptions require elevated access. Every answer must cite the source policy and preserve its permissions.";

export function ChunkingPlayground({ experiment }: { experiment: Experiment }) {
  const [text, setText] = useState(sample); const [size, setSize] = useState(16); const [overlap, setOverlap] = useState(3); const [strategy, setStrategy] = useState<ChunkStrategy>("words"); const [chunks, setChunks] = useState<string[]>([]);
  const reset = () => { setText(sample); setSize(16); setOverlap(3); setStrategy("words"); setChunks([]); };
  return <ExperimentShell {...experiment} onReset={reset}><div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4"><label className="block text-xs font-semibold">Source text<textarea className="mt-2 min-h-40 w-full rounded-md border bg-background p-3 text-sm leading-6" onChange={(event) => setText(event.target.value)} value={text} /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold">Chunk size<input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm" max={80} min={2} onChange={(event) => setSize(Number(event.target.value))} type="number" value={size} /></label><label className="text-xs font-semibold">Overlap<input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm" max={Math.max(0, size - 1)} min={0} onChange={(event) => setOverlap(Number(event.target.value))} type="number" value={overlap} /></label></div><label className="block text-xs font-semibold">Split strategy<select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm" onChange={(event) => setStrategy(event.target.value as ChunkStrategy)} value={strategy}><option value="words">Words</option><option value="sentences">Sentences</option></select></label><Button onClick={() => setChunks(chunkText(text, size, overlap, strategy))}><Play aria-hidden="true" className="size-4" />Create chunks</Button></div><div aria-live="polite" className="rounded-lg border bg-muted/25 p-4"><div className="flex justify-between text-xs font-semibold"><span>Output</span><span className="font-mono text-muted-foreground">{chunks.length} chunks</span></div><div className="mt-4 max-h-[430px] space-y-3 overflow-auto">{chunks.length ? chunks.map((chunk, index) => <div className="rounded-md border bg-background p-3" key={`${index}-${chunk}`}><span className="font-mono text-[10px] text-primary">CHUNK {index + 1}</span><p className="mt-2 text-xs leading-5 text-muted-foreground">{chunk}</p></div>) : <p className="text-sm text-muted-foreground">Run the experiment to inspect boundaries and overlap.</p>}</div></div></div></ExperimentShell>;
}
