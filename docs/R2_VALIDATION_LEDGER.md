# R2 claim and validation ledger

## Product claims

| Claim | Evidence / check |
| --- | --- |
| Curriculum totals are 15 tracks, 60 lessons, 174 questions | Repository loaders and `validate:content`; explicit content tests |
| Six new dedicated subject areas have deeper lessons | `tests/unit/reference-quality.test.ts`; `docs/CURRICULUM_COVERAGE.md` |
| Every new lesson links to practice, an applied artifact, and source reading | Content-graph validation, local-link tests, browser rendering of all 12 new lessons |
| 24 templates cover all 20 SPEC §30 families | Reference-family test and browser download body checks |
| 38 glossary terms link to learning | Content graph and reference-quality tests |
| Lab flags alone cannot award skill evidence | `validateLab` re-evaluation in dashboard; unit and browser tests with forged/legacy completion |
| Graph scoring is independent of layout | Unit tests change all node positions while retaining connectivity |
| Disconnected guards and bypasses fail | Unit tests remove edges and add direct/indirect unsafe paths; browser bypass case |
| Alternative valid architectures can pass | Unit test routes source through optional queue; no exact-layout comparison |
| Malformed graph import preserves current work | Zod bounded graph schema and browser import test |
| Saved challenge work resumes and resets | Browser reload/reset journey and storage tests |
| `/operations` is absent | No route, rewrite, or inbound link in this checkout; HTTP 404 browser test. No existing route file was deleted because none existed. |

## Technical source review

The following primary references were opened during implementation. New lesson source links identify reading relevant to that lesson; original Northstar scenarios and recommended field artifacts are authored teaching examples, not statements attributed wholesale to a source.

- MCP architecture and HTTP authorization are pinned to specification revision **2025-11-25**. HTTP authorization and local STDIO credential handling are explicitly distinguished.
- OWASP Authorization Cheat Sheet supports the separation of authentication and authorization, least privilege, and server-side checks.
- AWS Builders Library on idempotent APIs supports reasoning about retries and ambiguous outcomes; the two ticket records and all timestamps are explicitly synthetic.
- OpenTelemetry signal and metric documentation supports logs/metrics/traces terminology and instrumentation discussion.
- Google SRE service-level objectives and incident response support the reliability and recovery vocabulary.
- JSON Schema object reference supports structural validation; the lesson explicitly distinguishes structural validation from business semantics.
- GitHub responsible-use documentation supports treating agent output as work requiring verification rather than assuming correctness.
- GOV.UK service measurement and benefits guidance supports defining outcomes, baselines, denominators, and benefit assumptions. ROI examples are elementary, authored calculations, not customer financial forecasts.
- Microsoft RAG overview, Anthropic agent-pattern discussion, Google Cloud evaluation overview, OpenLineage, and PostgreSQL logical-decoding documentation provide more specific reference links for glossary entries.

Numerical examples were checked: 2000 / 800 = 2.5 cost units per successful task; (12000 - 10000) / 10000 = 20% ROI over the same horizon. Zero denominators are explicitly undefined. No live model prices or claimed customer performance improvements were added.

Review dates denote this authored-content review. They do not assert that every statement in all 48 older lessons has undergone a new independent expert review. Existing lesson routes and content are preserved; runtime/content validation covers their structure and references.

## Remote reconciliation addendum — R3

The subsequent fetch discovered `/operations` in remote main (`98aa8ba`), which was not available in the local R2 checkout reviewed above. R3 merges that remote history and removes the mock dashboard, navigation, styling, data, loader, and tests. The merged application's `/operations` route is verified to return 404.
