CREATE TABLE "SkillScore" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "skill" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SkillScore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SkillScore_userId_skill_key" ON "SkillScore"("userId", "skill");
CREATE INDEX "SkillScore_userId_idx" ON "SkillScore"("userId");
ALTER TABLE "SkillScore" ADD CONSTRAINT "SkillScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
