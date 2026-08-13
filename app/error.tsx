"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error("Application error", error.digest ?? error.message); }, [error]); return <div className="mx-auto max-w-xl px-4 py-24 text-center"><AlertTriangle aria-hidden="true" className="mx-auto size-8 text-destructive" /><h1 className="mt-5 text-2xl font-semibold">The lab hit an unexpected state.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Your saved learner data is unchanged. Retry this view, and check the server logs if the problem continues.</p><Button className="mt-6" onClick={reset}><RotateCcw aria-hidden="true" className="size-4" />Try again</Button></div>; }
