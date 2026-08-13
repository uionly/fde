"use client";

import { RotateCcw } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { trackAnalytics } from "@/lib/analytics/events";
import { clearStoredGameProfile, gameProfileStorageKey } from "@/lib/games/storage";
import { cn } from "@/lib/utils";

export function ResetVisitorSession({ className, triggerClassName }: { className?: string; triggerClassName?: string }) {
  const { status } = useSession();
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

    let profileVerified = false;
    try {
      profileVerified = clearStoredGameProfile() && window.localStorage.getItem(gameProfileStorageKey) === null;
    } catch {
      profileVerified = false;
    }

    if (!profileVerified) {
      setError("Could not start a fresh session. Check browser storage access and try again.");
      setResetting(false);
      return;
    }

    if (status === "authenticated") {
      try {
        await signOut({ redirect: false });
      } catch {
        setError("Field Arcade progress was cleared, but this account could not be signed out. Sign out manually before the next visitor starts.");
        setResetting(false);
        return;
      }
    }

    trackAnalytics("visitor_session_reset", { signedIn: status === "authenticated" });
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
        disabled={status === "loading"}
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
          <p className="text-lg font-semibold" id={titleId}>Start a fresh visitor session?</p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground" id={descriptionId}>
            <p>This clears Field Arcade progress on this device and signs out the current account in this browser.</p>
            <p>Any unsaved work on the current screen will be lost. Saved account work and display settings stay intact.</p>
          </div>
          <p aria-live="assertive" className="mt-3 min-h-5 text-xs leading-5 text-rose-600 dark:text-rose-400">{error}</p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={resetting} onClick={closeConfirmation} ref={cancelButtonRef} variant="ghost">Cancel</Button>
            <Button disabled={resetting || status === "loading"} onClick={resetVisitorSession}>
              <RotateCcw aria-hidden="true" className="size-4" />
              {resetting ? "Starting fresh…" : "Confirm start fresh"}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
