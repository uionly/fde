# Implementation Status

Current milestone: **B1 complete — TO THE NEW brand token refresh**

## Milestones

- [x] M1 — Repository Bootstrap & Design System
- [x] M2 — Content Engine & Schemas
- [x] M3 — Learning Tracks & Lesson Experience
- [x] M4 — Original Authentication & Persistence foundation (superseded by V1)
- [x] M5 — Original Progress Tracking (superseded by V1)
- [x] M6 — Practice Engine
- [x] M7 — Experiment Framework
- [x] M8 — Five MVP Experiments
- [x] M9 — Guided Lab Framework
- [x] M10 — Northstar Case Study
- [x] M11 — Skill Scoring & Recommendations
- [x] M12 — Search, Resources, Polish & MVP Release
- [x] D1 — Documentation Hygiene & Safe Local Onboarding
- [x] V1 — Visitor-only Showcase & Device Progress
- [x] G2 — Routing & Retrieval Simulations
- [x] C1 — Complete MVP Content Expansion
- [x] C2 — Editable Capstone & Optional AI Coach
- [x] B1 — TO THE NEW Brand Token Refresh

## M1 implementation summary

- Bootstrapped Next.js App Router, React, strict TypeScript, and Tailwind CSS.
- Added shadcn/ui configuration and a reusable, variant-driven Button primitive.
- Established semantic light/dark design tokens, refreshed to the TO THE NEW brand system in B1.
- Built a responsive application shell with desktop/mobile navigation, theme switching, and a footer.
- Created a product-quality landing page around the Northstar Financial deployment, the four learning modes, the 10D FDE Framework, field skills, and the capstone.
- Established every primary product route and the foundation extended by later milestones.
- Added ESLint, Vitest, Playwright, environment defaults, and developer documentation.

## Design decisions

- Server Components are the default; only navigation state and theme switching use Client Components.
- Product visuals are code-native and typography-led to preserve the professional engineering-lab character.
- Montserrat drives interface, heading, and prose hierarchy; Geist Mono remains reserved for code, logs, and evidence labels.
- Repository data and domain services drive lessons, labs, practice, experiments, case studies, search, and resources; route components stay thin.
- The shipped showcase is account-free. Versioned, Zod-validated browser storage persists lesson, practice, Field Mission, Field Arcade, and capstone state on this device.
- `AI_MODE=mock` is the credential-free default.

## Verification

- `npm run validate:content` — passed (9 tracks, 48 lessons, 150 questions, 12 capstone phases, and all other repository content)
- `npm run lint` — passed
- `npm run typecheck` — passed
- `npm run test` — passed (115 tests across 29 files)
- `npm run build` — passed; 102 pages generated plus the dynamic capstone coaching endpoint
- `npm run test:e2e` — passed (29 serial Chromium journeys, including light/dark brand rendering, offline font fallback, deterministic capstone completion, immediate navigation save, reload resume, mock coaching, verified skill evidence, 360px/reduced-motion coverage, full visitor reset, G2 mechanics, and the integrated visitor path)

## Known limitations

- The MVP curriculum target is complete at 48 published lessons and 150 scenario-heavy questions across nine tracks and eight practice categories.
- Visitor evidence is intentionally local to one browser and does not synchronize across devices.
- Model routing and retrieval now have dedicated mechanics. The other four Field Arcade missions retain the decision-card renderer until G3 and later expansion.
- Field Arcade evidence remains separate from practice/Field Mission skill scoring until G4; Start fresh clears both app-owned visitor records while preserving theme and unrelated browser storage.
- Analytics hooks remain provider-neutral browser events until a collection adapter is configured.
- Optional Anthropic coaching is server-only and advisory. Multi-instance production still needs a shared rate limiter and provider cost/availability monitoring.
- Capstone evidence is verified against authored rules but remains self-directed browser evidence, not tamper-proof certification or cross-device account history.
- Montserrat uses the supplied Google Fonts stylesheet; the complete system-font fallback keeps the showcase usable when that request is unavailable.
- The in-app visual inspection connection was unavailable in this environment; local Chromium rendering and comprehensive automated interaction coverage passed.

## Next milestone

All milestones in `docs/IMPLEMENTATION_PLAN.md` remain complete. The next post-MVP game milestone is G3 in `docs/GAME_IMPLEMENTATION_PLAN.md`: Prompt Injection Detective and Agent Access Lockdown.

## M2 validation record

- Added repository-backed Zod schemas, typed loaders, duplicate detection, slug rules, and cross-reference validation.
- Added two sample tracks and four representative MDX lessons outside React route source.
- Added FDE Principle, Customer Scenario, Callout, and safe diagram components.
- Added build-time content validation via `prebuild`.
- `lint`, `typecheck`, 4 unit tests, content validation, and production build passed.

## M3 validation record

- Replaced placeholders with content-driven track and lesson routes, metadata, table of contents, objectives, and previous/next navigation.
- Added reusable track cards, lesson list items, progress bars, difficulty badges, and an MDX lesson body.
- Passed lint, typecheck, 5 unit tests, production build, and 3 Chromium journeys.

## M4 validation record (historical; superseded by V1)

- Added Auth.js with an explicit local development identity and optional Google provider.
- Added PostgreSQL Prisma 7 schema, generated client, initial migration, and session-aware navigation.
- Anonymous lesson browsing remains available; learner-state routes can authenticate server-side.
- Passed lint, typecheck, 5 unit tests, production build, and 4 Chromium journeys including sign-in.

## M5 validation record (historical; superseded by V1)

- Added authenticated lesson completion writes with PostgreSQL persistence and an explicit development fallback.
- Added learner dashboard, latest-lesson resume, overall/track progress, and persisted completion UI.
- Added progress aggregation tests and protected progress API.
- Passed lint, typecheck, 7 unit tests, production build, and 5 Chromium journeys including completion and reload.

## M6 validation record

- Added 25 validated, scenario-heavy single- and multiple-choice questions.
- Added category/difficulty filters, exact and partial scoring, choice rationales, related lessons, and authenticated attempt persistence.
- Added Prisma attempt model and migration plus development persistence fallback.
- Passed lint, typecheck, 10 unit tests, content validation, production build, and a persisted-practice Chromium journey.

## M7 validation record

- Added typed experiment registry, shared shell, lifecycle event envelope, reset/run conventions, MDX rendering by configuration ID, and static experiment routes.
- Added an accessible deterministic placeholder and registry/event tests.
- Passed lint, typecheck, 12 unit tests, content validation, production build, and embedded experiment browser navigation.

## M8 validation record

- Implemented deterministic chunking, retrieval, agent tool selection, prompt injection, and AI cost experiments.
- Every experiment explains its customer learning goal, supports reset, and is keyboard operable.
- Added simulation unit tests and an end-to-end journey that runs all five tools.
- Passed lint, typecheck, 16 unit tests, five experiment config validations, production build, and Chromium interaction checks.

## M9 validation record

- Added three ordered labs with scenario, goals, working notes, hints, solution reveal, completion, and step-level persistence.
- Added protected lab progress API, Prisma model/migration, and development persistence fallback.
- Passed lint, typecheck, 19 unit tests, three lab validations, production build, and a save/reload/resume Chromium journey.

## M10 validation record

- Added validated Northstar customer profile, six fictional systems, and ten progressive customer problems.
- Added synthetic customer, account, ticket, role, policy, and rate-limit datasets with explicit training-data notices.
- Linked Northstar from multiple lessons and every guided lab.
- Passed lint, typecheck, 21 unit tests, content validation, production build, and case-reveal Chromium checks.

## M11 validation record

- Added weighted, deterministic scoring across nine skills using only practice and completed-lab evidence.
- Added derived PostgreSQL score snapshots, weak-area ranking, and recommended-next logic.
- Added progress skill visualization and dashboard recommendations.
- Passed lint, typecheck, 24 unit tests, production build, and a Chromium evidence-to-score journey.

## M12 validation record

- Added global textual search across lessons, labs, glossary, practice, resources, and Northstar scenarios.
- Added eight glossary terms, six previewable/downloadable field templates, typed analytics hooks, and provider-neutral events.
- Added global loading/error/empty states, skip navigation, visible focus treatment, mobile navigation coverage, and deployment documentation.
- Stabilized stateful end-to-end journeys as a serial release suite.
- Passed content validation, lint, strict typecheck, 28 unit tests, production build, 13 Chromium journeys, mobile keyboard checks, resource download checks, and the integrated MVP learner path.

## AI Labs Arcade enhancement

- Made `/labs` the default hands-on AI Labs home and consolidated playgrounds, decision games, and guided enterprise missions in one destination.
- Added six reusable, data-driven customer decision games covering model routing, prompt injection, retrieval, agent boundaries, data freshness, and evaluation design.
- Added device-persisted Field XP, completion state, daily streaks, levels, replay-safe rewards, and a daily mission without introducing childish mechanics.
- Updated primary navigation and experiment return paths to use the unified AI Labs destination.
- Passed content validation, lint, strict typecheck, 31 unit tests, production build, and all 14 serial Chromium journeys.

## G1 Field Arcade validation record

- Added the dedicated `/games` route and six statically generated `/games/[gameSlug]` routes, with permanent redirects from the former nested URLs.
- Migrated quick missions into Zod-validated repository content with twelve authored customer scenario variants.
- Added a registry-driven no-typing game shell with deterministic choice order, four-dimension scoring, system consequences, and FDE debriefs.
- Added a versioned shared profile with legacy migration, one-time scenario XP, streaks, attempt counts, personal bests, scenario rotation, and skill mastery evidence.
- Connected AI Labs to the dedicated Field Arcade and preserved the existing technical playground and guided-lab experiences.
- Added visible keyboard focus, mobile overflow coverage, and reduced-motion behavior; fixed the global mobile header width discovered by the browser gate.
- Passed repository content validation, lint, strict typecheck, 35 unit tests, production build, and the full Chromium suite including canonical-route and legacy-redirect coverage.

## S1 AI Labs showcase validation record

- Repositioned the landing page around an immediately playable three-minute Northstar deployment call and made every learning-mode card navigable.
- Simplified the primary navigation while preserving every required route through grouped AI Labs, Customer Engagement, utilities, mobile navigation, and the footer.
- Made AI Labs the active parent for `/labs`, `/games`, `/experiments`, and Field Missions while retaining `/games` and `/experiments` as the canonical full catalogs.
- Rebuilt `/labs` as a curated, server-composed showcase driven by a Zod-validated manifest: one featured incident, two supporting games, three playgrounds, three Field Missions, and one Northstar signal-to-delivery thread.
- Added customer-first game headlines, explicit mechanics, and validated debrief actions that connect each mission to a lesson, playground, Field Mission, customer file, or field resource.
- Added games and playgrounds to global search.
- Added a confirmed `Start fresh` flow that reloads AI Labs at zero state and preserves theme and unrelated browser storage; V1 later expanded it to all app-owned visitor learning state and removed sign-out/account behavior.
- Made the reset available across every AI Labs route with an accessible modal, safe partial-failure handling, focus restoration, an unsaved-work warning, and a visible fresh-session confirmation.
- Added phase-aware keyboard focus and concise result announcements to games, publishable-reference checks to connected content, and direct customer links that reveal the referenced Northstar incident.
- Verified desktop and 320/360px mobile rendering, zero horizontal document overflow, reduced-motion behavior, keyboard operation, and the reset dialog/status presentation in local Chromium.
- Passed content validation, lint, strict typecheck, 45 unit tests, production build, and all 21 serial Chromium journeys.

## D1 documentation hygiene validation record

- Rewrote the canonical README around the shipped AI Labs, Field Arcade, playground, Field Mission, learning, practice, Northstar, progress, and resource experiences.
- Documented exact seed counts, persistence boundaries, visitor-reset behavior, honest product limitations, the active game roadmap, and verified project commands.
- Corrected local onboarding so no environment file or external service is required; the optional `.env.example` no longer activates PostgreSQL or development credentials by default.
- Aligned production guidance with the supported Node.js ranges, deterministic mock-only behavior, and the current Playwright server model.
- Added `PLAYWRIGHT_BASE_URL` support for validating an already-running or deployed release candidate.
- Removed the unreferenced bootstrap-only `docs/CODEX_START_PROMPT.md` and refreshed the seed document as an active content-expansion plan.
- Added documentation regression tests for links, scripts, safe environment defaults, and starter-artifact removal.
- Passed content validation, lint, strict typecheck, 48 unit tests across 15 files, the 53-route production build, and all 21 serial Chromium journeys against an existing local server.

## V1 visitor-only showcase validation record

- Removed the fake Credentials identity, Auth.js runtime/API/session provider, sign-in navigation, auth-gated server actions/routes, auth environment variables, and the unused Auth.js packages/types.
- Kept legacy `/signin` and `/dashboard` bookmarks safe with permanent redirects to AI Labs and Progress; neither route exposes an identity surface.
- Added one versioned, Zod-validated visitor profile for lesson completion, practice attempts/evidence, and Field Mission state, including same-tab and cross-tab subscriptions.
- Made lessons, practice, and all three Field Missions immediately usable without identity, with honest this-device save and storage-failure feedback.
- Rebuilt `/progress` as a browser-local evidence workspace covering curriculum/track completion, practice and completed-lab skill evidence, recommendations, Field Mission completion, and Arcade profile summary.
- Expanded **Start fresh** to clear exactly the visitor-progress and Field Arcade keys while preserving theme and unrelated local storage; updated confirmation, success, focus, failure, and mobile behavior.
- Reconciled the README, environment example, deployment guide, product specification, acceptance criteria, implementation plan, and architecture around visitor-only showcase mode.
- Passed repository content validation, ESLint, strict TypeScript, 60 unit tests across 18 files, the 51-output production build, and all 21 serial Chromium journeys.

## G2 Routing and Retrieval validation record

- Replaced the original Model Router and Retrieval quick missions with dedicated, no-typing production simulations while preserving their canonical routes.
- Added Zod-discriminated `model-router` and `retrieval-rank` content variants, exhaustive renderer registration, two authored scenarios per game, strict reference checks, and new progress keys that do not collide with G1 completions.
- Added Model Router Rush request-to-lane assignment with traffic-volume-weighted quality, safety, cost, and latency consequences plus per-route debriefs.
- Added Retrieval Rank Race evidence inclusion/removal, explicit move-up/move-down controls, a hard context budget, rank-sensitive quality scoring, and independent quality, safety, cost, and latency launch gates.
- Preserved named pointer, touch, and keyboard controls; phase focus; concise announcements; mobile layouts; reduced-motion behavior; one-time scenario XP; personal bests; and deterministic scenario rotation.
- Passed repository content validation, full ESLint, strict TypeScript, all 74 unit tests across 21 files, the 51-output production build, direct desktop and Pixel 5 Chromium inspection, and all 24 serial Chromium journeys.

## C1 Complete MVP Content Expansion validation record

- Expanded the repository-authored curriculum from two tracks and four representative lessons to nine published tracks and 48 lessons while preserving every existing lesson route.
- Covered FDE Foundations, Discovery & Problem Framing, Solution Architecture, LLM Engineering, AI Evaluations, Enterprise RAG, Agents & Tools, Enterprise AI Security, and cross-cutting production/outcome operation.
- Expanded practice from 25 to 150 scenario-heavy single- and multiple-choice questions across eight categories, each with answer rationales, an explanation, an FDE principle, and a related lesson.
- Connected every question to exactly one matching lesson practice set, added lesson-specific practice links, applied deterministic choice presentation to eliminate answer-position bias, and strengthened Zod/content-graph checks for choice references, question cardinality, ordered prerequisites, related lessons, ownership, and unique track/lesson ordering.
- Preserved Northstar/customer framing across every new lesson with Customer Scenario and FDE Principle blocks, coherent prerequisites, and 250–360 words of substantive content.
- Replaced fixed lesson-time estimates with authored duration totals on the curriculum index and documented the retained Enterprise AI Systems bridge track in the nine-track information architecture.
- Passed repository content validation, full ESLint, strict TypeScript, all 76 unit tests across 21 files, the 102-page production build, and all 25 serial Chromium journeys.

## C2 Editable Capstone & Optional AI Coach validation record

- Replaced the capstone preview with a data-driven 12-phase Northstar engagement covering Discovery through ROI, with two authored decision controls, required field reasoning, customer reveals, rubrics, consequences, hints, expert comparisons, related lessons, and four-dimension scoring in every phase.
- Added sequential deterministic completion, synchronous/debounced draft persistence, active-phase resume, verified re-evaluation of browser inputs, a compiled engagement report, Capstone progress summaries, and weighted skill evidence. Persisted score snapshots and optional AI scores are never trusted as the completion authority.
- Added a separate versioned capstone browser record with same-tab/cross-tab synchronization, malformed-state fallback, bounded fields, reset integration, and hydration-safe restoration. Start fresh clears Capstone work together with other app-owned learning records while preserving theme and unrelated storage.
- Added a provider-neutral, server-only coaching boundary with deterministic mock mode by default and optional Anthropic structured-output reviews. The route resolves all customer/rubric context from authored content, validates bounded IDs and notes, supplies no tools, revalidates output, applies a 16 KB request limit and best-effort 10/minute limiter, returns typed safe failures, and emits metadata-only live audit records.
- Kept the authority split explicit throughout the UI: authored rules control completion, unlocking, reports, and skill evidence; AI critiques the submitted reasoning and shows advisory scores only. Editing an answer clears stale reviews, and delayed responses cannot attach to a newer draft.
- Added Capstone search discovery, deployment/secret guidance, responsive and accessible controls, focus/live-region behavior, long-text wrapping, and tests for deterministic gating, immediate navigation save, reload resume, mock coaching, stale-response cancellation, API error paths, Anthropic request structure, progress evidence, reset, and mobile overflow.
- Final validation evidence is recorded in the top-level Verification section after the full C2 gate.

## B1 TO THE NEW brand token validation record

- Replaced the former orange identity with the supplied TO THE NEW palette while retaining the existing semantic Tailwind architecture: TTN magenta is primary, cyan is accent, ink/gray is neutral, and emerald/rose/amber cover status states.
- Adopted Montserrat for both sans and serif utility families and removed the redundant Geist Sans load while retaining Geist Mono for technical content.
- Mapped the supplied 8px/12px geometric radius scale and neutral small elevation across existing cards, dialogs, and hover states; removed stray violet, orange, sky, and neutral UI utilities in favor of branded palette tokens.
- Added accessible theme-specific semantic tones rather than using magenta-500 for normal text, plus a dedicated inverse-surface accent and higher-contrast status treatments. Primary, cyan accent, inverse accent, muted text, and status text were contrast-audited in light and dark themes.
- Preserved visible focus, dark mode, reduced-motion behavior, theme persistence, and responsive layouts. Rendered Chromium review covered the landing page, AI Labs at 390px, and capstone in dark mode; automated coverage also blocks Google Fonts to verify the fallback stack and 360px overflow behavior.
- Passed repository content validation, full ESLint, strict TypeScript, all 115 unit tests across 29 files, the 102-page production build plus coaching endpoint, and all 29 serial Chromium journeys.
