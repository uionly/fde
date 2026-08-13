"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function FreshSessionNotice({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("fresh");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="border-b border-emerald-600/20 bg-emerald-500/10" role="status">
      <div className="mx-auto flex max-w-[1280px] items-start gap-3 px-4 py-3 text-sm sm:items-center sm:px-6 lg:px-8">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400 sm:mt-0" />
        <p className="flex-1 leading-6">
          <strong>Fresh session started.</strong> This browser is ready for the next visitor.
        </p>
        <Button aria-label="Dismiss fresh session confirmation" className="-mr-2 shrink-0" onClick={() => setVisible(false)} size="icon" variant="ghost">
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  );
}
