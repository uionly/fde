import type { Question } from "@/lib/content/schemas";

export type PracticeResult = { correct: boolean; score: number; selected: string[] };

export function scoreQuestion(question: Question, answer: string[]): PracticeResult {
  const selected = [...new Set(answer)].sort();
  const correctAnswers = [...question.correct].sort();
  const correct = selected.length === correctAnswers.length && selected.every((choice, index) => choice === correctAnswers[index]);
  const correctSelections = selected.filter((choice) => correctAnswers.includes(choice)).length;
  const incorrectSelections = selected.filter((choice) => !correctAnswers.includes(choice)).length;
  const score = correct ? 1 : Math.max(0, (correctSelections - incorrectSelections) / correctAnswers.length);
  return { correct, score, selected };
}

export function filterQuestions(questions: Question[], filters: { category?: string; difficulty?: string }) {
  return questions.filter((question) => (!filters.category || question.category === filters.category) && (!filters.difficulty || question.difficulty === filters.difficulty));
}
