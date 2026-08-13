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
  |-- Resource Route Handlers
  |-- Content loaders
  |-- Practice/scoring domain
  |-- Progress domain
  |-- Experiment registry
  |
  +--> Versioned browser-local visitor state
  |
  +--> Repository MDX/JSON content
  |
  +--> Mock AI Provider (default)
  |
  +--> Anthropic AI Provider (optional, server-only)
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

### `lib/visitor`
Zod-validated visitor progress storage, writes, and subscriptions.

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

The capstone uses a provider-neutral structured-generation interface:

```ts
interface AIProvider {
  readonly mode: "mock" | "live"
  readonly name: "mock" | "anthropic"
  generateStructured<T>(request: {
    systemPrompt: string
    userPrompt: string
    outputSchema: ZodType<T>
    mockOutput: T
    maxTokens: number
  }): Promise<{ output: T; model: string; usage: TokenUsage }>
}
```

The route accepts only phase ID, option IDs, and bounded learner notes. It resolves customer context, labels, and rubrics from repository content on the server; validates request and response with Zod; supplies no tools; and returns safe typed failures. Provider SDK objects and secrets never cross into Client Components.

Capstone completion is independent of AI. Authored cardinality and reasoning-presence rules produce the completion gate and deterministic four-dimension score. AI reviews can critique reasoning and show advisory scores, but cannot complete, block, unlock, or contribute skill evidence.

## Visitor State

The showcase has no authentication provider or learner account. Public lessons, practice, experiments, games, labs, cases, and progress are immediately usable.

Lesson completion/practice/Field Mission state, Field Arcade profiles, and capstone work use separate versioned browser-local records. Same-tab custom events and browser storage events keep client views synchronized. Capstone score snapshots are never trusted directly: current authored rules re-evaluate saved selections and reasoning before completion, unlocking, reporting, or skill evidence. **Start fresh** removes only those app-owned records.

Keep course content in Git, not browser state.

## Security

- input validation at all trust boundaries
- no secrets to browser
- validate browser-state payloads before writes
- safe MDX
- rate limit sensitive endpoints
- no arbitrary shell execution
- do not execute learner Python on Next.js host
- use a dedicated sandbox later
