import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="font-semibold text-foreground">FDE Learning Lab</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Interactive field training for engineers who want to own the customer outcome.</p>
          <Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary" href="/games/model-router-arena">
            Run a mission <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <nav aria-label="Learning links">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Learn</p>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm">
            <Link className="transition-colors hover:text-primary" href="/learn">Learning tracks</Link>
            <Link className="transition-colors hover:text-primary" href="/practice">Practice</Link>
            <Link className="transition-colors hover:text-primary" href="/resources">Resources</Link>
          </div>
        </nav>
        <nav aria-label="AI Labs links">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">AI Labs</p>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm">
            <Link className="transition-colors hover:text-primary" href="/labs">Overview</Link>
            <Link className="transition-colors hover:text-primary" href="/games">Field Arcade</Link>
            <Link className="transition-colors hover:text-primary" href="/experiments">Playgrounds</Link>
          </div>
        </nav>
        <nav aria-label="Customer engagement links">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Customer</p>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm">
            <Link className="transition-colors hover:text-primary" href="/case-studies">Northstar engagement</Link>
            <Link className="transition-colors hover:text-primary" href="/capstone">Capstone</Link>
            <Link className="transition-colors hover:text-primary" href="/progress">Progress</Link>
          </div>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Built for engineers who want to own the outcome.</p>
          <Link className="inline-flex items-center gap-1 transition-colors hover:text-foreground" href="/learn">
            Start learning <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
