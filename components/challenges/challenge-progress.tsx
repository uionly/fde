"use client";
import Link from "next/link";
import { evaluateChallenge } from "@/lib/challenges/evaluate";
import type { Challenge } from "@/lib/challenges/schemas";
import { useChallenges } from "@/lib/challenges/storage";
export function ChallengeProgress({ challenges }: { challenges: Challenge[] }) {
  const { drafts } = useChallenges();
  return <section className="mx-auto mb-12 max-w-[1200px] rounded-xl border p-6" aria-label="Field challenge progress"><h2 className="text-xl font-semibold">Field challenge progress</h2><p className="mt-2 text-sm text-muted-foreground">Saved work is checked against the current rules. Results are shown separately from skill scores; reasoning is self-reviewed.</p><ul className="mt-4 divide-y">{challenges.map((item) => { const draft = drafts[item.id]; const result = draft ? evaluateChallenge(item, draft) : null; return <li key={item.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><Link className="font-medium text-primary" href={`/challenges/${item.id}`}>{item.title}</Link><span>{result?.complete ? "Authored checks passed" : draft ? "Draft saved · needs revision" : "Not started"}</span></li>; })}</ul></section>;
}
