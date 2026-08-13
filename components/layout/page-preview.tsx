import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type PreviewItem = {
  label: string;
  detail: string;
};

type PagePreviewProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: PreviewItem[];
  note: string;
};

export function PagePreview({ eyebrow, title, description, icon: Icon, items, note }: PagePreviewProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="max-w-3xl">
        <div className="mb-6 grid size-11 place-items-center rounded-lg border bg-card text-primary shadow-sm">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <article className="rounded-xl border bg-card p-5 shadow-sm" key={item.label}>
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Module {String(index + 1).padStart(2, "0")}</span>
              <CheckCircle2 aria-hidden="true" className="size-4 text-muted-foreground/40" />
            </div>
            <h2 className="font-semibold tracking-tight">{item.label}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-xl border border-primary/20 bg-accent/45 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Field note:</span> {note}</p>
        </div>
        <Button asChild className="shrink-0" variant="outline">
          <Link href="/">Back to overview <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
