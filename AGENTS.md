# AGENTS.md

## Mission

Build the FDE Learning Lab defined in `docs/SPEC.md`.

The application teaches experienced Software Engineers how to become Forward Deployed Engineers by combining structured lessons, enterprise scenarios, interactive experiments, labs, debugging exercises, architecture challenges, and a continuous fictional customer engagement.

## Source-of-truth hierarchy

When requirements conflict, follow this order:

1. `docs/SPEC.md`
2. `docs/MVP_ACCEPTANCE_CRITERIA.md`
3. `docs/IMPLEMENTATION_PLAN.md`
4. `docs/ARCHITECTURE.md`
5. `docs/CONTENT_MODEL.md`
6. Existing code and comments

Do not silently invent product behavior when the specifications already address it.

## Execution rules

Work one milestone at a time.

For each milestone:

1. Read the milestone and relevant specs.
2. Inspect existing repository state.
3. State the intended implementation scope.
4. Implement only that milestone.
5. Add/update tests.
6. Run formatting/lint.
7. Run TypeScript typecheck.
8. Run unit tests.
9. Run applicable end-to-end tests.
10. Update `IMPLEMENTATION_STATUS.md`.
11. Stop.

Do not automatically proceed to the next milestone.

## Engineering principles

- TypeScript strict mode.
- Server Components by default.
- Client Components only where browser interactivity is needed.
- Keep content outside React component source.
- Never hard-code course lessons into route components.
- Validate content and API payloads with Zod.
- Keep page components thin.
- Put domain logic into `lib/`.
- Experiments must be reusable and registry-driven.
- Practice questions must be data-driven.
- User progress must be persistable.
- No secrets in client code.
- All AI-provider calls must go through server-side abstractions.
- Development must work with `AI_MODE=mock`.
- No arbitrary shell execution from learner input.
- Prefer simple implementations over premature microservices.
- Accessibility is part of Definition of Done.

## UI principles

The app should feel like developer documentation + engineering lab + professional SaaS.

Avoid:
- childish gamification
- excessive animation
- generic LMS visual patterns
- huge cards for every item
- unnecessary gradients

Prefer:
- strong typography
- generous content spacing
- orange accent
- subtle progress indicators
- diagrams and code
- high information density without clutter
- dark mode support

## Product principle

Never teach technologies in isolation.

Every concept should answer an FDE/customer problem.

Examples:

Bad:
"What is RAG?"

Better:
"The customer has 500,000 private enterprise documents. How can employees query them without bypassing access control?"

Bad:
"What is MCP?"

Better:
"The customer agent needs controlled access to five enterprise systems. How should those capabilities be exposed?"

## Commit discipline

Create logical commits when git is configured. Do not combine unrelated milestones.

Suggested messages:

- `feat: bootstrap learning lab shell`
- `feat: add mdx content engine`
- `feat: add lesson progress tracking`
- `feat: add scenario practice engine`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
