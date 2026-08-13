import { getAllLabs, getAllQuestions } from "@/lib/content";
import { getLabsForUser } from "@/lib/labs/store";
import { getPracticeAttempts } from "@/lib/practice/store";
import { calculateSkillScores, recommendNext, type SkillEvidence } from "@/lib/skills/scoring";

export async function getSkillSnapshot(userId: string) {
  const [attempts, labProgress] = await Promise.all([getPracticeAttempts(userId), getLabsForUser(userId)]);
  const questions = getAllQuestions(); const labs = getAllLabs(); const evidence: SkillEvidence[] = [];
  for (const attempt of attempts) { const question = questions.find((item) => item.id === attempt.questionId); if (question) evidence.push({ source: "practice", skills: question.skills, score: attempt.score * 100 }); }
  for (const progress of labProgress.filter((item) => item.completed)) { const lab = labs.find((item) => item.id === progress.labId); if (lab) evidence.push({ source: "lab", skills: lab.skills, score: 100 }); }
  const scores = calculateSkillScores(evidence);
  if (process.env.DATABASE_URL && scores.some((score) => score.evidenceCount > 0)) {
    const { prisma } = await import("@/lib/db/prisma");
    await Promise.all(scores.filter((score) => score.evidenceCount > 0).map((score) => prisma.skillScore.upsert({ where: { userId_skill: { userId, skill: score.skill } }, update: { score: score.score }, create: { userId, skill: score.skill, score: score.score } })));
  }
  return { scores, recommendation: recommendNext(scores), evidenceCount: evidence.length };
}
