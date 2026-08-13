import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResetVisitorSession } from "@/components/labs/reset-visitor-session";
import { capstoneProgressStorageKey } from "@/lib/capstone/progress";
import { gameProfileStorageKey } from "@/lib/games/storage";
import { visitorProgressStorageKey } from "@/lib/visitor/progress";
import { clearVisitorSessionData } from "@/lib/visitor/reset";

describe("fresh visitor reset", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    window.localStorage.clear();
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("explains the exact device-local scope before clearing", () => {
    render(<ResetVisitorSession />);
    fireEvent.click(screen.getByRole("button", { name: "Start fresh" }));

    expect(screen.getByRole("alertdialog", { name: "Clear this visitor's progress?" })).toBeVisible();
    expect(screen.getByText(/lesson, practice, Field Mission, Field Arcade, and Capstone progress/)).toBeVisible();
    expect(screen.getByText(/display theme stays unchanged/)).toBeVisible();
    expect(screen.getByText(/Any unsaved work/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("reports a storage failure without claiming a fresh session", async () => {
    window.localStorage.setItem(gameProfileStorageKey, JSON.stringify({ version: 2, xp: 80 }));
    window.localStorage.setItem(visitorProgressStorageKey, JSON.stringify({ version: 1, lessons: {}, practiceAttempts: [], labs: {} }));
    window.localStorage.setItem(capstoneProgressStorageKey, JSON.stringify({ version: 1, currentPhaseId: null, phases: {}, updatedAt: "2026-08-13T06:00:00.000Z" }));
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });

    render(<ResetVisitorSession />);
    fireEvent.click(screen.getByRole("button", { name: "Start fresh" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear progress" }));

    await waitFor(() => expect(screen.getByText(/Could not clear all progress/)).toBeVisible());
    expect(window.localStorage.getItem(gameProfileStorageKey)).not.toBeNull();
    expect(window.localStorage.getItem(visitorProgressStorageKey)).not.toBeNull();
    expect(window.localStorage.getItem(capstoneProgressStorageKey)).not.toBeNull();
  });

  it("clears verified learning, arcade, and capstone state while preserving unrelated settings", () => {
    window.localStorage.setItem(gameProfileStorageKey, JSON.stringify({ version: 2, xp: 80 }));
    window.localStorage.setItem(visitorProgressStorageKey, JSON.stringify({ version: 1, lessons: {}, practiceAttempts: [], labs: {} }));
    window.localStorage.setItem(capstoneProgressStorageKey, JSON.stringify({ version: 1, currentPhaseId: null, phases: {}, updatedAt: "2026-08-13T06:00:00.000Z" }));
    window.localStorage.setItem("theme", "dark");

    expect(clearVisitorSessionData()).toBe(true);
    expect(window.localStorage.getItem(gameProfileStorageKey)).toBeNull();
    expect(window.localStorage.getItem(visitorProgressStorageKey)).toBeNull();
    expect(window.localStorage.getItem(capstoneProgressStorageKey)).toBeNull();
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });
});
