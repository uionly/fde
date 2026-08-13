import { getAllCaseStudies, getAllExperiments, getAllGames, getAllGlossaryEntries, getAllLabs, getAllLessons, getAllQuestions, getAllResources, getCapstone } from "@/lib/content";

export type SearchItem = { id: string; type: "lesson" | "lab" | "experiment" | "game" | "glossary" | "practice" | "resource" | "case-study" | "capstone"; title: string; description: string; href: string; searchText: string };

export function buildSearchIndex(): SearchItem[] {
  const lessons: SearchItem[] = getAllLessons().map((lesson) => ({ id: lesson.frontmatter.id, type: "lesson", title: lesson.frontmatter.title, description: lesson.frontmatter.objectives.join(" · "), href: `/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`, searchText: `${lesson.frontmatter.title} ${lesson.frontmatter.objectives.join(" ")} ${lesson.content}` }));
  const labs: SearchItem[] = getAllLabs().map((lab) => ({ id: lab.id, type: "lab", title: lab.title, description: lab.description, href: `/labs/${lab.slug}`, searchText: `${lab.title} ${lab.description} ${lab.scenario} ${lab.skills.join(" ")}` }));
  const experiments: SearchItem[] = getAllExperiments().map((experiment) => ({ id: experiment.id, type: "experiment", title: experiment.title, description: experiment.description, href: `/experiments/${experiment.id}`, searchText: `${experiment.title} ${experiment.description} ${experiment.learningGoal} ${experiment.type}` }));
  const games: SearchItem[] = getAllGames().map((game) => ({
    id: game.id,
    type: "game",
    title: game.title,
    description: game.customerHeadline,
    href: `/games/${game.slug}`,
    searchText: `${game.title} ${game.shortTitle} ${game.customerHeadline} ${game.description} ${game.mechanic} ${game.category} ${game.skills.join(" ")} ${game.learningObjectives.join(" ")} ${game.principle} ${game.scenarios.map((scenario) => JSON.stringify(scenario)).join(" ")}`,
  }));
  const glossary: SearchItem[] = getAllGlossaryEntries().map((entry) => ({ id: entry.slug, type: "glossary", title: entry.term, description: entry.shortDefinition, href: `/resources/glossary/${entry.slug}`, searchText: `${entry.term} ${entry.shortDefinition}` }));
  const practice: SearchItem[] = getAllQuestions().map((question) => ({ id: question.id, type: "practice", title: question.prompt, description: question.scenario, href: `/practice?category=${question.category}`, searchText: `${question.prompt} ${question.scenario} ${question.category} ${question.skills.join(" ")}` }));
  const resources: SearchItem[] = getAllResources().map((resource) => ({ id: resource.id, type: "resource", title: resource.title, description: resource.description, href: `/resources/templates/${resource.slug}`, searchText: `${resource.title} ${resource.description} ${resource.category}` }));
  const cases: SearchItem[] = getAllCaseStudies().flatMap((study) => study.scenarios.map((scenario) => ({ id: `${study.id}-${scenario.id}`, type: "case-study" as const, title: `${study.company}: ${scenario.title}`, description: scenario.customerProblem, href: `/case-studies/${study.slug}#${scenario.id}`, searchText: `${study.company} ${scenario.title} ${scenario.signal} ${scenario.customerProblem} ${scenario.skills.join(" ")}` })));
  const capstone = getCapstone();
  const capstones: SearchItem[] = [{ id: capstone.id, type: "capstone", title: capstone.title, description: capstone.description, href: "/capstone", searchText: `${capstone.title} ${capstone.description} ${capstone.phases.map((phase) => `${phase.title} ${phase.context} ${phase.reveal} ${phase.prompt} ${phase.skills.join(" ")}`).join(" ")}` }];
  return [...lessons, ...labs, ...experiments, ...games, ...glossary, ...practice, ...resources, ...cases, ...capstones];
}

export function searchContent(index: SearchItem[], query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return index.map((item) => { const title = item.title.toLowerCase(); const text = item.searchText.toLowerCase(); const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 4 : 0) + (text.includes(term) ? 1 : 0), 0); return { ...item, score }; }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
