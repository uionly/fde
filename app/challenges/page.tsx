import Link from "next/link";
import { getAllChallenges } from "@/lib/content";
export const metadata = { title: "Field challenges" };
export default function ChallengesPage() {
  return <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6"><p className="font-mono text-xs uppercase tracking-widest text-primary">Applied FDE work</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Debug the incident. Design the system.</h1><p className="mt-5 max-w-3xl leading-7 text-muted-foreground">Inspect customer evidence or build a connected architecture. Get deterministic feedback, compare your reasoning, and save your work in this browser.</p><div className="mt-8 divide-y border-y">{getAllChallenges().map((item) => <Link href={`/challenges/${item.id}`} key={item.id} className="block py-6"><p className="text-xs uppercase text-primary">{item.kind} · {item.estimatedMinutes} minutes</p><h2 className="mt-2 text-xl font-semibold">{item.title} →</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p></Link>)}</div></div>;
}
