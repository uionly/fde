import type { AILabsShowcase, CaseStudy, Experiment, FieldGame, Lab } from "@/lib/content/schemas";

type ShowcaseRepositories = {
  games: FieldGame[];
  experiments: Experiment[];
  labs: Lab[];
  caseStudies: CaseStudy[];
};

function requireById<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`AI Labs showcase references missing ${label} ${id}`);
  return item;
}

export type ResolvedAILabsShowcase = {
  content: AILabsShowcase;
  featuredGame: FieldGame;
  supportingGames: FieldGame[];
  featuredExperiments: Experiment[];
  featuredLabs: Lab[];
  northstarThread: {
    caseStudy: CaseStudy;
    scenario: CaseStudy["scenarios"][number];
    game: FieldGame;
    experiment: Experiment;
    lab: Lab;
  };
};

export function resolveAILabsShowcase(content: AILabsShowcase, repositories: ShowcaseRepositories): ResolvedAILabsShowcase {
  const caseStudy = requireById(repositories.caseStudies, content.northstarThread.caseStudyId, "case study");
  const scenario = caseStudy.scenarios.find((candidate) => candidate.id === content.northstarThread.scenarioId);
  if (!scenario) {
    throw new Error(
      `AI Labs showcase references missing case-study scenario ${content.northstarThread.scenarioId} in ${caseStudy.id}`,
    );
  }

  return {
    content,
    featuredGame: requireById(repositories.games, content.featuredGameId, "game"),
    supportingGames: content.supportingGameIds.map((id) => requireById(repositories.games, id, "game")),
    featuredExperiments: content.featuredExperimentIds.map((id) => requireById(repositories.experiments, id, "experiment")),
    featuredLabs: content.featuredLabIds.map((id) => requireById(repositories.labs, id, "lab")),
    northstarThread: {
      caseStudy,
      scenario,
      game: requireById(repositories.games, content.northstarThread.gameId, "game"),
      experiment: requireById(repositories.experiments, content.northstarThread.experimentId, "experiment"),
      lab: requireById(repositories.labs, content.northstarThread.labId, "lab"),
    },
  };
}
