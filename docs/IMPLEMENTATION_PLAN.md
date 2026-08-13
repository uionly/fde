# Implementation Plan

Implement sequentially. Each milestone should leave the repository working.

---

# Milestone 1 — Repository Bootstrap & Design System

## Goal

Create the application shell and developer experience.

## Deliverables

- Next.js App Router project
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui setup
- light/dark theme
- TO THE NEW magenta primary, cyan accent, and Montserrat typography tokens
- responsive global layout
- primary navigation shell
- placeholder routes:
  - `/`
  - `/learn`
  - `/labs`
  - `/practice`
  - `/case-studies`
  - `/capstone`
  - `/progress`
  - `/resources`
- lint
- typecheck
- Vitest setup
- Playwright setup
- `.env.example`
- baseline README updates

## Acceptance

- application starts locally
- all placeholder pages render
- theme toggles
- navigation works
- no TypeScript/lint failures
- at least one component/unit test
- at least one Playwright smoke test

---

# Milestone 2 — Content Engine & Schemas

## Goal

Allow curriculum content to be authored outside React.

## Deliverables

- MDX support
- content directories
- Zod schemas for:
  - track
  - lesson
  - practice question
  - lab
  - experiment config
  - glossary entry
- content loader utilities
- slug validation
- build-time content validation
- 2 sample tracks
- 4 sample lessons
- custom MDX components:
  - `FDEPrinciple`
  - `CustomerScenario`
  - `Callout`
  - `MermaidDiagram` or safe diagram equivalent
- content validation tests

## Acceptance

Invalid frontmatter fails validation clearly.

No lesson metadata is hard-coded in routes.

---

# Milestone 3 — Learning Tracks & Lesson Experience

## Goal

Build a polished reading experience.

## Deliverables

- `/learn` track index
- `/learn/[trackSlug]`
- `/learn/[trackSlug]/[lessonSlug]`
- lesson sidebar/table of contents
- previous/next
- duration/difficulty
- track/module progress placeholder
- responsive reading layout
- syntax-highlighted code
- lesson CTA area
- initial sample FDE content

## Acceptance

A user can navigate track → lesson → next lesson entirely from content data.

---

# Milestone 4 — Visitor Persistence Foundation

## Goal

Create an account-free, browser-local persistence foundation for the AI Labs showcase.

## Deliverables

- versioned, Zod-validated visitor profile
- lesson, practice, and Field Mission state contracts
- same-tab and cross-tab subscriptions
- no sign-in or demo identity surface
- scoped Start fresh behavior
- `.env.example` updated

## Acceptance

All learning surfaces work without identity. State survives reloads on the same browser, and Start fresh clears only the app-owned learner keys.

---

# Milestone 5 — Progress Tracking

## Goal

Persist learning progress.

## Deliverables

- mark started
- mark complete
- per-track progress
- last activity
- progress page base UI
- device-local typed writes and subscriptions
- tests for progress calculations

## Acceptance

User can complete a lesson, reload, and retain progress on the same browser.

---

# Milestone 6 — Practice Engine

## Goal

Deliver scenario-heavy interactive practice.

## Deliverables

- question schemas and loader
- `/practice`
- category/difficulty filtering
- single-choice support
- multiple-choice support
- PracticeAttempt persistence
- explanations
- alternative-choice rationale
- related lesson links
- at least 25 seeded questions
- practice scoring tests

## Acceptance

User can answer, receive feedback, and see persisted attempt history.

---

# Milestone 7 — Experiment Framework

## Goal

Create reusable interactive learning blocks.

## Deliverables

- experiment registry
- experiment schema
- shared experiment shell
- reset/run behavior conventions
- MDX experiment rendering
- experiment event interface
- placeholder experiment implementation

## Acceptance

A lesson can reference an experiment by data/config ID without importing it in the MDX file.

---

# Milestone 8 — Five MVP Experiments

Implement:

1. Chunking Playground
2. Retrieval Playground
3. Agent Tool Selection
4. Prompt Injection Simulator
5. AI Cost Calculator

## Acceptance

All work in `AI_MODE=mock`.

No third-party AI credentials required.

Each experiment explains the underlying FDE/customer lesson.

---

# Milestone 9 — Guided Lab Framework

## Goal

Create multi-step guided learning.

## Deliverables

- lab content schema
- `/labs`
- `/labs/[slug]`
- ordered steps
- hints
- solution reveal
- validation model
- LabProgress persistence
- resume current step
- 3 initial labs:
  1. Customer Discovery Workshop
  2. Enterprise RAG Architecture
  3. AI Agent Design

## Acceptance

Learner can leave a lab and resume the correct step with saved input.

---

# Milestone 10 — Northstar Case Study

## Goal

Create the continuous fictional enterprise.

## Deliverables

- `/case-studies/northstar`
- company profile
- synthetic systems/data documentation
- progressive scenario releases
- at least 5 scenario cards
- links from relevant lessons/labs
- seed datasets under `content/datasets/northstar`

## Acceptance

Northstar appears consistently across discovery, RAG, agent and security topics.

---

# Milestone 11 — Skill Scoring & Recommendations

## Goal

Turn learner evidence into useful skill signals.

## Deliverables

Skills:
- Discovery
- Architecture
- Software Engineering
- AI Engineering
- Data
- Security
- Production
- Customer Delivery
- Business Thinking

Evidence:
- practice
- lab
- verified deterministic capstone phases

Do not score lesson views.

Provide:
- skill score service
- progress dashboard visualization
- weakest areas
- simple recommended-next logic

## Acceptance

Repeated learner evidence changes scores predictably and is unit-tested.

---

# Milestone 12 — Search, Resources, Polish & MVP Release

## Deliverables

- textual search
- glossary
- resource library
- loading states
- error states
- empty states
- mobile reading polish
- accessibility pass
- analytics hooks
- performance pass
- full E2E smoke suite
- production deployment documentation

## MVP Exit Criteria

All requirements in `MVP_ACCEPTANCE_CRITERIA.md` pass.

---

# Post-MVP Milestone C2 — Editable Capstone & Optional AI Coach

## Goal

Turn the Northstar preview into a complete, resumable field engagement without making a model the authority over learner progress.

## Deliverables

- 12 repository-authored and Zod-validated phases
- structured decisions plus written reasoning
- browser-local draft, active-phase, result, and review persistence
- deterministic completion, sequential unlocks, four-dimension scores, report, and skill evidence
- mock-by-default provider abstraction
- optional server-only Anthropic structured coaching
- bounded request/response validation, safe errors, rate limiting, and metadata-only live audit records
- reset, accessibility, mobile, unit, API, and end-to-end coverage

## Acceptance

The learner can leave and resume the engagement on the same browser. Authored rules—not AI—control completion and evidence. The entire journey works with no credentials in `AI_MODE=mock`; live coaching activates only when server-side Anthropic configuration is present.
