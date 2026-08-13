import { ArrowLeft, Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAllResources } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getAllResources().map((resource) => ({ slug: resource.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const resource = getAllResources().find((item) => item.slug === slug); return resource ? { title: resource.title, description: resource.description } : {}; }
export default async function TemplatePage({ params }: Props) { const { slug } = await params; const resource = getAllResources().find((item) => item.slug === slug); if (!resource) notFound(); return <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-8"><Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/resources"><ArrowLeft aria-hidden="true" className="size-4" />Resources</Link><header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">{resource.category} · {resource.format}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{resource.title}</h1><p className="mt-3 max-w-2xl text-muted-foreground">{resource.description}</p></div><Button asChild><a download href={`/api/resources/${resource.slug}`}><Download aria-hidden="true" className="size-4" />Download {resource.format === "markdown" ? ".md" : ".csv"}</a></Button></header><pre className="mt-10 max-h-[640px] overflow-auto whitespace-pre-wrap rounded-xl border bg-neutral-950 p-5 font-mono text-xs leading-6 text-neutral-200">{resource.body}</pre></div>; }
