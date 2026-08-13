CREATE TABLE "LabProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "labId" TEXT NOT NULL,
  "currentStep" INTEGER NOT NULL DEFAULT 0,
  "stateJson" JSONB NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LabProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LabProgress_userId_labId_key" ON "LabProgress"("userId", "labId");
CREATE INDEX "LabProgress_userId_updatedAt_idx" ON "LabProgress"("userId", "updatedAt");
ALTER TABLE "LabProgress" ADD CONSTRAINT "LabProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
