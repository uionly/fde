import { describe, expect, it } from "vitest";

import { resolveAILabsShowcase } from "@/lib/ai-labs/showcase";
import {
  getAILabsShowcase,
  getAllCaseStudies,
  getAllExperiments,
  getAllGames,
  getAllLabs,
  getAllLessons,
  getAllResources,
  getLessonNavigation,
  getLessonsForTrack,
  validateGameNextActionReferences,
  validateContent,
} from "@/lib/content/loaders";
import { lessonFrontmatterSchema, slugSchema } from "@/lib/content/schemas";

describe("content validation", () => {
  it("validates the complete repository content graph", () => {
    const content = validateContent();

    expect(content.tracks).toHaveLength(2);
    expect(content.lessons).toHaveLength(4);
    expect(content.lessons.every((lesson) => lesson.content.length > 0)).toBe(true);
  });

  it("rejects malformed slugs", () => {
    expect(() => slugSchema.parse("Not A Slug")).toThrow(/kebab-case/);
  });

  it("resolves the curated AI Labs showcase without duplicating the complete catalogs", () => {
    const games = getAllGames();
    const experiments = getAllExperiments();
    const labs = getAllLabs();
    const showcase = resolveAILabsShowcase(getAILabsShowcase(), {
      games,
      experiments,
      labs,
      caseStudies: getAllCaseStudies(),
    });

    expect([showcase.featuredGame.id, ...showcase.supportingGames.map((game) => game.id)]).toEqual([
      "model-router-arena",
      "injection-detective",
      "retrieval-rank-rush",
    ]);
    expect(showcase.featuredExperiments.map((experiment) => experiment.id)).toEqual([
      "retrieval-playground",
      "prompt-injection-simulator",
      "ai-cost-calculator",
    ]);
    expect(showcase.featuredExperiments.length).toBeLessThan(experiments.length);
    expect(showcase.supportingGames.length + 1).toBeLessThan(games.length);
    expect(showcase.featuredLabs.map((lab) => lab.id)).toEqual([
      "discovery-workshop",
      "enterprise-rag-architecture",
      "ai-agent-design",
    ]);
    expect(showcase.northstarThread.scenario.id).toBe("retrieval-failure");
  });

  it("rejects public game actions and showcase entries that target draft content", () => {
    const games = getAllGames({ includeDrafts: true });
    const lessons = getAllLessons({ includeDrafts: true });
    const experiments = getAllExperiments();
    const labs = getAllLabs();
    const caseStudies = getAllCaseStudies();
    const resources = getAllResources();
    const sourceGame = games.find((game) => game.id === "model-router-arena")!;
    const lessonAction = sourceGame.nextActions.find((action) => action.kind === "lesson")!;
    const draftLessons = lessons.map((lesson) =>
      `/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}` === lessonAction.href
        ? { ...lesson, frontmatter: { ...lesson.frontmatter, status: "draft" as const } }
        : lesson,
    );

    expect(() =>
      validateGameNextActionReferences([sourceGame], {
        lessons: draftLessons,
        experiments,
        labs,
        caseStudies,
        resources,
      }),
    ).toThrow(/missing public next action/);
    expect(() =>
      validateGameNextActionReferences([{ ...sourceGame, status: "draft" }], {
        lessons: draftLessons,
        experiments,
        labs,
        caseStudies,
        resources,
      }),
    ).not.toThrow();

    const gamesWithDraftFeature = games.map((game) =>
      game.id === sourceGame.id ? { ...game, status: "draft" as const } : game,
    );
    expect(() =>
      resolveAILabsShowcase(getAILabsShowcase(), {
        games: gamesWithDraftFeature.filter((game) => game.status === "published"),
        experiments,
        labs,
        caseStudies,
      }),
    ).toThrow(/missing game model-router-arena/);
  });

  it("reports invalid lesson frontmatter fields", () => {
    const invalid = {
      id: "lesson-one",
      slug: "lesson-one",
      title: "Lesson one",
      track: "track-one",
      module: "module-one",
      order: 1,
      difficulty: "expert",
      durationMinutes: -2,
      status: "published",
      prerequisites: [],
      skills: ["Discovery"],
      objectives: ["Learn something"],
      experiments: [],
      practice: [],
    };

    expect(() => lessonFrontmatterSchema.parse(invalid)).toThrow();
  });

  it("derives ordered track lessons and previous/next navigation", () => {
    const lessons = getLessonsForTrack("fde-foundations");
    const navigation = getLessonNavigation("fde-foundations", "what-is-fde");

    expect(lessons.map((lesson) => lesson.frontmatter.slug)).toEqual(["what-is-fde", "customer-request-to-problem"]);
    expect(navigation.previous).toBeUndefined();
    expect(navigation.next?.frontmatter.slug).toBe("customer-request-to-problem");
  });
});
