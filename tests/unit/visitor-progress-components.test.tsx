import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { PracticeEngine } from "@/components/practice/practice-engine";
import { LessonProgressButton } from "@/components/progress/lesson-progress-button";
import { VisitorProgressDashboard } from "@/components/progress/visitor-progress-dashboard";
import { writeCapstonePhaseProgress } from "@/lib/capstone/progress";
import { getAllQuestions, getCapstone } from "@/lib/content/loaders";
import { readVisitorPracticeAttempts } from "@/lib/visitor/progress";

describe("device-local learning progress", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("restores lesson completion after the component reloads", async () => {
    const props = { lessonId: "what-is-fde", lessonSlug: "what-is-fde", trackSlug: "fde-foundations" };
    const firstRender = render(<LessonProgressButton {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark complete" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Completed" })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByText(/saved on this device/i)).toBeVisible();

    firstRender.unmount();
    render(<LessonProgressButton {...props} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Completed" })).toHaveAttribute("aria-pressed", "true"));
  });

  it("scores and stores practice evidence without a sign-in or text entry", () => {
    const question = getAllQuestions().find((item) => item.id === "security-003")!;
    render(<PracticeEngine questions={[question]} relatedLessons={{}} />);

    for (const answerId of question.correct) {
      const choice = question.choices?.find((item) => item.id === answerId);
      fireEvent.click(screen.getByLabelText(choice!.text));
    }
    fireEvent.click(screen.getByRole("button", { name: "Check decision" }));

    expect(screen.getByText("Strong call")).toBeVisible();
    expect(screen.getByText("Attempt saved on this device")).toBeVisible();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(readVisitorPracticeAttempts()).toEqual([
      expect.objectContaining({ questionId: question.id, answer: [...question.correct].sort(), correct: true, score: 1 }),
    ]);
  });

  it("shows resumable capstone progress and uses only deterministic completion evidence for skills", () => {
    const updatedAt = "2026-08-13T06:00:00.000Z";
    const capstone = getCapstone();
    const discovery = capstone.phases[0];
    const architecture = capstone.phases[2];
    writeCapstonePhaseProgress({
      phaseId: "discovery",
      selections: {
        "first-move": ["observe-workflow"],
        evidence: ["workflow-baseline", "stakeholder-map"],
      },
      reasoning: "I would observe the frontline workflow, baseline the work, map decision owners, and validate regulated exceptions before proposing a solution.",
      completed: true,
      deterministicEvaluation: {
        overall: 80,
        dimensions: { customerAlignment: 85, architecture: 70, safety: 65, deliveryReadiness: 90 },
        strengths: ["Measurable workflow selected."],
        gaps: ["Escalation owner missing."],
        evaluatedAt: updatedAt,
      },
      aiReview: {
        provider: "anthropic",
        model: "claude-sonnet-test",
        mode: "live",
        summary: "Advisory review",
        scores: { customerAlignment: 5, architecture: 5, safety: 5, deliveryReadiness: 5 },
        strengths: ["Concrete choice."],
        gaps: ["Add ownership."],
        questions: ["Who owns escalation?"],
        recommendedNextStep: "Name the owner.",
        usage: { inputTokens: 100, outputTokens: 50 },
        reviewedAt: updatedAt,
      },
      updatedAt,
    });
    writeCapstonePhaseProgress({ phaseId: "architecture", completed: false, updatedAt });

    render(
      <VisitorProgressDashboard
        capstonePhases={[
          discovery,
          architecture,
        ]}
        gameCount={4}
        labs={[]}
        lessons={[]}
        questions={[]}
        tracks={[]}
      />,
    );

    expect(screen.getByText("1/2", { selector: "p" })).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Discovery skill score: 90%" })).toHaveAttribute("aria-valuenow", "90");
    expect(screen.getByText("Resume the Northstar capstone")).toBeVisible();
    expect(screen.getByText(/Continue Architecture/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Resume engagement/ })).toHaveAttribute("href", "/capstone");
    expect(screen.getByText(/not lesson views or optional AI coaching/)).toBeVisible();
  });
});
