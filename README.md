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
| Dashboard, progress, search, and resources | Resume work, inspect evidence-based skills, find content, and download field templates. | 9 skills, 8 glossary entries, 6 templates |

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

Open [http://localhost:3000](http://localhost:3000). Development sign-in is available automatically outside production. Lesson, practice, and lab state use an in-process fallback and therefore reset when the development server restarts.

The current AI experiences are deterministic and credential-free. `AI_MODE=mock` is the supported product mode; a live provider adapter is not implemented yet.

## Optional durable persistence

PostgreSQL is required only when learner state must survive application restarts. Prisma and Next.js both read the root `.env` file, so use that filename for a shared local configuration:

```bash
cp .env.example .env
```

Then uncomment and replace `DATABASE_URL`, set a strong `AUTH_SECRET`, and apply the migrations:

```bash
npx prisma migrate deploy
npm run dev
```

Google sign-in is optional. Configure both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` to expose it. Keep `ENABLE_DEV_AUTH=false` in every public deployment.

See the [production deployment guide](docs/DEPLOYMENT.md) for the complete release configuration.

## Persistence and visitor reset

| State | Storage | What **Start fresh** does |
| --- | --- | --- |
| Lessons, practice attempts, labs, and skill evidence | PostgreSQL when configured; process memory during credential-free development | Preserves saved account work |
| Field Arcade XP, streak, completions, and personal bests | This browser's local storage | Clears the device profile |
| Authentication session | Browser session cookie | Signs out the current browser |
| Theme and unrelated browser settings | Browser storage | Preserves them |

The persistent **Start fresh** control appears throughout AI Labs. It is intended for demos, labs, and shared devices so the next visitor can begin at zero without deleting the previous learner's account evidence.

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
lib/labs/               Guided-mission progression and persistence
lib/practice/           Practice scoring and attempt persistence
lib/progress/           Lesson completion aggregation and persistence
lib/skills/             Evidence-based scoring and recommendations
lib/search/             Cross-content search index
prisma/                 PostgreSQL schema and migrations
tests/unit/             Vitest domain, component, and documentation tests
tests/e2e/              Playwright product and accessibility journeys
docs/                   Product source, architecture, plans, and deployment guidance
```

## Current limitations

- The content engine is ready to scale, but the current seed has 4 representative lessons rather than the planned 40–50.
- The six Field Arcade games currently share a decision-card renderer; distinct routing, retrieval, security, and agent mechanics are planned in G2 and G3.
- Field Arcade evidence is device-local and does not yet contribute to account skill scores or recommendations.
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
