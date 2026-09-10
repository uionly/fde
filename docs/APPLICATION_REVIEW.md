# Application review — FDE learning and reference hub

Reviewed 2026-09-10 against SPEC.md, MVP_ACCEPTANCE_CRITERIA.md, the implementation plan, and the current source/content. This is a product and source review, not a security audit or an expert assessment of every lesson.

## R1 — Learning hub and obsolete runtime cleanup

This single milestone makes the existing learning and reference library easier to discover. It does not expand the curriculum or implement the next game milestone.

Completed:
- Replaced the game-first landing page with an FDE introduction, Start learning, browser-progress access, shared search, and direct links to all six core learning/reference surfaces.
- Displayed the published roadmap and content counts from validated repository content.
- Kept Northstar and the 10D framework; removed the oversized mission preview, repeated promotional sections, decorative effects, and redundant skill tiles.
- Replaced the footer's hard-coded game promotion with curriculum access.
- Removed the inaccurate “complete field curriculum” claim and labeled the growing curriculum accurately.
- Added an accessible name to the existing search input.
- Removed unused PagePreview bootstrap UI, obsolete account-based progress/practice/lab/skill stores, Prisma runtime dependencies, generated client, schema, migrations, configuration, and install-time generation. No database was accessed or modified; version control retains the historical schema. Browser persistence and compatibility redirects remain.

## Prioritized remaining gaps

| Priority | Gap and source evidence | Recommended bounded milestone |
| --- | --- | --- |
| High | Broad FDE coverage is unfinished. SPEC §9 describes 14 tracks; nine are published under content/tracks. AI-native engineering, MCP/integration, data engineering, production/observability, delivery, and business impact need deeper dedicated coverage, although some concepts appear within existing tracks. The 48-lesson MVP target is not evidence of comprehensive coverage. | Map every §9 objective to existing lessons and exercises; publish the most important uncovered customer workflow first. |
| High | Guided labs record notes and advance steps without validating the quality of the artifact (components/labs/lab-workspace.tsx, lib/labs/progress.ts). Completion alone should not be read as demonstrated mastery. | Add explicit authored acceptance checks and distinguish self-reported completion from evaluated skill evidence. |
| High | The debugging evidence workspace, editable constraint-checked architecture builder, and coding exercises described in SPEC §§16–19 are absent as dedicated experiences. Multiple-choice scenarios and capstone decisions provide useful preparation but do not exercise those workflows fully. | Build one realistic customer incident with logs, configuration, API evidence, root-cause reasoning, and remediation checks. Then scope architecture work separately. |
| Medium | Reference depth and discoverability need further work: only eight glossary entries and six downloadable resources are published, versus the broader template list in SPEC §30. Glossary entries in content/glossary/ai-systems.json include empty relatedLessons. Search uses substring ranking, has no type filter, and resource body text is excluded (lib/search/search.ts). | Expand and cross-link glossary entries; index template bodies and add content-type filtering with relevance tests. |
| Medium | Progress is local to a browser, and Arcade evidence remains separate from the skill dashboard. A returning learner cannot transfer notes or evidence to another device. This is an explicit V1 limitation, not a defect. | Add versioned export/import with validation before considering accounts or synchronization. |
| Medium | The content model has no uniform source/review-date metadata for technical references. A long-lived information hub needs a way to identify stale material. | Add source attribution and reviewed-at metadata with a documented maintenance process. |
| Low | Four Arcade missions still share the decision-card mechanic. More game mechanics provide less coverage value than the missing field workflows above. | Keep the existing activities accessible; prioritize curriculum and practical evidence before G3. |

## Scope decisions

Retain the functioning lessons, practice, labs, simulations, Northstar, capstone, templates, progress, mock AI mode, and branded theme. They support the intended product. Do not add a forum, certificates, payments, video hosting, live enterprise integrations, or a browser IDE solely to claim an “all-in-one” solution; these are V1 non-goals in SPEC §5.

Recommended next milestone: a coverage map and one focused missing FDE workflow. R1 stops after validation; future priorities here are recommendations, not automatic authorization to implement every gap.
