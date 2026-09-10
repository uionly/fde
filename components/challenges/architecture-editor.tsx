"use client";

import { Background, Controls, ReactFlow, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { architectureGraphSchema, type ArchitectureChallenge, type ArchitectureGraph } from "@/lib/challenges/schemas";

type Props = { challenge: ArchitectureChallenge; graph: ArchitectureGraph; onChange: (graph: ArchitectureGraph) => void };
export default function ArchitectureEditor({ challenge, graph, onChange }: Props) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [json, setJson] = useState(""); const [message, setMessage] = useState("");
  const labels = new Map(challenge.catalog.map((item) => [item.id, item.label]));
  function connect(source: string, target: string) {
    if (!source || !target || source === target || graph.edges.some((edge) => edge.source === source && edge.target === target)) return;
    const next = architectureGraphSchema.safeParse({ ...graph, edges: [...graph.edges, { source, target }] });
    if (next.success) { onChange(next.data); setMessage("Connection added."); }
    else setMessage("Choose two existing components. A graph supports up to 64 connections.");
  }
  const nodes: Node[] = graph.nodes.map((node) => ({ ...node, data: { label: labels.get(node.id) }, type: "default" }));
  return (
    <div className="space-y-5">
      <fieldset className="rounded-lg border p-4">
        <legend className="px-1 font-semibold">Components</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {challenge.catalog.map((item, index) => <label key={item.id} className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={graph.nodes.some((node) => node.id === item.id)} onChange={(event) => onChange(event.target.checked ? { ...graph, nodes: [...graph.nodes, { id: item.id, position: { x: (index % 3) * 240, y: Math.floor(index / 3) * 140 } }] } : { nodes: graph.nodes.filter((node) => node.id !== item.id), edges: graph.edges.filter((edge) => edge.source !== item.id && edge.target !== item.id) })} />
            <span><strong>{item.label}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.responsibility}</span></span>
          </label>)}
        </div>
      </fieldset>
      <p className="text-sm text-muted-foreground">Drag nodes and connect handles, or use the keyboard-accessible connection controls below. Arrows describe directed identity or data flow; positions do not affect evaluation.</p>
      <div className="h-[380px] overflow-hidden rounded-lg border bg-background" aria-label="Architecture canvas">
        <ReactFlow nodes={nodes} edges={graph.edges.map((edge) => ({ ...edge, id: `${edge.source}-${edge.target}`, label: "→" }))} fitView colorMode="system"
          onConnect={(connection) => connect(connection.source, connection.target)}
          onNodeDrag={(_, node) => onChange({ ...graph, nodes: graph.nodes.map((item) => item.id === node.id ? { id: item.id, position: node.position } : item) })}>
          <Background /><Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <fieldset className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <legend className="px-1 font-semibold">Connect components</legend>
        <label className="text-sm">From<select aria-label="From component" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block max-w-full rounded border bg-background p-2"><option value="">Choose component</option>{graph.nodes.map((node) => <option key={node.id} value={node.id}>{labels.get(node.id)}</option>)}</select></label>
        <label className="text-sm">To<select aria-label="To component" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block max-w-full rounded border bg-background p-2"><option value="">Choose component</option>{graph.nodes.map((node) => <option key={node.id} value={node.id}>{labels.get(node.id)}</option>)}</select></label>
        <Button variant="outline" onClick={() => connect(from, to)}>Add connection</Button>
      </fieldset>
      <ul aria-label="Connections" className="space-y-2 text-sm">{graph.edges.map((edge) => <li key={`${edge.source}-${edge.target}`} className="flex items-center justify-between gap-3 border-b pb-2"><span>{labels.get(edge.source)} → {labels.get(edge.target)}</span><button className="text-primary underline" onClick={() => onChange({ ...graph, edges: graph.edges.filter((item) => item !== edge) })} aria-label={`Remove ${labels.get(edge.source)} to ${labels.get(edge.target)}`}>Remove</button></li>)}</ul>
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">Import or export graph JSON</summary>
        <label className="mt-3 block text-sm">Graph JSON<textarea aria-label="Graph JSON" className="mt-2 min-h-40 w-full rounded border bg-background p-3 font-mono text-xs" maxLength={50000} value={json} onChange={(event) => setJson(event.target.value)} /></label>
        <div className="mt-3 flex gap-3"><Button variant="outline" onClick={() => { setJson(JSON.stringify(graph, null, 2)); setMessage("Current graph exported to the JSON field. Copy it to keep a portable artifact."); }}>Export JSON</Button><Button variant="outline" onClick={() => {
          try { const parsed = architectureGraphSchema.safeParse(JSON.parse(json)); if (!parsed.success || parsed.data.nodes.some((node) => !labels.has(node.id))) { setMessage("Invalid graph. Use unique catalog IDs and connections between existing nodes."); return; } onChange(parsed.data); setMessage("Graph imported. Evaluate it and save your draft."); } catch { setMessage("Invalid JSON. The current graph was preserved."); }
        }}>Import JSON</Button></div>
      </details>
      <p role="status" className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
