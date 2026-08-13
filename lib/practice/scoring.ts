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

function stableQuestionHash(value: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function orderedQuestionChoices(question: Question) {
  const choices = [...(question.choices ?? [])];
  let state = stableQuestionHash(question.id);
  const random = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [choices[index], choices[target]] = [choices[target], choices[index]];
  }
  return choices;
}
