import { AlertTriangle, Building2, Lightbulb, Sparkles } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { MDXExperiment } from "@/components/experiments/mdx-experiment";

export function FDEPrinciple({ children, title = "FDE Principle", variant = "principle" }: { children: ReactNode; title?: string; variant?: "principle" | "warning" | "insight" }) {
  const Icon = variant === "warning" ? AlertTriangle : variant === "insight" ? Lightbulb : Sparkles;
  return (
    <aside className="my-8 rounded-lg border border-primary/25 bg-accent/45 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground"><Icon aria-hidden="true" className="size-4" />{title}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div>
    </aside>
  );
}

export function CustomerScenario({ children, title = "Customer scenario" }: { children: ReactNode; title?: string }) {
  return (
    <aside className="my-8 overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b bg-muted/45 px-5 py-3 text-sm font-semibold"><Building2 aria-hidden="true" className="size-4 text-primary" />{title}</div>
      <div className="p-5 text-sm leading-6 text-muted-foreground">{children}</div>
    </aside>
  );
}

export function Callout({ children, title }: { children: ReactNode; title?: string }) {
  return <aside className="my-8 border-l-2 border-primary pl-5 text-sm leading-6 text-muted-foreground">{title ? <strong className="mb-1 block text-foreground">{title}</strong> : null}{children}</aside>;
}

export function MermaidDiagram({ chart, label = "Architecture diagram" }: { chart: string; label?: string }) {
  return <figure aria-label={label} className="my-8 overflow-x-auto rounded-lg border bg-muted/30 p-5"><pre className="text-xs leading-6 text-muted-foreground"><code>{chart}</code></pre><figcaption className="mt-3 text-xs text-muted-foreground">Diagram source preview — interactive rendering follows in a later milestone.</figcaption></figure>;
}

export const mdxComponents = {
  FDEPrinciple,
  CustomerScenario,
  Callout,
  MermaidDiagram,
  Experiment: MDXExperiment,
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => {
    const title = typeof children === "string" ? children : "";
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return <h2 className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight" id={id} {...props}>{children}</h2>;
  },
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="mt-8 scroll-mt-24 text-xl font-semibold tracking-tight" {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="mt-4 leading-7 text-muted-foreground" {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground" {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground" {...props} />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => <pre className="my-6 overflow-x-auto rounded-lg border bg-stone-900 p-5 font-mono text-sm leading-6 text-stone-100" {...props} />,
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground", className)} {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => <a className="font-semibold text-primary underline-offset-4 hover:underline" {...props} />,
};
