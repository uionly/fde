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

const gameMetricWeightsSchema = z
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

export const fieldGameSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: slugSchema,
    slug: slugSchema,
    type: z.literal("quick-decision"),
    mode: z.literal("quick-mission"),
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
    scenarios: z.array(quickDecisionScenarioSchema).min(1),
  })
  .strict()
  .superRefine((game, context) => {
    const scenarioIds = game.scenarios.map((scenario) => scenario.id);
    if (new Set(scenarioIds).size !== scenarioIds.length) context.addIssue({ code: "custom", message: "scenario ids must be unique", path: ["scenarios"] });
    if (new Set(game.scoringDimensions).size !== game.scoringDimensions.length) context.addIssue({ code: "custom", message: "scoring dimensions must be unique", path: ["scoringDimensions"] });
    if (game.status === "published" && game.scenarios.length < 2) context.addIssue({ code: "custom", message: "published games require at least two scenario variants", path: ["scenarios"] });
  });

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
export type QuickDecisionScenario = z.infer<typeof quickDecisionScenarioSchema>;
export type GameMetric = z.infer<typeof gameMetricSchema>;
export type GameMetricScores = z.infer<typeof gameMetricScoresSchema>;
export type GameNextAction = z.infer<typeof gameNextActionSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
export type Skill = z.infer<typeof skillSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type AILabsShowcase = z.infer<typeof aiLabsShowcaseSchema>;
