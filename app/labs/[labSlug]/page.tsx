import { ArrowLeft, CheckCircle2, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LabWorkspace } from "@/components/labs/lab-workspace";
import { getAllLabs } from "@/lib/content";

type PageProps = { params: Promise<{ labSlug: string }> };
export function generateStaticParams() { return getAllLabs().map((lab) => ({ labSlug: lab.slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const { labSlug } = await params; const lab = getAllLabs().find((item) => item.slug === labSlug); return lab ? { title: lab.title, description: lab.description } : {}; }
export default async function LabPage({ params }: PageProps) { const { labSlug } = await params; const lab = getAllLabs().find((item) => item.slug === labSlug); if (!lab) notFound(); return <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8"><Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/labs#field-missions"><ArrowLeft aria-hidden="true" className="size-4" />All field missions</Link><header className="mt-10 grid gap-8 border-b pb-8 md:grid-cols-[1fr_300px]"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Field mission</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{lab.title}</h1><p className="mt-4 leading-7 text-muted-foreground">{lab.description}</p></div><aside className="rounded-lg bg-muted/35 p-4"><p className="flex items-center gap-2 text-sm font-semibold"><Clock3 aria-hidden="true" className="size-4 text-primary" />{lab.estimatedMinutes} minutes</p><ul className="mt-4 space-y-2">{lab.goals.map((goal) => <li className="flex gap-2 text-xs leading-5 text-muted-foreground" key={goal}><CheckCircle2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />{goal}</li>)}</ul></aside></header><div className="my-8 rounded-lg border-l-2 border-primary bg-accent/35 p-5"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Customer scenario</p><p className="mt-2 text-sm leading-6">{lab.scenario}</p><Link className="mt-3 inline-block text-xs font-semibold text-primary" href="/case-studies/northstar">Open Northstar customer file →</Link></div><LabWorkspace lab={lab} /></div>; }
