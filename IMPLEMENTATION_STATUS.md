# Implementation Status

Current milestone: **V1 complete — fake authentication removed; visitor-only device progress shipped**

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

## M1 implementation summary

- Bootstrapped Next.js App Router, React, strict TypeScript, and Tailwind CSS.
- Added shadcn/ui configuration and a reusable, variant-driven Button primitive.
- Established semantic light/dark design tokens with a restrained orange accent.
- Built a responsive application shell with desktop/mobile navigation, theme switching, and a footer.
- Created a product-quality landing page around the Northstar Financial deployment, the four learning modes, the 10D FDE Framework, field skills, and the capstone.
- Established every primary product route and the foundation extended by later milestones.
- Added ESLint, Vitest, Playwright, environment defaults, and developer documentation.

## Design decisions

- Server Components are the default; only navigation state and theme switching use Client Components.
- Product visuals are code-native and typography-led to preserve the professional engineering-lab character.
- Repository data and domain services drive lessons, labs, practice, experiments, case studies, search, and resources; route components stay thin.
- The shipped showcase is account-free. Versioned, Zod-validated browser storage persists lesson, practice, Field Mission, and Field Arcade state on this device.
- `AI_MODE=mock` is the credential-free default.

## Verification

- `npm run lint` — passed
- `npm run typecheck` — passed
- `npm run test` — passed (60 unit tests across 18 files)
- `npm run build` — passed; 51 static, generated, and dynamic route outputs
- `npm run test:e2e` — passed (21 serial Chromium journeys, including no-sign-in regression coverage, browser-local lesson/practice/lab persistence, AI Labs hierarchy, accessible full visitor reset, mobile coverage, legacy redirects, and one integrated visitor path)

## Known limitations

- Seed curriculum intentionally contains four representative lessons; the content engine supports adding 40+ without route changes.
- Visitor evidence is intentionally local to one browser and does not synchronize across devices.
- The capstone route communicates the 12-phase engagement but full phase-level editing/persistence remains a post-MVP extension.
- Current Field Arcade quick missions share the decision-card renderer; the distinct routing, retrieval, security, and agent mechanics remain G2/G3 work.
- Field Arcade evidence remains separate from practice/Field Mission skill scoring until G4; Start fresh clears both app-owned visitor records while preserving theme and unrelated browser storage.
- Analytics hooks remain provider-neutral browser events until a collection adapter is configured.
- The in-app visual inspection connection was unavailable in this environment; local Chromium rendering and comprehensive automated interaction coverage passed.

## Next milestone

All milestones in `docs/IMPLEMENTATION_PLAN.md` remain complete. The next post-MVP game milestone is G2 in `docs/GAME_IMPLEMENTATION_PLAN.md`: Model Router Rush and Retrieval Rank Race.

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
