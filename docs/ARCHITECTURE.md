# Architecture Specification

## Architectural Style

Start as a modular Next.js application.

Do not introduce microservices for the MVP.

Use a separate execution service only if/when arbitrary learner code execution becomes necessary.

## High-Level Components

```text
Browser
  |
  v
Next.js Application
  |-- App Router UI
  |-- Server Components
  |-- Route Handlers / Server Actions
  |-- Content loaders
  |-- Practice/scoring domain
  |-- Progress domain
  |-- Experiment registry
  |
  +--> PostgreSQL / Prisma
  |
  +--> Repository MDX/JSON content
  |
  +--> Mock AI Provider (default)
  |
  +--> Live AI Provider (future/optional)
```

## Boundary Rules

### `app/`
Routing and presentation composition.

Keep business logic out.

### `components/`
Reusable visual/interactive components.

Suggested:
- `components/ui`
- `components/layout`
- `components/lesson`
- `components/practice`
- `components/experiments`
- `components/labs`
- `components/progress`
- `components/architecture`

### `lib/content`
Content parsing, validation, indexing.

### `lib/practice`
Question selection and scoring.

### `lib/progress`
Progress aggregation.

### `lib/skills`
Skill score calculation.

### `lib/ai`
Provider abstraction.

### `lib/db`
Prisma and persistence helpers.

### `content/`
Product/course source data.

## Rendering

Use Server Components for:
- landing page
- track lists
- lesson body
- progress summaries where practical
- static resources

Use Client Components for:
- theme toggle
- experiments
- practice interactions
- architecture builders
- lab editors
- charts requiring browser APIs

## Content Safety

MDX content is repository-controlled.

Still validate frontmatter and component props.

Avoid arbitrary runtime MDX supplied by users.

## AI Architecture

Default:

`AI_MODE=mock`

The core product must work entirely without live LLM access.

Future provider interface:

```ts
type GenerateRequest = {
  system?: string
  prompt: string
  maxTokens?: number
  metadata?: Record<string, string>
}

type GenerateResponse = {
  text: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}

interface AIProvider {
  generate(request: GenerateRequest): Promise<GenerateResponse>
}
```

No provider SDK should leak through lesson/experiment domain APIs.

## Authentication

Auth.js.

Anonymous:
- browse lessons/resources

Authenticated:
- progress
- practice history
- labs
- case study persistence
- capstone
- recommendations

## Database

PostgreSQL + Prisma.

Keep course content in Git, not database, for V1.

Database is learner-state oriented.

## Security

- input validation at all trust boundaries
- no secrets to browser
- auth checks on writes
- safe MDX
- rate limit sensitive endpoints
- no arbitrary shell execution
- do not execute learner Python on Next.js host
- use a dedicated sandbox later
