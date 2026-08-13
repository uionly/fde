import { validateContent } from "../lib/content/loaders";

const result = validateContent();

console.log(
  `Validated ${result.tracks.length} tracks, ${result.lessons.length} lessons, ${result.questions.length} questions, ${result.labs.length} labs, ${result.experiments.length} experiments, ${result.games.length} games, ${result.capstone.phases.length} capstone phases, ${result.glossary.length} glossary entries, ${result.caseStudies.length} case studies, and ${result.resources.length} resources.`,
);
