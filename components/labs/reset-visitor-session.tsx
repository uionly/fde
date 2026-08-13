"use client";

import { RotateCcw } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { trackAnalytics } from "@/lib/analytics/events";
import { clearStoredGameProfile, gameProfileStorageKey } from "@/lib/games/storage";
import { cn } from "@/lib/utils";
import { clearVisitorProgress, visitorProgressStorageKey } from "@/lib/visitor/progress";

export function ResetVisitorSession({ className, triggerClassName }: { className?: string; triggerClassName?: string }) {
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  async function resetVisitorSession() {
    setResetting(true);
    setError("");

    let progressVerified = false;
    try {
      const gameProfileCleared = clearStoredGameProfile();
      const learningProgressCleared = clearVisitorProgress();
      progressVerified = gameProfileCleared
        && learningProgressCleared
        && window.localStorage.getItem(gameProfileStorageKey) === null
        && window.localStorage.getItem(visitorProgressStorageKey) === null;
    } catch {
      progressVerified = false;
    }

    if (!progressVerified) {
      setError("Could not clear all progress on this device. Check browser storage access and try again.");
      setResetting(false);
      return;
    }

    trackAnalytics("visitor_session_reset", { clearedLearningProgress: true, clearedArcadeProfile: true });
    window.location.assign(new URL("/labs?fresh=1", window.location.origin).toString());
  }

  function openConfirmation() {
    setError("");
    dialogRef.current?.showModal();
    cancelButtonRef.current?.focus();
  }

  function closeConfirmation() {
    dialogRef.current?.close();
  }

  return (
    <div className={className}>
      <Button
        className={cn("justify-start", triggerClassName)}
        onClick={openConfirmation}
        ref={triggerRef}
        size="sm"
        variant="ghost"
      >
        <RotateCcw aria-hidden="true" className="size-3.5" />
        Start fresh
      </Button>
      <dialog
        aria-busy={resetting}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),30rem)] rounded-xl border bg-card p-0 text-left text-card-foreground shadow-2xl backdrop:bg-foreground/60 backdrop:backdrop-blur-sm"
        onCancel={(event) => {
          if (resetting) event.preventDefault();
        }}
        onClose={() => {
          setError("");
          setResetting(false);
          triggerRef.current?.focus();
        }}
        ref={dialogRef}
        role="alertdialog"
      >
        <div className="p-5 sm:p-6">
          <p className="text-lg font-semibold" id={titleId}>Clear this visitor&apos;s progress?</p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground" id={descriptionId}>
            <p>This clears lesson, practice, Field Mission, and Field Arcade progress saved by this app on this device. Your display theme stays unchanged.</p>
            <p>Any unsaved work on the current screen will be lost.</p>
          </div>
          <p aria-live="assertive" className="mt-3 min-h-5 text-xs leading-5 text-rose-600 dark:text-rose-400">{error}</p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={resetting} onClick={closeConfirmation} ref={cancelButtonRef} variant="ghost">Cancel</Button>
            <Button disabled={resetting} onClick={resetVisitorSession}>
              <RotateCcw aria-hidden="true" className="size-4" />
              {resetting ? "Clearing progress…" : "Clear progress"}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
