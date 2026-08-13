import { cn } from "@/lib/utils";

export function ProgressBar({ value, className, label = "Progress" }: { value: number; className?: string; label?: string }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div aria-label={`${label}: ${safeValue}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={safeValue} className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)} role="progressbar">
      <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
