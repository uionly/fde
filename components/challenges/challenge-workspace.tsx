"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { evaluateChallenge } from "@/lib/challenges/evaluate";
import { challengeDraftSchema, type Challenge, type ChallengeDraft } from "@/lib/challenges/schemas";
import { saveChallenge, useChallenges } from "@/lib/challenges/storage";

const ArchitectureEditor = dynamic(() => import("@/components/challenges/architecture-editor"), { ssr: false, loading: () => <p role="status">Loading architecture editor…</p> });

export function ChallengeWorkspace({ challenge }: { challenge: Challenge }) {
  const saved = useChallenges().drafts[challenge.id];
  return <Session key={JSON.stringify(saved ?? null)} challenge={challenge} saved={saved} />;
}
function Session({ challenge, saved }: { challenge: Challenge; saved?: ChallengeDraft }) {
  const initial = () => challengeDraftSchema.parse({ graph: challenge.kind === "architecture" ? challenge.starter : { nodes: [], edges: [] } });
  const [draft, setDraft] = useState<ChallengeDraft>(() => saved ?? initial());
  const [evaluated, setEvaluated] = useState(Boolean(saved));
  const [message, setMessage] = useState(saved ? "Saved draft loaded from this browser." : ""); const [showHint, setShowHint] = useState(false);
  const result = evaluateChallenge(challenge, draft);
  function update(patch: Partial<ChallengeDraft>) { setDraft((current) => ({ ...current, ...patch })); setEvaluated(false); setMessage("Unsaved changes. Choose Save draft before leaving."); }
  return (
    <div className="mt-8 space-y-6">
      <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">All customer evidence is synthetic. Save draft before leaving to resume in this browser. Automated checks evaluate authored decisions and diagram constraints; written reasoning requires self-review.</p>
      {challenge.kind === "debugging" ? <>
        <section aria-labelledby="evidence-title"><h2 id="evidence-title" className="text-xl font-semibold">Incident evidence</h2><div className="mt-4 space-y-3">{challenge.evidence.map((item) => <details className="rounded-lg border bg-card p-4" key={item.id}><summary className="cursor-pointer text-sm font-semibold">{item.title} · {item.type}</summary><pre className="mt-4 whitespace-pre-wrap break-words font-mono text-xs leading-6">{item.body}</pre><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.evidence.includes(item.id)} onChange={(event) => update({ evidence: event.target.checked ? [...draft.evidence, item.id] : draft.evidence.filter((id) => id !== item.id) })} />Cite {item.title}</label></details>)}</div></section>
        {([['cause', 'Root cause', challenge.causes], ['remediation', 'Remediation', challenge.remediations]] as const).map(([field, label, options]) => <fieldset className="space-y-3 rounded-lg border p-5" key={field}><legend className="px-1 font-semibold">{label}</legend>{options.map((option) => <label className="flex items-start gap-3 text-sm" key={option.id}><input type="radio" name={field} checked={draft[field] === option.id} onChange={() => update({ [field]: option.id })} />{option.label}</label>)}</fieldset>)}
      </> : <><section><h2 className="text-xl font-semibold">Customer constraints</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{challenge.rules.map((rule) => <li key={rule.id}>{rule.message}</li>)}</ul></section><ArchitectureEditor challenge={challenge} graph={draft.graph} onChange={(graph) => update({ graph })} /></>}
      <label className="block text-sm font-semibold">Your reasoning and verification plan<textarea className="mt-2 min-h-36 w-full rounded-lg border bg-background p-4 text-sm leading-6" value={draft.reasoning} maxLength={10000} onChange={(event) => update({ reasoning: event.target.value })} placeholder="Cite evidence, explain the trade-off, and describe the positive and negative tests you would run." /></label>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setEvaluated(true)}>Evaluate work</Button>
        <Button variant="outline" onClick={() => { if (!saveChallenge(challenge.id, draft)) setMessage("Could not save on this device. Your work remains in the editor; check browser storage and try again."); else setMessage("Draft saved on this device."); }}>Save draft</Button>
        <Button variant="ghost" onClick={() => setShowHint(!showHint)}>{showHint ? "Hide hint" : "Show hint"}</Button>
        <Button variant="ghost" onClick={() => { const fresh = initial(); if (saveChallenge(challenge.id, fresh)) { setDraft(fresh); setEvaluated(false); setMessage("Draft reset."); } else setMessage("Could not reset saved work on this device."); }}>Reset draft</Button>
      </div>
      <p role="status" className="text-sm text-muted-foreground">{message}</p>
      {showHint ? <p className="rounded-lg bg-accent p-4 text-sm">{challenge.hint}</p> : null}
      {evaluated ? <section aria-label="Evaluation results" className="rounded-lg border p-5"><h2 className="text-lg font-semibold">{result.complete ? "Authored checks passed" : "Work needs revision"} · {result.score}%</h2><ul className="mt-4 space-y-3 text-sm">{result.checks.map((check) => <li key={check.id}><strong>{check.passed ? "Pass" : "Revise"}:</strong> {check.message}</li>)}</ul><p className="mt-4 text-xs text-muted-foreground">The percentage is the fraction of authored checks passed, not a production-readiness certification.</p></section> : null}
      <details className="rounded-lg border p-5"><summary className="cursor-pointer font-semibold">Reveal expert comparison</summary><p className="mt-4 text-sm leading-7 text-muted-foreground">{challenge.expertReasoning}</p>{challenge.kind === "architecture" ? <pre className="mt-4 max-h-80 overflow-auto text-xs">{JSON.stringify(challenge.example, null, 2)}</pre> : null}</details>
    </div>
  );
}
