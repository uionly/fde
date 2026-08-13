import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { PracticeEngine } from "@/components/practice/practice-engine";
import { LessonProgressButton } from "@/components/progress/lesson-progress-button";
import { getAllQuestions } from "@/lib/content/loaders";
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
});
