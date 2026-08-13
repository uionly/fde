import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, action, icon: Icon = SearchX }: { title: string; description: string; action?: ReactNode; icon?: LucideIcon }) { return <div className="rounded-xl border border-dashed p-10 text-center"><Icon aria-hidden="true" className="mx-auto size-6 text-primary" /><h2 className="mt-4 font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div>; }
