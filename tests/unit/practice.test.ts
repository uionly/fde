import { describe, expect, it } from "vitest";

import { getAllQuestions } from "@/lib/content/loaders";
import { filterQuestions, scoreQuestion } from "@/lib/practice/scoring";

describe("practice scoring", () => {
  const questions = getAllQuestions();

  it("loads the 25-question seed bank", () => {
    expect(questions).toHaveLength(25);
  });

  it("requires the exact answer set for full credit", () => {
    const question = questions.find((item) => item.id === "architecture-002")!;
    expect(scoreQuestion(question, ["acl-metadata", "identity-propagation"]).correct).toBe(true);
    expect(scoreQuestion(question, ["acl-metadata"]).correct).toBe(false);
    expect(scoreQuestion(question, ["acl-metadata", "prompt-rule"]).score).toBe(0);
  });

  it("filters by category and difficulty", () => {
    const filtered = filterQuestions(questions, { category: "security", difficulty: "advanced" });
    expect(filtered.map((question) => question.id)).toEqual(["security-003"]);
  });
});
