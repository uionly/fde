# Production Deployment

## Runtime requirements

- Node.js `^20.19`, `^22.12`, or `>=24`
- A platform capable of running Next.js App Router server functions

## Required configuration

Set the supported AI mode in the deployment environment:

```text
AI_MODE=mock
```

`AI_MODE=mock` is the credential-free default. Games, playgrounds, capstone completion, phase unlocking, reports, and skill evidence remain deterministic and do not require a provider.

Optional live capstone coaching uses Anthropic through the server-only provider boundary:

```text
AI_MODE=live
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=<secret deployment value>
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Store `ANTHROPIC_API_KEY` in the hosting platform's secret manager. Never expose it as a `NEXT_PUBLIC_` value, bake it into an image, or commit it. A coaching request includes the fictional phase context, the visitor's selected decisions, and only the written notes they explicitly submit. The route does not log prompts, notes, selections, IP addresses, or keys.

The application is a visitor-only showcase with no authentication provider or server-side learner database. Lesson completion, practice evidence, Field Mission state, Field Arcade progress, and capstone state remain in versioned browser-local storage. They do not synchronize across browsers or devices.

## Pre-deployment validation

```bash
npm ci
npm run validate:content
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

By default, Playwright starts a development server at `http://127.0.0.1:3100`. To validate a running release candidate instead, point the same suite at its origin:

```bash
PLAYWRIGHT_BASE_URL=https://release-candidate.example.com npm run test:e2e
```

## Release procedure

Run the application behind HTTPS and start the validated production build with `npm run start`.

## Operational checks

- Verify lesson completion, practice evidence, Field Mission resume, and Field Arcade progress survive a page reload in a supported browser.
- Verify capstone drafts, active phase, deterministic results, and optional coaching survive a reload, and confirm AI scores never alter completion or skill evidence.
- Exercise the integrated learner journey against the deployed release candidate.
- Confirm **Start fresh** clears every app-owned visitor learning key while preserving theme and unrelated browser storage.
- Monitor server errors, asset delivery, and route latency.
- Remember that visitor progress is intentionally local to each browser and cannot be restored from the deployment environment.

## Live coaching operations

- The built-in limiter is best-effort, in-memory, and approximately 10 requests per minute per apparent address. Replace it with a trusted-proxy-aware shared limiter before running multiple instances.
- Configure Anthropic spend/rate limits and monitor token usage. The route returns model and token metadata to the visitor and emits metadata-only server audit records for live request, success, and failure events.
- Keep the default 30-second provider timeout and zero automatic retries unless an explicit retry/cost policy is added.
- Validate 429, timeout, refusal, truncation, malformed-response, and missing-secret paths in the release environment.
- The feature is for fictional training data. Keep the in-product warning against real customer or confidential information.
