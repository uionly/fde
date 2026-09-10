import Link from "next/link";
import { notFound } from "next/navigation";
import { ChallengeWorkspace } from "@/components/challenges/challenge-workspace";
import { SourceNotes } from "@/components/resources/source-notes";
import { getAllChallenges, getAllLessons } from "@/lib/content";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getAllChallenges().map((item) => ({ slug: item.id })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; return { title: getAllChallenges().find((item) => item.id === slug)?.title ?? "Challenge not found" }; }
export default async function ChallengePage({ params }: Props) {
  const { slug } = await params; const challenge = getAllChallenges().find((item) => item.id === slug); if (!challenge) notFound();
  const lessons = getAllLessons().filter((lesson) => challenge.relatedLessons.includes(lesson.frontmatter.id));
  return <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6"><Link href="/challenges" className="text-sm text-primary">← Field challenges</Link><p className="mt-8 text-xs uppercase tracking-widest text-primary">{challenge.kind} · {challenge.customer}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{challenge.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{challenge.description}</p><ChallengeWorkspace challenge={challenge} /><section className="mt-8"><h2 className="font-semibold">Related learning</h2><ul className="mt-3 space-y-2">{lessons.map((lesson) => <li key={lesson.frontmatter.id}><Link className="text-sm text-primary underline" href={`/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`}>{lesson.frontmatter.title}</Link></li>)}</ul></section><SourceNotes sources={challenge.sources} reviewedAt={challenge.reviewedAt} /></div>;
}
