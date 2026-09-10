import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { EmptyState } from "@/components/ui/empty-state";
import { buildSearchIndex, searchContent } from "@/lib/search/search";
export const metadata = { title: "Search" };
const labels = { lesson: "Lesson", lab: "Guided lab", experiment: "Experiment", game: "Quick mission", glossary: "Glossary", practice: "Practice", resource: "Resource", "case-study": "Case study", capstone: "Capstone", challenge: "Field challenge" } as const;
const querySchema = z.object({ q: z.string().max(200).catch(""), type: z.enum(["all", "lesson", "lab", "experiment", "game", "glossary", "practice", "resource", "case-study", "capstone", "challenge"]).catch("all") });
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q, type } = querySchema.parse(await searchParams); const query = q.trim();
  const index = buildSearchIndex().filter((item) => type === "all" || item.type === type);
  const results = query ? searchContent(index, query) : type !== "all" ? index : [];
  return <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6"><p className="font-mono text-xs uppercase tracking-widest text-primary">Global search</p><h1 className="mt-3 text-4xl font-semibold">Find the field knowledge.</h1>
    <form className="mt-8 flex flex-col gap-3 sm:flex-row" role="search">
      <label className="min-w-0 flex-1 text-sm">Search FDE knowledge<input className="mt-2 h-12 w-full rounded-lg border bg-card px-4" defaultValue={query} name="q" maxLength={200} placeholder="Search a problem, concept, or artifact…" type="search" /></label>
      <label className="text-sm">Content type<select className="mt-2 block h-12 rounded-lg border bg-card px-3" name="type" defaultValue={type}><option value="all">All content</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <button className="h-12 self-end rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground" type="submit">Search</button>
    </form>
    <div className="mt-8">{results.length ? <><p className="mb-3 text-sm text-muted-foreground">{results.length} results{query ? ` for “${query}”` : ""}</p><div className="divide-y rounded-xl border bg-card">{results.map((result) => <Link className="group flex justify-between gap-4 p-5 hover:bg-muted/25" href={result.href} key={`${result.type}-${result.id}`}><div><span className="text-xs uppercase text-primary">{labels[result.type]}</span><h2 className="mt-2 font-semibold group-hover:text-primary">{result.title}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.description}</p></div><ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link>)}</div></> : <EmptyState title={query ? `No results for “${query}”` : "Search the entire learning lab"} description="Search lessons, labs, challenges, glossary terms, and the full text of downloadable templates. You can also choose a content type to browse it." />}</div>
  </div>;
}
