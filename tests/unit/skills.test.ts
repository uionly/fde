import { describe, expect, it } from "vitest";

import { calculateSkillScores, recommendNext, weakestSkills } from "@/lib/skills/scoring";

describe("skill scoring", () => {
  it("uses evidence weights and ignores absent lesson-view evidence", () => { const scores = calculateSkillScores([{ source: "practice", skills: ["Security"], score: 40 }, { source: "lab", skills: ["Security"], score: 100 }]); const security = scores.find((item) => item.skill === "Security"); expect(security).toEqual({ skill: "Security", score: 85, evidenceCount: 2 }); expect(scores.find((item) => item.skill === "Discovery")?.score).toBe(0); });
  it("changes predictably with repeated practice evidence", () => { const first = calculateSkillScores([{ source: "practice", skills: ["Data"], score: 20 }]); const repeated = calculateSkillScores([{ source: "practice", skills: ["Data"], score: 20 }, { source: "practice", skills: ["Data"], score: 100 }]); expect(first.find((item) => item.skill === "Data")?.score).toBe(20); expect(repeated.find((item) => item.skill === "Data")?.score).toBe(60); });
  it("weights completed capstone evidence as an authored performance signal", () => { const scores = calculateSkillScores([{ source: "practice", skills: ["Architecture"], score: 20 }, { source: "capstone", skills: ["Architecture"], score: 80 }]); expect(scores.find((item) => item.skill === "Architecture")).toEqual({ skill: "Architecture", score: 68, evidenceCount: 2 }); });
  it("recommends a deterministic weakest area", () => { const scores = calculateSkillScores([]); expect(weakestSkills(scores, 1)[0].skill).toBe("Discovery"); expect(recommendNext(scores).href).toBe("/labs/discovery-workshop"); });
});
