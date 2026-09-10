# FDE curriculum coverage — R2

Reviewed 2026-09-11. The 14 subject areas in SPEC §9 now have dedicated tracks; the retained Enterprise AI Systems bridge makes 15 published tracks. A published track is not a claim of exhaustive expertise. This map distinguishes lessons and exercises from live deployment experience.

| Specification area | Published learning | Applied evidence |
| --- | --- | --- |
| FDE Foundations | FDE Foundations: role, ownership, ambiguity, communication, adoption | Customer discovery lab and foundation practice |
| Discovery & Problem Framing | Discovery and Problem Framing: workflows, constraints, stakeholders, success criteria | Discovery lab with authored acceptance checks; stakeholder/workflow/problem templates |
| Solution Architecture | Solution Architecture: current state, trust boundaries, contracts, trade-offs | Two connected-graph challenges with required paths and bypass checks; ADR and solution brief |
| AI-Native Engineering | New: repository reconnaissance and agent-assisted verification | CRM incident and duplicate-write incident; decision and verification practice |
| LLM Engineering | Existing specialist track: context, model choice, structured output, tool use | Existing experiments and practice; model-router simulation |
| AI Evaluations | Existing specialist track: representative datasets, rubrics, regression, release | Eval dataset and scorecard; existing practice and capstone evaluation phase |
| Enterprise RAG | Existing specialist track: ingestion, retrieval, permissions, grounding | Validated RAG lab; permission-aware graph challenge; chunking/retrieval experiments |
| Agents & Tools | Existing specialist track: bounded tools, planning, state, recovery | Validated agent lab; approval/policy graph challenge; agent canvas |
| MCP & Enterprise Integration | New: host/client/server roles, bounded capability contracts, remote authorization | Authorization incident and approved-action graph; MCP checklist |
| Data Engineering for FDEs | New: contract semantics, ETL/ELT trade-offs, batch/streaming, freshness, replay, deletion, lineage | Data-contract artifact and decision/verification questions; duplicate-write incident |
| Enterprise AI Security | Existing specialist track: identity, least privilege, threats, prompt injection | Authorization incident; graph bypass tests; security experiments and threat model |
| Production & Observability | New: logs/metrics/traces, customer-task signals, SLOs, incident recovery | Incident evidence, readiness checklist, incident runbook; existing capstone phases |
| Customer Delivery | New: workshops, reviews/demos, RAID, adoption, training and operational handover | Workshop agenda, demo checklist, handover exercise, practice |
| Business Impact | New: baseline/cohort/denominator, guardrails, capacity versus cash, unit cost and ROI sensitivity | Outcome scorecard, cost/ROI worksheets, decision/verification questions |

## What the evidence establishes

- 12 new MDX lessons contain explicit synthetic Northstar scenarios, field artifacts, two linked practice questions each, and source/review metadata. They add depth to six previously missing dedicated areas while keeping the 48 existing lessons.
- Two debugging challenges provide tickets, request paths, logs, configuration, API/data evidence, and metrics. Passing requires the authored cause, safe remediation, diagnostic evidence citations, and written reasoning presence.
- Two React Flow architecture challenges accept different layouts and an optional queue. Evaluation checks connectivity and that required guards occur on every relevant directed path, including bypass routes. Catalog components have explicit responsibilities.
- All 11 non-reading lab steps require an authored decision check and at least 80 characters of reasoning. Saved notes and legacy flags do not alone qualify as lab skill evidence. Notes survive migration; learners revisit unvalidated work.
- All 20 template families in SPEC §30 are represented; four additional field artifacts bring the library to 24. All 38 glossary entries and all resources link to existing lessons.

## Limits that remain explicit

Written reasoning is not semantically graded. Diagram checks assume the named components implement their stated responsibilities; they cannot verify deployed identity, policies, approvals, or idempotency. Challenges use synthetic evidence and no live customer systems. The code-oriented lessons teach verification workflows but do not introduce a code-execution sandbox or a Monaco exercise. Deep platform-specific implementation, live integration labs, and ongoing expert curriculum review remain future depth, not claims implied by the counts above.

Challenge drafts remain browser-local and have graph JSON export/import; whole-profile cross-device synchronization is not implemented. Challenge results appear separately in progress and do not inflate the existing skill scores.
