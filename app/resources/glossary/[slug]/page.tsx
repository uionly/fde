import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllGlossaryEntries, getAllLessons } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getAllGlossaryEntries().map((entry) => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const entry = getAllGlossaryEntries().find((item) => item.slug === slug); return entry ? { title: entry.term, description: entry.shortDefinition } : {}; }
export default async function GlossaryEntryPage({ params }: Props) { const { slug } = await params; const entry = getAllGlossaryEntries().find((item) => item.slug === slug); if (!entry) notFound(); const lessons = getAllLessons().filter((lesson) => entry.relatedLessons.includes(lesson.frontmatter.id)); return <div className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 lg:px-8"><Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/resources/glossary"><ArrowLeft aria-hidden="true" className="size-4" />Glossary</Link><p className="mt-10 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Field definition</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{entry.term}</h1><p className="mt-6 text-xl leading-8 text-muted-foreground">{entry.shortDefinition}</p>{lessons.length ? <section className="mt-10 border-t pt-6"><h2 className="text-sm font-semibold">Related learning</h2>{lessons.map((lesson) => <Link className="mt-3 flex items-center justify-between rounded-lg border p-4 text-sm font-semibold hover:border-primary/35 hover:text-primary" href={`/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`} key={lesson.frontmatter.id}>{lesson.frontmatter.title}<ArrowRight aria-hidden="true" className="size-4" /></Link>)}</section> : null}</div>; }
