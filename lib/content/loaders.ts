import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import { ZodError, type ZodType } from "zod";

import { resolveAILabsShowcase } from "@/lib/ai-labs/showcase";
import {
  aiLabsShowcaseSchema,
  type AILabsShowcase,
  experimentSchema,
  fieldGameSchema,
  glossaryEntrySchema,
  labSchema,
  lessonFrontmatterSchema,
  questionSchema,
  trackSchema,
  type Experiment,
  type FieldGame,
  type GlossaryEntry,
  type Lab,
  type LessonFrontmatter,
  type Question,
  type Track,
  caseStudySchema,
  type CaseStudy,
  resourceSchema,
  type Resource,
} from "@/lib/content/schemas";

const contentDirectory = path.join(process.cwd(), "content");

export class ContentValidationError extends Error {
  constructor(filePath: string, error: unknown) {
    const detail = error instanceof ZodError ? error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; ") : String(error);
    super(`Invalid content in ${path.relative(process.cwd(), filePath)} — ${detail}`);
    this.name = "ContentValidationError";
  }
}

function filesIn(directory: string, extensions: string[]) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((file) => extensions.includes(path.extname(file))).sort();
}

function parseFile<T>(filePath: string, schema: ZodType<T>): T {
  try {
    const extension = path.extname(filePath);
    const raw = fs.readFileSync(filePath, "utf8");
    const data = extension === ".json" ? JSON.parse(raw) : parseYaml(raw);
    return schema.parse(data);
  } catch (error) {
    throw new ContentValidationError(filePath, error);
  }
}

function assertUnique<T>(items: T[], getKey: (item: T) => string, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) throw new Error(`Duplicate ${label}: ${key}`);
    seen.add(key);
  }
}

export type Lesson = { frontmatter: LessonFrontmatter; content: string; filePath: string };

export function getAllTracks(options: { includeDrafts?: boolean } = {}): Track[] {
  const directory = path.join(contentDirectory, "tracks");
  const tracks = filesIn(directory, [".yaml", ".yml", ".json"]).map((file) => parseFile(path.join(directory, file), trackSchema));
  assertUnique(tracks, (track) => track.id, "track id");
  assertUnique(tracks, (track) => track.slug, "track slug");
  return tracks.filter((track) => options.includeDrafts || track.status === "published").sort((a, b) => a.order - b.order);
}

export function getAllLessons(options: { includeDrafts?: boolean } = {}): Lesson[] {
  const directory = path.join(contentDirectory, "lessons");
  const lessons = filesIn(directory, [".mdx"]).map((file) => {
    const filePath = path.join(directory, file);
    try {
      const parsed = matter(fs.readFileSync(filePath, "utf8"));
      return { frontmatter: lessonFrontmatterSchema.parse(parsed.data), content: parsed.content.trim(), filePath };
    } catch (error) {
      throw new ContentValidationError(filePath, error);
    }
  });
  assertUnique(lessons, (lesson) => lesson.frontmatter.id, "lesson id");
  assertUnique(lessons, (lesson) => `${lesson.frontmatter.track}/${lesson.frontmatter.slug}`, "lesson slug within track");
  return lessons.filter((lesson) => options.includeDrafts || lesson.frontmatter.status === "published").sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getTrackBySlug(slug: string) {
  return getAllTracks().find((track) => track.slug === slug);
}

export function getLessonsForTrack(trackSlug: string) {
  return getAllLessons().filter((lesson) => lesson.frontmatter.track === trackSlug).sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getLesson(trackSlug: string, lessonSlug: string) {
  return getLessonsForTrack(trackSlug).find((lesson) => lesson.frontmatter.slug === lessonSlug);
}

export function getLessonNavigation(trackSlug: string, lessonSlug: string) {
  const lessons = getLessonsForTrack(trackSlug);
  const index = lessons.findIndex((lesson) => lesson.frontmatter.slug === lessonSlug);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}

export function getAllQuestions(): Question[] {
  const directory = path.join(contentDirectory, "questions");
  const questions = filesIn(directory, [".json", ".yaml", ".yml"]).flatMap((file) => {
    const result = parseFile(path.join(directory, file), questionSchema.or(questionSchema.array()));
    return Array.isArray(result) ? result : [result];
  });
  assertUnique(questions, (question) => question.id, "question id");
  return questions;
}

export function getAllLabs(): Lab[] {
  const directory = path.join(contentDirectory, "labs");
  const labs = filesIn(directory, [".json", ".yaml", ".yml"]).map((file) => parseFile(path.join(directory, file), labSchema));
  assertUnique(labs, (lab) => lab.id, "lab id");
  return labs;
}

export function getAllExperiments(): Experiment[] {
  const directory = path.join(contentDirectory, "experiments");
  const experiments = filesIn(directory, [".json", ".yaml", ".yml"]).map((file) => parseFile(path.join(directory, file), experimentSchema));
  assertUnique(experiments, (experiment) => experiment.id, "experiment id");
  return experiments;
}

export function getAllGames(options: { includeDrafts?: boolean } = {}): FieldGame[] {
  const directory = path.join(contentDirectory, "games");
  const games = filesIn(directory, [".json", ".yaml", ".yml"]).flatMap((file) => {
    const result = parseFile(path.join(directory, file), fieldGameSchema.or(fieldGameSchema.array()));
    return Array.isArray(result) ? result : [result];
  });
  assertUnique(games, (game) => game.id, "game id");
  assertUnique(games, (game) => game.slug, "game slug");
  return games.filter((game) => options.includeDrafts || game.status === "published").sort((a, b) => a.order - b.order);
}

export function getGameBySlug(slug: string) {
  return getAllGames().find((game) => game.slug === slug);
}

export function getAllGlossaryEntries(): GlossaryEntry[] {
  const directory = path.join(contentDirectory, "glossary");
  const entries = filesIn(directory, [".json", ".yaml", ".yml"]).flatMap((file) => {
    const result = parseFile(path.join(directory, file), glossaryEntrySchema.or(glossaryEntrySchema.array()));
    return Array.isArray(result) ? result : [result];
  });
  assertUnique(entries, (entry) => entry.slug, "glossary slug");
  return entries;
}

export function getAllCaseStudies(): CaseStudy[] {
  const directory = path.join(contentDirectory, "case-studies");
  const studies = filesIn(directory, [".json", ".yaml", ".yml"]).map((file) => parseFile(path.join(directory, file), caseStudySchema));
  assertUnique(studies, (study) => study.id, "case study id");
  return studies;
}

export function getAILabsShowcase(): AILabsShowcase {
  return parseFile(path.join(contentDirectory, "ai-labs", "showcase.json"), aiLabsShowcaseSchema);
}

export function getAllResources(): Resource[] {
  const directory = path.join(contentDirectory, "resources");
  const resources = filesIn(directory, [".json", ".yaml", ".yml"]).flatMap((file) => {
    const result = parseFile(path.join(directory, file), resourceSchema.or(resourceSchema.array()));
    return Array.isArray(result) ? result : [result];
  });
  assertUnique(resources, (resource) => resource.id, "resource id");
  return resources;
}

type GameNextActionRepositories = {
  lessons: Lesson[];
  experiments: Experiment[];
  labs: Lab[];
  caseStudies: CaseStudy[];
  resources: Resource[];
};

export function validateGameNextActionReferences(games: FieldGame[], repositories: GameNextActionRepositories) {
  const publicLessonHrefs = repositories.lessons
    .filter((lesson) => lesson.frontmatter.status === "published")
    .map((lesson) => `/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`);
  const allLessonHrefs = repositories.lessons.map(
    (lesson) => `/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`,
  );
  const sharedHrefs = [
    ...repositories.experiments.map((experiment) => `/experiments/${experiment.id}`),
    ...repositories.labs.map((lab) => `/labs/${lab.slug}`),
    ...repositories.caseStudies.map((study) => `/case-studies/${study.slug}`),
    ...repositories.resources.map((resource) => `/resources/templates/${resource.slug}`),
  ];
  const allNextActionHrefs = new Set([
    ...allLessonHrefs,
    ...sharedHrefs,
    ...games.map((game) => `/games/${game.slug}`),
  ]);
  const publicNextActionHrefs = new Set([
    ...publicLessonHrefs,
    ...sharedHrefs,
    ...games.filter((game) => game.status === "published").map((game) => `/games/${game.slug}`),
  ]);

  for (const game of games) {
    const validHrefs = game.status === "published" ? publicNextActionHrefs : allNextActionHrefs;
    for (const action of game.nextActions) {
      if (!validHrefs.has(action.href)) {
        const visibility = game.status === "published" ? "public" : "existing";
        throw new Error(`Game ${game.id} references missing ${visibility} next action ${action.href}`);
      }
    }
  }
}

export function validateContent() {
  const tracks = getAllTracks({ includeDrafts: true });
  const lessons = getAllLessons({ includeDrafts: true });
  const questions = getAllQuestions();
  const labs = getAllLabs();
  const experiments = getAllExperiments();
  const games = getAllGames({ includeDrafts: true });
  const glossary = getAllGlossaryEntries();
  const caseStudies = getAllCaseStudies();
  const resources = getAllResources();
  const aiLabsShowcase = getAILabsShowcase();
  const trackIds = new Set(tracks.map((track) => track.id));
  const trackById = new Map(tracks.map((track) => [track.id, track]));
  const lessonIds = new Set(lessons.map((lesson) => lesson.frontmatter.id));
  const lessonById = new Map(lessons.map((lesson) => [lesson.frontmatter.id, lesson]));
  const questionIds = new Set(questions.map((question) => question.id));
  const experimentIds = new Set(experiments.map((experiment) => experiment.id));
  const questionOwners = new Map<string, string[]>();

  assertUnique(tracks, (track) => String(track.order), "track order");
  for (const track of tracks) {
    assertUnique(
      lessons.filter((lesson) => lesson.frontmatter.track === track.id),
      (lesson) => String(lesson.frontmatter.order),
      `lesson order in track ${track.id}`,
    );
  }
  for (const lesson of lessons) {
    if (!trackIds.has(lesson.frontmatter.track)) {
      throw new Error(`Lesson ${lesson.frontmatter.id} references missing track ${lesson.frontmatter.track}`);
    }
  }

  for (const lesson of lessons) {
    const { frontmatter } = lesson;
    for (const id of frontmatter.prerequisites) {
      if (!lessonIds.has(id)) throw new Error(`Lesson ${frontmatter.id} references missing prerequisite ${id}`);
      if (id === frontmatter.id) throw new Error(`Lesson ${frontmatter.id} cannot require itself`);
      const prerequisite = lessonById.get(id)!;
      const currentTrackOrder = trackById.get(frontmatter.track)!.order;
      const prerequisiteTrackOrder = trackById.get(prerequisite.frontmatter.track)!.order;
      const comesEarlier =
        prerequisiteTrackOrder < currentTrackOrder ||
        (prerequisiteTrackOrder === currentTrackOrder && prerequisite.frontmatter.order < frontmatter.order);
      if (!comesEarlier) {
        throw new Error(`Lesson ${frontmatter.id} prerequisite ${id} must appear earlier in the curriculum`);
      }
    }
    assertUnique(frontmatter.practice, (id) => id, `practice question in lesson ${frontmatter.id}`);
    for (const id of frontmatter.practice) {
      if (!questionIds.has(id)) throw new Error(`Lesson ${frontmatter.id} references missing question ${id}`);
      questionOwners.set(id, [...(questionOwners.get(id) ?? []), frontmatter.id]);
    }
    for (const id of frontmatter.experiments) if (!experimentIds.has(id)) throw new Error(`Lesson ${frontmatter.id} references missing experiment ${id}`);
  }

  for (const question of questions) {
    if (!question.relatedLesson) {
      throw new Error(`Question ${question.id} must reference a related lesson`);
    }
    if (!lessonIds.has(question.relatedLesson)) {
      throw new Error(`Question ${question.id} references missing related lesson ${question.relatedLesson}`);
    }
    const owners = questionOwners.get(question.id) ?? [];
    if (owners.length !== 1) {
      throw new Error(`Question ${question.id} must belong to exactly one lesson practice list; found ${owners.length}`);
    }
    if (owners[0] !== question.relatedLesson) {
      throw new Error(`Question ${question.id} belongs to lesson ${owners[0]} but links to ${question.relatedLesson}`);
    }
  }

  validateGameNextActionReferences(games, { lessons, experiments, labs, caseStudies, resources });

  resolveAILabsShowcase(aiLabsShowcase, {
    games: games.filter((game) => game.status === "published"),
    experiments,
    labs,
    caseStudies,
  });

  return { tracks, lessons, questions, labs, experiments, games, glossary, caseStudies, resources, aiLabsShowcase };
}
