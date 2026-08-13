# Production Deployment

## Runtime requirements

- Node.js `^20.19`, `^22.12`, or `>=24`
- PostgreSQL 15 or newer
- A platform capable of running Next.js App Router server functions

## Required configuration

Set these values in the deployment environment:

```text
DATABASE_URL=postgresql://...
AUTH_SECRET=<at least 32 random bytes>
AI_MODE=mock
ENABLE_DEV_AUTH=false
```

Generate a secret with `openssl rand -base64 32` or the deployment platform's secret manager.

Optionally set both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` to enable Google sign-in. Never enable the development identity on a public deployment.

`AI_MODE=mock` is the only currently implemented mode. The shipped games and playgrounds are deterministic and do not call a model provider.

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

Apply the checked-in migrations to the production database before directing traffic to the new application version:

```bash
npx prisma migrate deploy
npm run start
```

Run the application behind HTTPS. Configure the canonical Auth.js host for the deployment platform, use a pooled database connection where required, and retain migration logs.

## Operational checks

- Verify anonymous lesson access and authenticated lesson, practice, and Field Mission writes.
- Confirm Google callback URLs match the production host when enabled.
- Exercise the integrated learner journey against the deployed release candidate.
- Confirm `ENABLE_DEV_AUTH` is absent or `false`.
- Monitor server errors, database availability, authentication failures, and learner-write latency.
- Back up PostgreSQL learner state; curriculum and customer content remain version-controlled in the repository.
- Remember that Field Arcade progress is intentionally device-local and is not part of the PostgreSQL backup.
