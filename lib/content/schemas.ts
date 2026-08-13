import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");

export const skillSchema = z.enum([
  "Discovery",
  "Architecture",
  "Software Engineering",
  "AI Engineering",
  "Data",
  "Security",
  "Production",
  "Customer Delivery",
  "Business Thinking",
]);

export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export const statusSchema = z.enum(["draft", "published", "archived"]);
const applicationPathSchema = z
  .string()
  .regex(/^\/(?!\/)[a-z0-9][a-z0-9/-]*(?:[?#][a-z0-9=&-]+)?$/, "must be a same-origin application path");

export const trackSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  title: z.string().min(2),
  description: z.string().min(10),
  order: z.number().int().positive(),
  status: statusSchema,
  skills: z.array(skillSchema).min(1),
});

export const lessonFrontmatterSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  title: z.string().min(2),
  track: slugSchema,
  module: slugSchema,
  order: z.number().int().positive(),
  difficulty: difficultySchema,
  durationMinutes: z.number().int().positive().max(180),
  status: statusSchema,
  prerequisites: z.array(slugSchema).default([]),
  skills: z.array(skillSchema).min(1),
  objectives: z.array(z.string().min(3)).min(1),
  experiments: z.array(slugSchema).default([]),
  practice: z.array(slugSchema).default([]),
});

const choiceSchema = z.object({
  id: slugSchema,
  text: z.string().min(1),
  rationale: z.string().min(1),
});

export const questionSchema = z
  .object({
    id: slugSchema,
    type: z.enum(["single_choice", "multiple_choice", "ranking", "architecture_choice", "tool_selection", "root_cause", "short_answer", "scenario_decision"]),
    category: slugSchema,
    difficulty: difficultySchema,
    skills: z.array(skillSchema).min(1),
    scenario: z.string().min(10),
    prompt: z.string().min(5),
    choices: z.array(choiceSchema).min(2).optional(),
    correct: z.array(slugSchema).min(1),
    explanation: z.string().min(10),
    relatedLesson: slugSchema.optional(),
    principle: z.string().min(5),
  })
  .superRefine((question, context) => {
    if (["single_choice", "multiple_choice"].includes(question.type) && !question.choices) {
      context.addIssue({ code: "custom", message: "choice questions require choices", path: ["choices"] });
    }
    if (!question.choices) return;

    const choiceIds = question.choices.map((choice) => choice.id);
    if (new Set(choiceIds).size !== choiceIds.length) {
      context.addIssue({ code: "custom", message: "choice ids must be unique", path: ["choices"] });
    }
    for (const [index, correctId] of question.correct.entries()) {
      if (!choiceIds.includes(correctId)) {
        context.addIssue({ code: "custom", message: `correct answer ${correctId} must reference a choice`, path: ["correct", index] });
      }
    }
    if (new Set(question.correct).size !== question.correct.length) {
      context.addIssue({ code: "custom", message: "correct answer ids must be unique", path: ["correct"] });
    }
    if (question.type === "single_choice" && question.correct.length !== 1) {
      context.addIssue({ code: "custom", message: "single-choice questions require exactly one correct answer", path: ["correct"] });
    }
    if (question.type === "multiple_choice" && question.correct.length < 2) {
      context.addIssue({ code: "custom", message: "multiple-choice questions require at least two correct answers", path: ["correct"] });
    }
  });

export const labStepSchema = z.object({
  id: slugSchema,
  title: z.string().min(2),
  type: z.enum(["content", "text", "multi_input", "architecture", "code"]),
  instruction: z.string().min(5).optional(),
  hint: z.string().min(3).optional(),
  solution: z.string().min(3).optional(),
});

export const labSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  title: z.string().min(2),
  description: z.string().min(10),
  scenario: z.string().min(10),
  goals: z.array(z.string().min(3)).min(1),
  difficulty: difficultySchema,
  estimatedMinutes: z.number().int().positive(),
  skills: z.array(skillSchema).min(1),
  steps: z.array(labStepSchema).min(1),
});

export const experimentSchema = z.object({
  id: slugSchema,
  type: z.enum(["chunking", "retrieval", "tool-selection", "injection", "cost", "placeholder"]),
  title: z.string().min(2),
  description: z.string().min(10),
  learningGoal: z.string().min(10),
  config: z.record(z.string(), z.unknown()),
});

export const gameMetricSchema = z.enum(["quality", "safety", "cost", "latency"]);

export const gameMetricScoresSchema = z
  .object({
    quality: z.number().min(0).max(100),
    safety: z.number().min(0).max(100),
    cost: z.number().min(0).max(100),
    latency: z.number().min(0).max(100),
  })
  .strict();

export const gameMetricWeightsSchema = z
  .object({
    quality: z.number().min(0).max(1),
    safety: z.number().min(0).max(1),
    cost: z.number().min(0).max(1),
    latency: z.number().min(0).max(1),
  })
  .strict()
  .refine((weights) => Object.values(weights).some((weight) => weight > 0), "at least one metric weight must be positive");

const quickDecisionChoiceSchema = z
  .object({
    id: slugSchema,
    text: z.string().min(3),
    rationale: z.string().min(10),
    recommended: z.boolean(),
    metrics: gameMetricScoresSchema,
  })
  .strict();

export const quickDecisionScenarioSchema = z
  .object({
    id: slugSchema,
    title: z.string().min(3),
    customer: z.string().min(3),
    briefing: z.string().min(20),
    objective: z.string().min(10),
    prompt: z.string().min(5),
    metricWeights: gameMetricWeightsSchema,
    choices: z.array(quickDecisionChoiceSchema).min(3).max(5),
    debrief: z.string().min(20),
  })
  .strict()
  .superRefine((scenario, context) => {
    const choiceIds = scenario.choices.map((choice) => choice.id);
    if (new Set(choiceIds).size !== choiceIds.length) context.addIssue({ code: "custom", message: "choice ids must be unique", path: ["choices"] });
    if (scenario.choices.filter((choice) => choice.recommended).length !== 1) context.addIssue({ code: "custom", message: "exactly one choice must be recommended", path: ["choices"] });
  });

const gameScenarioBase = {
  id: slugSchema,
  title: z.string().min(3),
  customer: z.string().min(3),
  briefing: z.string().min(20),
  objective: z.string().min(10),
  prompt: z.string().min(5),
  metricWeights: gameMetricWeightsSchema,
  debrief: z.string().min(20),
};

const modelRouterRouteSchema = z
  .object({
    laneId: slugSchema,
    recommended: z.boolean(),
    rationale: z.string().min(10),
    metrics: gameMetricScoresSchema,
  })
  .strict();

export const modelRouterScenarioSchema = z
  .object({
    ...gameScenarioBase,
    lanes: z
      .array(z.object({ id: slugSchema, label: z.string().min(2), description: z.string().min(8) }).strict())
      .min(2)
      .max(4),
    requests: z
      .array(
        z
          .object({
            id: slugSchema,
            title: z.string().min(3),
            description: z.string().min(10),
            volume: z.number().int().positive().max(1_000_000),
            routes: z.array(modelRouterRouteSchema).min(2).max(4),
          })
          .strict(),
      )
      .min(3)
      .max(6),
  })
  .strict()
  .superRefine((scenario, context) => {
    const laneIds = scenario.lanes.map((lane) => lane.id);
    const requestIds = scenario.requests.map((request) => request.id);
    if (new Set(laneIds).size !== laneIds.length) context.addIssue({ code: "custom", message: "lane ids must be unique", path: ["lanes"] });
    if (new Set(requestIds).size !== requestIds.length) context.addIssue({ code: "custom", message: "request ids must be unique", path: ["requests"] });
    if (scenario.requests.reduce((total, request) => total + request.volume, 0) !== 100) {
      context.addIssue({ code: "custom", message: "request volumes must total 100 percent", path: ["requests"] });
    }

    scenario.requests.forEach((request, requestIndex) => {
      const routeLaneIds = request.routes.map((route) => route.laneId);
      if (new Set(routeLaneIds).size !== routeLaneIds.length || routeLaneIds.length !== laneIds.length || laneIds.some((laneId) => !routeLaneIds.includes(laneId))) {
        context.addIssue({ code: "custom", message: "routes must cover every lane exactly once", path: ["requests", requestIndex, "routes"] });
      }
      if (request.routes.filter((route) => route.recommended).length !== 1) {
        context.addIssue({ code: "custom", message: "each request requires exactly one recommended route", path: ["requests", requestIndex, "routes"] });
      }
    });
  });

const retrievalCandidateSchema = z
  .object({
    id: slugSchema,
    title: z.string().min(3),
    source: z.string().min(3),
    excerpt: z.string().min(10),
    tokens: z.number().int().positive().max(10_000),
    relevance: z.number().int().min(0).max(4),
    safetyRisk: z.number().min(0).max(100),
    signals: z.array(z.string().min(2)).min(1).max(5),
  })
  .strict();

export const retrievalRankScenarioSchema = z
  .object({
    ...gameScenarioBase,
    query: z.string().min(5),
    contextBudget: z.number().int().positive().max(20_000),
    targetContextTokens: z.number().int().positive().max(20_000),
    latency: z
      .object({
        baseMs: z.number().nonnegative(),
        perTokenMs: z.number().positive(),
        targetMs: z.number().positive(),
        maxMs: z.number().positive(),
      })
      .strict(),
    candidates: z.array(retrievalCandidateSchema).min(4).max(8),
    idealOrder: z.array(slugSchema).min(1),
  })
  .strict()
  .superRefine((scenario, context) => {
    const candidateIds = scenario.candidates.map((candidate) => candidate.id);
    if (new Set(candidateIds).size !== candidateIds.length) context.addIssue({ code: "custom", message: "candidate ids must be unique", path: ["candidates"] });
    if (new Set(scenario.idealOrder).size !== scenario.idealOrder.length || scenario.idealOrder.some((id) => !candidateIds.includes(id))) {
      context.addIssue({ code: "custom", message: "ideal order must contain unique existing candidate ids", path: ["idealOrder"] });
    }
    const idealTokens = scenario.idealOrder.reduce(
      (total, id) => total + (scenario.candidates.find((candidate) => candidate.id === id)?.tokens ?? 0),
      0,
    );
    if (idealTokens > scenario.contextBudget) context.addIssue({ code: "custom", message: "ideal order must fit within the context budget", path: ["idealOrder"] });
    if (scenario.targetContextTokens > scenario.contextBudget) context.addIssue({ code: "custom", message: "target context tokens cannot exceed the context budget", path: ["targetContextTokens"] });
    if (scenario.latency.targetMs >= scenario.latency.maxMs) context.addIssue({ code: "custom", message: "target latency must be below maximum latency", path: ["latency", "targetMs"] });
  });

export const gameNextActionSchema = z
  .object({
    kind: z.enum(["lesson", "experiment", "lab", "case-study", "resource", "game"]),
    label: z.string().min(3),
    description: z.string().min(10),
    href: applicationPathSchema,
  })
  .strict()
  .superRefine((action, context) => {
    const routePrefixes = {
      lesson: "/learn/",
      experiment: "/experiments/",
      lab: "/labs/",
      "case-study": "/case-studies/",
      resource: "/resources/",
      game: "/games/",
    } as const;
    if (!action.href.startsWith(routePrefixes[action.kind])) {
      context.addIssue({ code: "custom", message: `${action.kind} actions must use ${routePrefixes[action.kind]}`, path: ["href"] });
    }
  });

const gameBase = {
  schemaVersion: z.literal(1),
  id: slugSchema,
  slug: slugSchema,
  title: z.string().min(3),
  shortTitle: z.string().min(3),
  description: z.string().min(10),
  customerHeadline: z.string().min(10),
  mechanic: z.string().min(10),
  category: z.enum(["models", "security", "retrieval", "agents", "data", "evaluations"]),
  difficulty: difficultySchema,
  estimatedMinutes: z.number().int().positive().max(30),
  xp: z.number().int().positive().max(500),
  order: z.number().int().positive(),
  status: statusSchema,
  skills: z.array(skillSchema).min(1),
  learningObjectives: z.array(z.string().min(10)).min(1),
  scoringDimensions: z.array(gameMetricSchema).min(1),
  keyboardInstructions: z.string().min(10),
  principle: z.string().min(10),
  nextActions: z.array(gameNextActionSchema).min(1).max(3),
};

function validateGameCollection(
  game: { status: z.infer<typeof statusSchema>; scenarios: Array<{ id: string }>; scoringDimensions: Array<z.infer<typeof gameMetricSchema>> },
  context: z.RefinementCtx,
) {
  const scenarioIds = game.scenarios.map((scenario) => scenario.id);
  const requiredDimensions: Array<z.infer<typeof gameMetricSchema>> = ["quality", "safety", "cost", "latency"];
  if (new Set(scenarioIds).size !== scenarioIds.length) context.addIssue({ code: "custom", message: "scenario ids must be unique", path: ["scenarios"] });
  if (new Set(game.scoringDimensions).size !== game.scoringDimensions.length) context.addIssue({ code: "custom", message: "scoring dimensions must be unique", path: ["scoringDimensions"] });
  if (game.scoringDimensions.length !== requiredDimensions.length || requiredDimensions.some((dimension) => !game.scoringDimensions.includes(dimension))) {
    context.addIssue({ code: "custom", message: "games must score quality, safety, cost, and latency", path: ["scoringDimensions"] });
  }
  if (game.status === "published" && game.scenarios.length < 2) context.addIssue({ code: "custom", message: "published games require at least two scenario variants", path: ["scenarios"] });
}

export const quickDecisionGameSchema = z
  .object({
    ...gameBase,
    type: z.literal("quick-decision"),
    mode: z.literal("quick-mission"),
    scenarios: z.array(quickDecisionScenarioSchema).min(1),
  })
  .strict()
  .superRefine(validateGameCollection);

export const modelRouterGameSchema = z
  .object({
    ...gameBase,
    type: z.literal("model-router"),
    mode: z.literal("route-workload"),
    scenarios: z.array(modelRouterScenarioSchema).min(1),
  })
  .strict()
  .superRefine(validateGameCollection);

export const retrievalRankGameSchema = z
  .object({
    ...gameBase,
    type: z.literal("retrieval-rank"),
    mode: z.literal("rank-and-pack"),
    scenarios: z.array(retrievalRankScenarioSchema).min(1),
  })
  .strict()
  .superRefine(validateGameCollection);

export const fieldGameSchema = z.discriminatedUnion("type", [quickDecisionGameSchema, modelRouterGameSchema, retrievalRankGameSchema]);

export const glossaryEntrySchema = z.object({
  term: z.string().min(2),
  slug: slugSchema,
  shortDefinition: z.string().min(10),
  relatedLessons: z.array(slugSchema).default([]),
});

export const caseStudyScenarioSchema = z.object({
  id: slugSchema,
  order: z.number().int().positive(),
  title: z.string().min(3),
  signal: z.string().min(10),
  customerProblem: z.string().min(10),
  skills: z.array(skillSchema).min(1),
  fieldQuestion: z.string().min(5),
});

export const caseStudySchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  company: z.string().min(3),
  industry: z.string().min(3),
  employeeCount: z.number().int().positive(),
  startingRequest: z.string().min(10),
  profile: z.string().min(20),
  systems: z.array(z.object({ name: z.string().min(2), type: z.string().min(2), note: z.string().min(5) })).min(3),
  scenarios: z.array(caseStudyScenarioSchema).min(5),
});

const aiLabsModeSchema = z
  .object({
    id: z.enum(["simulate", "experiment", "deliver"]),
    title: z.string().min(2),
    description: z.string().min(10),
    href: applicationPathSchema,
  })
  .strict();

export const aiLabsShowcaseSchema = z
  .object({
    id: slugSchema,
    hero: z
      .object({
        eyebrow: z.string().min(3),
        title: z.string().min(5),
        accent: z.string().min(5),
        description: z.string().min(20),
      })
      .strict(),
    modes: z.array(aiLabsModeSchema).length(3),
    featuredGameId: slugSchema,
    supportingGameIds: z.array(slugSchema).length(2),
    featuredExperimentIds: z.array(slugSchema).length(3),
    featuredLabIds: z.array(slugSchema).min(1).max(3),
    northstarThread: z
      .object({
        caseStudyId: slugSchema,
        scenarioId: slugSchema,
        gameId: slugSchema,
        experimentId: slugSchema,
        labId: slugSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((showcase, context) => {
    const modeIds = showcase.modes.map((mode) => mode.id);
    if (new Set(modeIds).size !== modeIds.length) {
      context.addIssue({ code: "custom", message: "mode ids must be unique", path: ["modes"] });
    }

    const gameIds = [showcase.featuredGameId, ...showcase.supportingGameIds];
    if (new Set(gameIds).size !== gameIds.length) {
      context.addIssue({ code: "custom", message: "featured and supporting game ids must be unique", path: ["supportingGameIds"] });
    }

    for (const [field, ids] of [
      ["featuredExperimentIds", showcase.featuredExperimentIds],
      ["featuredLabIds", showcase.featuredLabIds],
    ] as const) {
      if (new Set(ids).size !== ids.length) {
        context.addIssue({ code: "custom", message: `${field} must be unique`, path: [field] });
      }
    }
  });

export const resourceSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["discovery", "architecture", "delivery", "ai", "business"]),
  format: z.enum(["markdown", "csv"]),
  body: z.string().min(10),
});

export type Track = z.infer<typeof trackSchema>;
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Lab = z.infer<typeof labSchema>;
export type Experiment = z.infer<typeof experimentSchema>;
export type FieldGame = z.infer<typeof fieldGameSchema>;
export type QuickDecisionGame = z.infer<typeof quickDecisionGameSchema>;
export type QuickDecisionScenario = z.infer<typeof quickDecisionScenarioSchema>;
export type ModelRouterGame = z.infer<typeof modelRouterGameSchema>;
export type ModelRouterScenario = z.infer<typeof modelRouterScenarioSchema>;
export type RetrievalRankGame = z.infer<typeof retrievalRankGameSchema>;
export type RetrievalRankScenario = z.infer<typeof retrievalRankScenarioSchema>;
export type GameScenario = FieldGame["scenarios"][number];
export type GameMetric = z.infer<typeof gameMetricSchema>;
export type GameMetricScores = z.infer<typeof gameMetricScoresSchema>;
export type GameNextAction = z.infer<typeof gameNextActionSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
export type Skill = z.infer<typeof skillSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type AILabsShowcase = z.infer<typeof aiLabsShowcaseSchema>;
