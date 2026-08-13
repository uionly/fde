import { cn } from "@/lib/utils";

export function DifficultyBadge({ difficulty }: { difficulty: "beginner" | "intermediate" | "advanced" }) {
  return <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]", difficulty === "beginner" && "border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400", difficulty === "intermediate" && "border-amber-500/25 bg-amber-500/8 text-amber-700 dark:text-amber-400", difficulty === "advanced" && "border-rose-500/25 bg-rose-500/8 text-rose-700 dark:text-rose-400")}>{difficulty}</span>;
}
