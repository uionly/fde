# FDE Learning Lab

FDE Learning Lab is an enterprise-AI deployment simulator for experienced Software Engineers moving into Forward Deployed Engineering.

Learners work inside a continuous fictional customer engagement, Northstar Financial. They discover the real problem, make architecture and safety decisions, test system behavior, build customer artifacts, debug production failures, and connect technical work to adoption and business outcomes. The experience follows the **10D FDE loop**:

**Discover → Define → De-risk → Design → Demonstrate → Develop → Evaluate → Deploy → Drive Adoption → Distill**

This is not a beginner programming course or a video LMS. Every concept starts with a customer or production problem.

## Learning experiences

| Surface | What the learner does | Current seed |
| --- | --- | --- |
| AI Labs — `/labs` | Enter the hands-on product through a curated incident, simulation, playground, or Field Mission. | One connected showcase journey |
| Field Arcade — `/games` | Make no-typing deployment decisions and inspect deterministic quality, safety, cost, and latency consequences. | 6 games, 12 authored scenarios |
| Playgrounds — `/experiments` | Change technical variables in chunking, retrieval, agent tools, prompt injection, and AI economics. | 5 deterministic experiments |
| Field Missions — `/labs#field-missions` | Complete longer customer deliverables with ordered steps, notes, hints, solutions, and resume support. | 3 guided missions |
| Learn — `/learn` | Build FDE and enterprise-AI mental models through repository-authored, validated MDX lessons. | 2 tracks, 4 representative lessons |
| Practice — `/practice` | Work through scenario-heavy single- and multiple-choice decisions with rationales. | 25 questions |
| Customer Engagement — `/case-studies` | Follow Northstar across progressive enterprise incidents and preview the end-to-end capstone. | 10 incidents, 6 fictional systems |
| Progress, search, and resources | Review browser-local learning evidence, find content, and download field templates. | 9 skills, 8 glossary entries, 6 templates |

All Northstar people, systems, records, and policies are synthetic.

## Run locally

Requirements:

- Node.js `^20.19`, `^22.12`, or `>=24`
- npm

No database, environment file, model-provider key, or external service is required for local development:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app is a visitor-only showcase: there is no account or sign-in flow. Lesson completion, practice evidence, Field Mission state, and Field Arcade progress persist in versioned, validated browser storage on this device.

The current AI experiences are deterministic and credential-free. `AI_MODE=mock` is the supported product mode; a live provider adapter is not implemented yet.

Experiments remain ephemeral and provide their own reset controls. There is no cross-device or account synchronization. See the [production deployment guide](docs/DEPLOYMENT.md) for release guidance.

## Persistence and visitor reset

| State | Storage | What **Start fresh** does |
| --- | --- | --- |
| Lesson completion, practice attempts/evidence, and Field Mission state | Versioned, Zod-validated local storage in this browser | Clears all visitor learning state |
| Field Arcade XP, streak, completions, and personal bests | This browser's local storage | Clears the device profile |
| Playground inputs and results | Ephemeral component state | Already reset within each playground |
| Theme and unrelated browser settings | Browser storage | Preserves them |

The persistent **Start fresh** control appears throughout AI Labs. It is intended for demos, labs, and shared devices so the next visitor can begin at zero while preserving theme and unrelated browser storage.

## Quality checks

```bash
npm run validate:content
npm run lint
npm run typecheck
npm run test
npm run build
```

Install Chromium once and run the serial interaction suite:

```bash
npx playwright install chromium
npm run test:e2e
```

The Playwright configuration starts its own development server at `http://127.0.0.1:3100`.
To exercise an already-running or deployed instance instead, set `PLAYWRIGHT_BASE_URL`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Project map

```text
app/                    Routes, server actions, APIs, and global states
components/             Layout and interactive learning experiences
content/                Version-controlled lessons, games, labs, and customer data
lib/ai-labs/            Curated AI Labs showcase resolution
lib/content/            Zod schemas, loaders, indexing, and graph validation
lib/games/              Deterministic game runtime and device profile
lib/experiments/        Deterministic technical simulations
lib/labs/               Guided-mission progression and browser persistence
lib/practice/           Practice scoring and browser evidence
lib/progress/           Lesson completion aggregation and browser persistence
lib/skills/             Evidence-based scoring and recommendations
lib/search/             Cross-content search index
tests/unit/             Vitest domain, component, and documentation tests
tests/e2e/              Playwright product and accessibility journeys
docs/                   Product source, architecture, plans, and deployment guidance
```

## Current limitations

- The content engine is ready to scale, but the current seed has 4 representative lessons rather than the planned 40–50.
- The six Field Arcade games currently share a decision-card renderer; distinct routing, retrieval, security, and agent mechanics are planned in G2 and G3.
- All learner evidence is device-local and is not synchronized across browsers or devices.
- The capstone describes the full engagement but is not yet an editable, resumable workspace.
- Analytics are typed browser events without a configured collection adapter.
- Live AI-provider execution is not implemented; all shipped simulations remain deterministic.

## Documentation

- [Product specification](docs/SPEC.md)
- [MVP acceptance criteria](docs/MVP_ACCEPTANCE_CRITERIA.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Content model](docs/CONTENT_MODEL.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Field Arcade roadmap](docs/GAME_IMPLEMENTATION_PLAN.md)
- [Northstar case study](docs/NORTHSTAR_CASE_STUDY.md)
- [Content expansion plan](docs/SEED_CONTENT_PLAN.md)
- [Implementation status](IMPLEMENTATION_STATUS.md)

The next product milestone is **G2 — Routing and Retrieval Simulations**, defined in the [Field Arcade roadmap](docs/GAME_IMPLEMENTATION_PLAN.md).
