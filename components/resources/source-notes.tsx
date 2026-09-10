export function SourceNotes({ sources, reviewedAt }: { sources: Array<{ title: string; url: string }>; reviewedAt?: string }) {
  if (!sources.length && !reviewedAt) return null;
  return <section className="mt-8 border-t pt-5 text-sm" aria-label="Sources and review date"><h2 className="font-semibold">Sources and review</h2>{reviewedAt ? <p className="mt-2 text-xs text-muted-foreground">Reviewed <time dateTime={reviewedAt}>{reviewedAt}</time>. Recheck versioned specifications before implementation.</p> : null}<ul className="mt-3 space-y-2">{sources.map((source) => <li key={source.url}><a className="break-words text-primary underline underline-offset-4" href={source.url}>{source.title}</a></li>)}</ul></section>;
}
