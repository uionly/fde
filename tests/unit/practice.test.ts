import { describe, expect, it } from "vitest";

import { getAllQuestions } from "@/lib/content/loaders";
import { filterQuestions, orderedQuestionChoices, scoreQuestion } from "@/lib/practice/scoring";

describe("practice scoring", () => {
  const questions = getAllQuestions();

  it("loads the complete 150-question scenario bank", () => {
    expect(questions).toHaveLength(150);
  });

  it("requires the exact answer set for full credit", () => {
    const question = questions.find((item) => item.id === "architecture-002")!;
    expect(scoreQuestion(question, ["acl-metadata", "identity-propagation"]).correct).toBe(true);
    expect(scoreQuestion(question, ["acl-metadata"]).correct).toBe(false);
    expect(scoreQuestion(question, ["acl-metadata", "prompt-rule"]).score).toBe(0);
  });

  it("filters by category and difficulty", () => {
    const filtered = filterQuestions(questions, { category: "security", difficulty: "advanced" });
    expect(filtered.map((question) => question.id)).toContain("security-003");
    expect(filtered.length).toBeGreaterThan(1);
  });

  it("uses a stable mixed choice order without mutating authored content", () => {
    const authoredOrders = questions.map((question) => question.choices?.map((choice) => choice.id));
    const firstPass = questions.map((question) => orderedQuestionChoices(question).map((choice) => choice.id));
    const repeated = questions.map((question) => orderedQuestionChoices(question).map((choice) => choice.id));
    const singleCorrectPositions = questions
      .filter((question) => question.type === "single_choice")
      .map((question) => orderedQuestionChoices(question).findIndex((choice) => question.correct.includes(choice.id)));

    expect(firstPass).toEqual(repeated);
    expect(new Set(singleCorrectPositions).size).toBeGreaterThanOrEqual(3);
    expect(questions.map((question) => question.choices?.map((choice) => choice.id))).toEqual(authoredOrders);
  });
});
