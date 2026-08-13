# Production Deployment

## Runtime requirements

- Node.js `^20.19`, `^22.12`, or `>=24`
- A platform capable of running Next.js App Router server functions

## Required configuration

Set the supported AI mode in the deployment environment:

```text
AI_MODE=mock
```

`AI_MODE=mock` is the only currently implemented mode. The shipped games and playgrounds are deterministic and do not call a model provider.

The application is a visitor-only showcase with no authentication provider or server-side learner database. Lesson completion, practice evidence, Field Mission state, and Field Arcade progress remain in versioned browser-local storage. They do not synchronize across browsers or devices.

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
- Exercise the integrated learner journey against the deployed release candidate.
- Confirm **Start fresh** clears every app-owned visitor learning key while preserving theme and unrelated browser storage.
- Monitor server errors, asset delivery, and route latency.
- Remember that visitor progress is intentionally local to each browser and cannot be restored from the deployment environment.
