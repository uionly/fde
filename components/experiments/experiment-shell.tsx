"use client";

import { FlaskConical, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function ExperimentShell({ title, description, learningGoal, children, onReset }: { title: string; description: string; learningGoal: string; children: ReactNode; onReset: () => void }) {
  return (
    <section className="my-8 overflow-hidden rounded-xl border bg-card">
      <header className="border-b bg-muted/35 p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><FlaskConical aria-hidden="true" className="size-3.5" />Interactive experiment</div><h2 className="mt-3 text-xl font-semibold tracking-tight">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div><Button aria-label="Reset experiment" onClick={onReset} size="icon" variant="ghost"><RotateCcw aria-hidden="true" className="size-4" /></Button></div><div className="mt-4 border-l-2 border-primary pl-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Learning goal:</strong> {learningGoal}</div></header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
