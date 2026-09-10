import { describe, expect, it } from "vitest";
import { getAllChallenges, getAllGlossaryEntries, getAllLessons, getAllResources, getAllTracks } from "@/lib/content";

const newTrackIds = ["ai-native-engineering", "mcp-enterprise-integration", "data-engineering", "production-observability", "customer-delivery", "business-impact"];
describe("field curriculum and reference quality", () => {
  it("publishes each expanded area with customer lessons, practice, and sources", () => {
    const tracks = getAllTracks(); const lessons = getAllLessons();
    for (const id of newTrackIds) {
      expect(tracks.some((track) => track.id === id)).toBe(true);
      const authored = lessons.filter((lesson) => lesson.frontmatter.track === id);
      expect(authored.length).toBeGreaterThanOrEqual(2);
      for (const lesson of authored) {
        expect(lesson.frontmatter.sources.length).toBeGreaterThan(0);
        expect(lesson.frontmatter.reviewedAt).toBe("2026-09-11");
        expect(lesson.frontmatter.practice.length).toBeGreaterThanOrEqual(2);
        expect(lesson.content).toContain("synthetic");
      }
    }
  });
  it("covers every requested template family and links each reference to learning", () => {
    const resources = getAllResources();
    const expected = ["discovery-canvas", "stakeholder-map", "workflow-template", "problem-statement", "solution-brief", "assumption-log", "risk-register", "raid-log", "architecture-decision-record", "rag-readiness-checklist", "agent-canvas", "mcp-checklist", "threat-model", "eval-dataset", "eval-scorecard", "production-checklist", "cost-calculator", "roi-calculator", "demo-checklist", "handover-template"];
    for (const id of expected) expect(resources.some((resource) => resource.id === id)).toBe(true);
    expect(resources.every((resource) => resource.relatedLessons.length > 0)).toBe(true);
    expect(getAllGlossaryEntries().every((entry) => entry.relatedLessons.length > 0)).toBe(true);
  });
  it("resolves all local links in the added lessons to published content", () => {
    const resources = getAllResources(); const challenges = getAllChallenges();
    const valid = new Set([...resources.map((item) => `/resources/templates/${item.slug}`), ...challenges.map((item) => `/challenges/${item.id}`)]);
    for (const lesson of getAllLessons().filter((item) => newTrackIds.includes(item.frontmatter.track))) {
      for (const match of lesson.content.matchAll(/\]\((\/[^)]+)\)/g)) expect(valid.has(match[1]), match[1]).toBe(true);
    }
  });
});
