import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LabWorkspace } from "@/components/labs/lab-workspace";
import { getAllLabs } from "@/lib/content/loaders";
import { clearVisitorProgress, readVisitorLabProgress, writeVisitorLabProgress } from "@/lib/visitor/progress";

const lab = getAllLabs().find((candidate) => candidate.id === "discovery-workshop")!;

describe("anonymous Field Mission workspace", () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
    clearVisitorProgress();
  });

  it("opens without authentication and explains device-local persistence", async () => {
    render(<LabWorkspace lab={lab} />);

    expect(await screen.findByRole("heading", { name: "Read the customer request" })).toBeVisible();
    expect(screen.getByText(/saved on this device when you choose Save & continue/i)).toBeVisible();
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });

  it("saves the current step and working notes, then resumes them", async () => {
    const firstRender = render(<LabWorkspace lab={lab} />);
    await screen.findByRole("heading", { name: "Read the customer request" });

    fireEvent.click(screen.getByRole("button", { name: "Save & continue" }));
    const notes = await screen.findByLabelText("Your working notes");
    fireEvent.change(notes, { target: { value: "Sponsor, operations, security, and data owners" } });
    fireEvent.click(screen.getByRole("button", { name: "Save & continue" }));

    expect(readVisitorLabProgress(lab.id)).toMatchObject({
      completed: false,
      currentStep: 2,
      state: { "stakeholder-map": "Sponsor, operations, security, and data owners" },
    });

    firstRender.unmount();
    render(<LabWorkspace lab={lab} />);
    expect(await screen.findByRole("heading", { name: "Draft discovery questions" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByLabelText("Your working notes")).toHaveValue("Sponsor, operations, security, and data owners");
  });

  it("preserves completion while reviewing from the start", async () => {
    writeVisitorLabProgress({
      completed: true,
      currentStep: lab.steps.length - 1,
      labId: lab.id,
      state: { "problem-statement": "A measurable customer outcome" },
      updatedAt: new Date().toISOString(),
    });

    render(<LabWorkspace lab={lab} />);
    expect(await screen.findByRole("heading", { name: "Engagement complete" })).toBeVisible();
    expect(screen.getByText(/Progress is saved on this device/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Review from start" }));
    expect(screen.getByRole("heading", { name: "Read the customer request" })).toBeVisible();
    expect(screen.getByText("Completed · reviewing")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Save & continue" }));
    expect(readVisitorLabProgress(lab.id)?.completed).toBe(true);
    expect(screen.getByRole("heading", { name: "Map the stakeholders" })).toBeVisible();
  });

  it("returns to a clean first step when shared visitor progress is cleared", async () => {
    writeVisitorLabProgress({
      completed: false,
      currentStep: 2,
      labId: lab.id,
      state: { "stakeholder-map": "Saved field notes" },
      updatedAt: new Date().toISOString(),
    });

    render(<LabWorkspace lab={lab} />);
    expect(await screen.findByRole("heading", { name: "Draft discovery questions" })).toBeVisible();

    act(() => {
      clearVisitorProgress();
    });

    expect(screen.getByRole("heading", { name: "Read the customer request" })).toBeVisible();
    expect(screen.getByText("Step 1 of 4")).toBeVisible();
  });

  it("announces when browser storage prevents a save", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    render(<LabWorkspace lab={lab} />);
    await screen.findByRole("heading", { name: "Read the customer request" });

    fireEvent.click(screen.getByRole("button", { name: "Save & continue" }));

    await waitFor(() => expect(screen.getByText(/Could not save progress on this device/)).toBeVisible());
    expect(screen.getByRole("heading", { name: "Read the customer request" })).toBeVisible();
    setItem.mockRestore();
  });
});
