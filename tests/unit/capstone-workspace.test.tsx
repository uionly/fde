import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CapstoneWorkspace } from "@/components/capstone/capstone-workspace";
import {
  capstoneProgressStorageKey,
  readCapstonePhaseProgress,
  writeCapstonePhaseProgress,
  type CapstoneDeterministicEvaluation,
} from "@/lib/capstone/progress";
import { getCapstone } from "@/lib/content/loaders";

const capstone = getCapstone();
const firstPhase = capstone.phases[0];
const secondPhase = capstone.phases[1];
const relatedLessons = Object.fromEntries(
  capstone.phases.flatMap((phase) =>
    phase.relatedLessons.map((lessonId) => [lessonId, { href: `/learn/test/${lessonId}`, title: lessonId }]),
  ),
);
const completedEvaluation: CapstoneDeterministicEvaluation = {
  overall: 84,
  dimensions: {
    customerAlignment: 88,
    architecture: 82,
    safety: 80,
    deliveryReadiness: 86,
  },
  strengths: ["The choice uses authored customer evidence."],
  gaps: ["Validate the operational owner."],
  evaluatedAt: "2026-08-13T06:00:00.000Z",
};

function renderWorkspace() {
  return render(<CapstoneWorkspace capstone={capstone} relatedLessons={relatedLessons} />);
}

function reasoningTextbox() {
  return screen.getByRole("textbox", { name: firstPhase.reasoningLabel });
}

function completePhaseRecord(phaseId: string) {
  const phase = capstone.phases.find((candidate) => candidate.id === phaseId)!;
  const selections = Object.fromEntries(
    phase.controls.map((control) => [
      control.id,
      control.options.slice(0, control.minSelections).map((option) => option.id),
    ]),
  );
  expect(writeCapstonePhaseProgress({
    completed: true,
    deterministicEvaluation: completedEvaluation,
    phaseId,
    reasoning: "A previously completed deterministic phase with enough recorded field reasoning to satisfy the authored minimum and preserve the saved evidence.",
    selections,
    updatedAt: "2026-08-13T06:00:00.000Z",
  })).toBe(true);
}

describe("capstone workspace", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("keeps every later phase locked when any earlier deterministic phase is incomplete", () => {
    completePhaseRecord(firstPhase.id);
    completePhaseRecord(secondPhase.id);

    renderWorkspace();

    expect(screen.getByRole("button", { name: /Problem Definition/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Architecture/ })).toBeEnabled();

    act(() => {
      writeCapstonePhaseProgress({
        aiReview: null,
        completed: false,
        deterministicEvaluation: null,
        phaseId: firstPhase.id,
        reasoning: "This earlier answer is now incomplete.",
      });
    });

    expect(screen.getByRole("button", { name: /Problem Definition/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Architecture/ })).toBeDisabled();
    expect(screen.getByRole("heading", { level: 2, name: firstPhase.title })).toBeVisible();
  });

  it("synchronously saves an edited draft before navigating and resumes it after remount", async () => {
    completePhaseRecord(firstPhase.id);
    const firstRender = renderWorkspace();
    const reasoning = "A new field draft that must survive immediate phase navigation before debounce runs.";

    fireEvent.change(reasoningTextbox(), { target: { value: reasoning } });
    fireEvent.click(screen.getByRole("button", { name: /Problem Definition/ }));

    expect(await screen.findByRole("heading", { level: 2, name: secondPhase.title })).toBeVisible();
    expect(readCapstonePhaseProgress(firstPhase.id)).toMatchObject({
      aiReview: null,
      reasoning,
    });

    firstRender.unmount();
    window.localStorage.removeItem(capstoneProgressStorageKey);
    completePhaseRecord(firstPhase.id);
    writeCapstonePhaseProgress({ phaseId: firstPhase.id, reasoning });
    renderWorkspace();
    expect(reasoningTextbox()).toHaveValue(reasoning);
  });

  it("cancels an in-flight coach review when the answer changes and never stores its stale result", async () => {
    let resolveResponse!: (response: Response) => void;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      return new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    renderWorkspace();

    fireEvent.click(screen.getByRole("radio", { name: /Observe real support work/ }));
    fireEvent.change(reasoningTextbox(), {
      target: { value: "This is enough reasoning to request an advisory review for the first draft." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Get coach feedback" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Reviewing reasoning…" })).toBeDisabled();

    fireEvent.change(reasoningTextbox(), {
      target: { value: "The reasoning changed while the optional review was still running." },
    });
    expect((fetchMock.mock.calls[0][1]?.signal as AbortSignal).aborted).toBe(true);
    expect(screen.getByRole("alert")).toHaveTextContent(/pending coach review was cancelled/i);

    await act(async () => {
      resolveResponse(new Response(JSON.stringify({
        mode: "mock",
        provider: "mock",
        model: "deterministic-capstone-coach-v1",
        summary: "This review belongs only to the submitted answer.",
        scores: {
          customerAlignment: 80,
          architecture: 75,
          safety: 70,
          deliveryReadiness: 78,
        },
        strengths: ["A concrete choice was recorded."],
        gaps: ["Validate the owner."],
        questions: ["What evidence changes the decision?"],
        recommendedNextStep: "Test the decision at the next customer checkpoint.",
        usage: { inputTokens: 100, outputTokens: 50 },
      }), { status: 200 }));
      await Promise.resolve();
    });
    expect(readCapstonePhaseProgress(firstPhase.id)?.aiReview).toBeNull();
    expect(screen.queryByLabelText("Advisory AI coach review")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/answer changed while coaching was running/i);
  });

  it("programmatically associates selection and reasoning requirements with their controls", () => {
    renderWorkspace();

    const firstChoice = screen.getByRole("radio", { name: /Observe real support work/ });
    const fieldset = firstChoice.closest("fieldset");
    const selectionHelpId = fieldset?.getAttribute("aria-describedby");
    expect(selectionHelpId).toBeTruthy();
    expect(document.getElementById(selectionHelpId!)).toHaveTextContent("Select one.");

    const reasoning = reasoningTextbox();
    const reasoningHelpId = reasoning.getAttribute("aria-describedby");
    expect(reasoning).toHaveAttribute("id", `${firstPhase.id}-reasoning`);
    expect(reasoningHelpId).toBeTruthy();
    expect(document.getElementById(reasoningHelpId!)).toHaveTextContent(
      `At least ${firstPhase.minReasoningCharacters} characters`,
    );
  });

  it("uses deterministic requirements—not optional coaching—to complete and unlock a phase", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWorkspace();

    fireEvent.click(screen.getByRole("button", { name: "Complete phase" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Finish these requirements");
    expect(readCapstonePhaseProgress(firstPhase.id)?.completed).not.toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: /Observe real support work/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Workflow and baseline metrics/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Stakeholder authority map/ }));
    fireEvent.change(reasoningTextbox(), {
      target: { value: "Observe frontline specialists, baseline search time, map decision owners, and validate compliance constraints before choosing a solution." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Complete phase" }));

    await waitFor(() => expect(readCapstonePhaseProgress(firstPhase.id)?.completed).toBe(true));
    expect(screen.getByLabelText("Deterministic field review")).toBeVisible();
    expect(screen.getByText(/authored score—not AI coaching—controls completion/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /Problem Definition/ })).toBeEnabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
