import { describe, expect, it } from "vitest";

import { createAnalyticsPayload } from "@/lib/analytics/events";
import { buildSearchIndex, searchContent } from "@/lib/search/search";

describe("search and analytics", () => {
  it("indexes every supported content family", () => { const types = new Set(buildSearchIndex().map((item) => item.type)); expect(types).toEqual(new Set(["lesson", "lab", "experiment", "game", "glossary", "practice", "resource", "case-study", "capstone"])); });
  it("ranks exact title terms above body matches", () => { const results = searchContent(buildSearchIndex(), "permission retrieval"); expect(results[0].title).toMatch(/Permission/i); });
  it("finds games and technical playgrounds at their canonical routes", () => {
    expect(searchContent(buildSearchIndex(), "model router").find((item) => item.type === "game")).toMatchObject({ title: "Model Router Rush", href: "/games/model-router-arena" });
    expect(searchContent(buildSearchIndex(), "prompt injection simulator").find((item) => item.type === "experiment")).toMatchObject({ title: "Prompt Injection Simulator", href: "/experiments/prompt-injection-simulator" });
  });
  it("finds the editable Northstar engagement", () => {
    expect(searchContent(buildSearchIndex(), "Northstar transformation capstone").find((item) => item.type === "capstone")).toMatchObject({ href: "/capstone" });
  });
  it("returns an empty list for blank queries", () => { expect(searchContent(buildSearchIndex(), "  ")).toEqual([]); });
  it("creates a provider-neutral analytics payload", () => { expect(createAnalyticsPayload("lesson_completed", { lessonId: "what-is-fde" })).toMatchObject({ event: "lesson_completed", properties: { lessonId: "what-is-fde" } }); });
});
