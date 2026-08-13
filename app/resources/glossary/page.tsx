import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getAllGlossaryEntries } from "@/lib/content";

export const metadata: Metadata = { title: "Glossary" };
export default function GlossaryPage() { const entries = getAllGlossaryEntries().sort((a,b) => a.term.localeCompare(b.term)); return <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-8"><Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/resources"><ArrowLeft aria-hidden="true" className="size-4" />Resources</Link><h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em]">FDE glossary</h1><p className="mt-3 text-muted-foreground">A shared language for customer-facing engineering and enterprise AI systems.</p><dl className="mt-10 overflow-hidden rounded-xl border bg-card">{entries.map((entry) => <div className="border-b p-5 last:border-b-0" key={entry.slug}><dt><Link className="font-semibold hover:text-primary" href={`/resources/glossary/${entry.slug}`}>{entry.term}</Link></dt><dd className="mt-2 text-sm leading-6 text-muted-foreground">{entry.shortDefinition}</dd></div>)}</dl></div>; }
