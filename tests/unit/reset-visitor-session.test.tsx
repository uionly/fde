import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResetVisitorSession } from "@/components/labs/reset-visitor-session";
import { gameProfileStorageKey } from "@/lib/games/storage";

const auth = vi.hoisted(() => ({
  signOut: vi.fn(),
  status: "unauthenticated" as "authenticated" | "loading" | "unauthenticated",
}));

vi.mock("next-auth/react", () => ({
  signOut: auth.signOut,
  useSession: () => ({ status: auth.status }),
}));

describe("fresh visitor reset failures", () => {
  afterEach(cleanup);

  beforeEach(() => {
    auth.signOut.mockReset();
    auth.status = "unauthenticated";
    window.localStorage.clear();
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("does not sign out when device progress cannot be cleared", async () => {
    auth.status = "authenticated";
    window.localStorage.setItem(gameProfileStorageKey, JSON.stringify({ version: 2, xp: 80 }));
    const removeItem = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });

    render(<ResetVisitorSession />);
    fireEvent.click(screen.getByRole("button", { name: "Start fresh" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm start fresh" }));

    await waitFor(() => expect(screen.getByText(/Could not start a fresh session/)).toBeVisible());
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(gameProfileStorageKey)).not.toBeNull();
    removeItem.mockRestore();
  });

  it("reports a partial reset when sign-out fails after local progress is cleared", async () => {
    auth.status = "authenticated";
    auth.signOut.mockRejectedValueOnce(new Error("Network unavailable"));
    window.localStorage.setItem(gameProfileStorageKey, JSON.stringify({ version: 2, xp: 80 }));

    render(<ResetVisitorSession />);
    fireEvent.click(screen.getByRole("button", { name: "Start fresh" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm start fresh" }));

    await waitFor(() => expect(screen.getByText(/progress was cleared, but this account could not be signed out/)).toBeVisible());
    expect(window.localStorage.getItem(gameProfileStorageKey)).toBeNull();
    expect(auth.signOut).toHaveBeenCalledWith({ redirect: false });
  });
});
