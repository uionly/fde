import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getAllExperiments, getAllGlossaryEntries, getAllLabs, getAllLessons, getAllQuestions, getAllResources, getAllTracks } from "@/lib/content";

const framework = [
  ["01", "Discover", "Find the real problem"],
  ["02", "Define", "Set the outcome"],
  ["03", "De-risk", "Test assumptions"],
  ["04", "Design", "Shape the system"],
  ["05", "Demonstrate", "Make it tangible"],
  ["06", "Develop", "Build the path"],
  ["07", "Evaluate", "Prove quality"],
  ["08", "Deploy", "Ship safely"],
  ["09", "Drive adoption", "Change the workflow"],
  ["10", "Distill", "Productize learning"],
] as const;

export default function HomePage() {
  const tracks = getAllTracks();
  const destinations = [
    { href: "/challenges", title: "Debugging and architecture challenges", detail: "Inspect incident evidence, connect architecture components, and test your decisions against customer constraints." },
    { href: "/learn", title: "Learning tracks", detail: `${getAllLessons().length} lessons across ${tracks.length} tracks. Build foundations, then work through customer discovery and enterprise systems.` },
    { href: "/experiments", title: "Interactive experiments", detail: `${getAllExperiments().length} playgrounds to explore chunking, retrieval, tool selection, security, and cost.` },
    { href: "/practice", title: "Scenario practice", detail: `${getAllQuestions().length} questions with explanations to sharpen your customer and engineering decisions.` },
    { href: "/labs#field-missions", title: "Guided labs", detail: `${getAllLabs().length} step-by-step customer assignments with hints, working notes, and saved progress.` },
    { href: "/resources", title: "Templates and checklists", detail: `${getAllResources().length} downloadable artifacts for discovery, architecture, delivery, and customer handover.` },
    { href: "/resources/glossary", title: "FDE glossary", detail: `${getAllGlossaryEntries().length} terms connected to lessons and experiments. Look up a concept while you work.` },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section aria-labelledby="home-title" className="max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">FDE Learning Lab</p>
        <h1 id="home-title" className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Become a Forward Deployed Engineer</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">Your workspace for FDE learning and field reference. Take ambiguous customer problems through discovery, architecture, implementation, production, adoption, and measurable business impact.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link href="/learn">Start learning <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/progress">Continue your learning</Link></Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">No account or API keys needed. Progress is saved in this browser.</p>
      </section>

      <section id="what-is-fde" aria-labelledby="fde-role-title" className="mt-10 max-w-3xl border-t pt-6">
        <h2 id="fde-role-title" className="text-xl font-semibold">What is a Forward Deployed Engineer?</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">A Forward Deployed Engineer works directly with customers to turn ambiguous business problems into working systems, from discovery and design through implementation, deployment, and adoption. This lab helps experienced software engineers practice that end-to-end responsibility.</p>
      </section>

      <form action="/search" role="search" aria-label="Search FDE knowledge" className="mt-10 rounded-xl border bg-card p-5 sm:p-6">
        <label htmlFor="home-search" className="font-semibold">What do you need to learn or solve?</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input id="home-search" name="q" type="search" placeholder="Search lessons, customer problems, or templates…" className="h-12 min-w-0 flex-1 rounded-md border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <Button type="submit" size="lg"><Search aria-hidden="true" className="size-4" />Search</Button>
        </div>
      </form>

      <section aria-labelledby="toolkit-title" className="mt-12">
        <h2 id="toolkit-title" className="text-2xl font-semibold tracking-tight">Learn, practice, and find answers</h2>
        <div className="mt-5 grid gap-x-8 md:grid-cols-2">
          {destinations.map((item) => (
            <Link key={item.href} href={item.href} className="group border-t py-5">
              <h3 className="flex items-center justify-between gap-3 font-semibold group-hover:text-primary">{item.title}<ArrowRight aria-hidden="true" className="size-4 shrink-0" /></h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="roadmap-title" id="roadmap" className="mt-12 border-t pt-8">
        <h2 id="roadmap-title" className="text-2xl font-semibold tracking-tight">Explore the FDE roadmap</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Start with foundations, then follow the published tracks or choose the problem you face today.</p>
        <ol className="mt-5 grid gap-x-8 md:grid-cols-2">
          {tracks.map((track, index) => (
            <li key={track.id} className="border-b">
              <Link href={`/learn/${track.slug}`} className="group flex items-center gap-4 py-4 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-medium group-hover:text-primary">{track.title}</span>
                <ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="customer-title" className="mt-12 rounded-xl border bg-card p-6 sm:p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">One continuous customer engagement</p>
        <h2 id="customer-title" className="mt-3 text-2xl font-semibold">Northstar Financial</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">You have been deployed to a fictional financial-services customer asking for an AI service agent. Discover the real workflow, protect sensitive data, test the system, and demonstrate business value.</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/case-studies/northstar">Read the customer brief →</Link>
          <Link href="/capstone">Lead the capstone engagement →</Link>
          <Link href="/labs">Explore AI Labs →</Link>
        </div>
      </section>

      <section aria-labelledby="framework-title" id="framework" className="mt-12 border-t pt-8">
        <h2 id="framework-title" className="text-2xl font-semibold tracking-tight">The 10D FDE Framework</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">A repeatable operating rhythm for taking a customer problem through delivery and bringing the learning back into the product.</p>
        <ol className="mt-5 grid gap-x-8 sm:grid-cols-2">
          {framework.map(([number, title, description]) => (
            <li key={number} className="flex gap-4 border-b py-3 text-sm">
              <span className="font-mono text-xs text-primary">{number}</span>
              <div><h3 className="font-medium">{title}</h3><p className="mt-1 text-muted-foreground">{description}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
