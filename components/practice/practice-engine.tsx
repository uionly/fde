"use client";

import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/content/schemas";
import { filterQuestions, scoreQuestion } from "@/lib/practice/scoring";
import { cn } from "@/lib/utils";
import { writeVisitorPracticeAttempt } from "@/lib/visitor/progress";

type Result = { correct: boolean; score: number; persisted: boolean };

export function PracticeEngine({ questions, relatedLessons }: { questions: Question[]; relatedLessons: Record<string, string> }) {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const filtered = useMemo(() => filterQuestions(questions, { category, difficulty }), [questions, category, difficulty]);
  const question = filtered[index] ?? filtered[0];
  const categories = [...new Set(questions.map((item) => item.category))].sort();

  function changeFilters(nextCategory: string, nextDifficulty: string) {
    setCategory(nextCategory); setDifficulty(nextDifficulty); setIndex(0); setSelected([]); setResult(null); setError("");
  }

  function choose(choiceId: string) {
    if (!question || result) return;
    if (question.type === "multiple_choice") setSelected((values) => values.includes(choiceId) ? values.filter((value) => value !== choiceId) : [...values, choiceId]);
    else setSelected([choiceId]);
  }

  function submit() {
    if (!question || !selected.length) { setError("Choose at least one answer."); return; }
    const scored = scoreQuestion(question, selected);
    const persisted = writeVisitorPracticeAttempt({
      questionId: question.id,
      answer: scored.selected,
      correct: scored.correct,
      score: scored.score,
    });
    setResult({ correct: scored.correct, score: scored.score, persisted });
    setError(persisted ? "" : "Your result is shown, but browser storage is unavailable.");
  }

  function next() {
    setIndex((value) => filtered.length ? (value + 1) % filtered.length : 0); setSelected([]); setResult(null); setError("");
  }

  return (
    <div>
      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-muted-foreground">Category<select aria-label="Filter by category" className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground" onChange={(event) => changeFilters(event.target.value, difficulty)} value={category}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ")}</option>)}</select></label>
        <label className="text-xs font-semibold text-muted-foreground">Difficulty<select aria-label="Filter by difficulty" className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground" onChange={(event) => changeFilters(category, event.target.value)} value={difficulty}><option value="">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      </div>

      {!question ? <div className="mt-6 rounded-xl border border-dashed p-10 text-center"><p className="font-semibold">No scenarios match these filters.</p><Button className="mt-4" onClick={() => changeFilters("", "")} variant="outline"><RotateCcw aria-hidden="true" className="size-4" />Reset filters</Button></div> : (
        <article className="mt-6 overflow-hidden rounded-xl border bg-card">
          <header className="border-b bg-muted/30 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground"><span>{question.category}</span><span>·</span><span>{question.difficulty}</span></div><span className="font-mono text-[10px] text-muted-foreground">{index + 1} / {filtered.length}</span></div>
            <p className="mt-6 text-sm leading-6 text-muted-foreground">{question.scenario}</p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">{question.prompt}</h2>
            {question.type === "multiple_choice" ? <p className="mt-2 text-xs text-primary">Select all that apply.</p> : null}
          </header>

          <div className="p-5 sm:p-7">
            <fieldset className="space-y-3">
              <legend className="sr-only">Answer choices</legend>
              {question.choices?.map((choice) => {
                const checked = selected.includes(choice.id);
                const isCorrect = question.correct.includes(choice.id);
                return <label className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors", !result && "hover:border-primary/35 hover:bg-muted/25", checked && !result && "border-primary bg-accent/40", result && isCorrect && "border-emerald-500/35 bg-emerald-500/8", result && checked && !isCorrect && "border-rose-500/35 bg-rose-500/8")} key={choice.id}><input checked={checked} className="mt-0.5 size-4 accent-[var(--primary)]" disabled={Boolean(result)} name={question.id} onChange={() => choose(choice.id)} type={question.type === "multiple_choice" ? "checkbox" : "radio"} /><span className="text-sm leading-6"><span className="font-medium text-foreground">{choice.text}</span>{result ? <span className="mt-1 block text-xs text-muted-foreground">{choice.rationale}</span> : null}</span></label>;
              })}
            </fieldset>
            <p aria-live="polite" className="mt-3 min-h-5 text-sm text-rose-600 dark:text-rose-400">{error}</p>

            {result ? <div className={cn("mt-3 rounded-lg border p-5", result.correct ? "border-emerald-500/30 bg-emerald-500/8" : "border-amber-500/30 bg-amber-500/8")}>
              <div className="flex items-center gap-2 font-semibold">{result.correct ? <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-600" /> : <XCircle aria-hidden="true" className="size-5 text-amber-600" />}{result.correct ? "Strong call" : "Not quite"}</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
              <p className="mt-3 border-l-2 border-primary pl-3 text-sm font-medium">{question.principle}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span>{result.persisted ? "Attempt saved on this device" : "Attempt was not saved"}</span>{question.relatedLesson && relatedLessons[question.relatedLesson] ? <Link className="font-semibold text-primary" href={relatedLessons[question.relatedLesson]}>Review related lesson →</Link> : null}</div>
            </div> : null}

            <div className="mt-6 flex justify-end">
              {result ? <Button onClick={next}>Next scenario <ArrowRight aria-hidden="true" className="size-4" /></Button> : <Button onClick={submit}>Check decision</Button>}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
