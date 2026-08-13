# Northstar Financial — Continuous Case Study

## Purpose

Northstar Financial is the primary fictional customer used throughout FDE Learning Lab.

It allows a learner to encounter one evolving enterprise context instead of disconnected toy exercises.

All data is synthetic.

## Company

**Northstar Financial**

Industry: Financial Services

Employees: ~5,000

Customer-facing support team: ~450

Operating characteristics:
- regulated
- mixed legacy/cloud environment
- centralized identity provider
- CRM
- ticketing/support platform
- enterprise document repositories
- data warehouse
- internal customer/account APIs
- API gateway
- audit requirements

## Starting Request

Executive sponsor:

> "We want an AI agent that can automate customer service."

The learner must not immediately choose an LLM architecture.

## Progressive Reveal

### Scenario 1 — The Vague Request

Symptoms:
- support resolution is slow
- executives request "an AI agent"
- no baseline has been established

Learning goals:
- discovery
- workflow mapping
- success criteria

### Scenario 2 — Permission-Sensitive Knowledge

Documents include:
- public product procedures
- operations procedures
- manager-only policies
- compliance documents

Problem:
naive RAG may leak restricted content.

Learning goals:
- identity propagation
- permission-aware retrieval
- security

### Scenario 3 — Correct Model, Stale Data

Customer account data is synchronized from CRM every 24 hours.

The assistant returns yesterday's balance.

Learning goals:
- data freshness
- source of truth
- debugging beyond prompts/models

### Scenario 4 — Risky Agent Action

Agent has a `refund_customer` tool.

It attempts a high-value refund without review.

Learning goals:
- tool authorization
- human approval
- autonomy boundaries
- audit

### Scenario 5 — Retrieval Looks Good in Demo, Fails in Production

Different terminology is used by support staff than in formal policy documents.

Learning goals:
- evaluation dataset
- hybrid retrieval
- query rewriting
- reranking

### Scenario 6 — API Rate Limits

CRM API is rate limited.

Load rises rapidly during peak support hours.

Learning goals:
- caching
- queues
- backoff
- graceful degradation
- architecture constraints

### Scenario 7 — User Trust Is Low

Responses are technically correct but staff do not trust them.

Learning goals:
- citations
- human workflow
- UX
- adoption
- feedback

### Scenario 8 — Model Cost Escalates

Long prompts and expensive model use create an unsustainable cost/task.

Learning goals:
- token economics
- routing
- caching
- context optimization
- cost per successful task

### Scenario 9 — Production Failure

A downstream service outage breaks a critical tool.

Learning goals:
- observability
- failure isolation
- fallback
- incident response

### Scenario 10 — Executive ROI Review

CIO asks:

> "What business result did this actually create?"

Learning goals:
- baseline
- automation
- time saved
- cost
- adoption
- ROI

## Fictional Systems

- Northstar SSO
- Atlas CRM
- Compass Support
- Polaris Knowledge
- Ledger Account API
- Beacon Data Warehouse
- Northstar API Gateway

## Suggested Synthetic Dataset

`content/datasets/northstar/`

- `customers.json` — 100 synthetic customers
- `accounts.json` — 150 synthetic accounts
- `tickets.json` — 100 synthetic support tickets
- `transactions.json` — 200 synthetic transactions
- `employees.json` — 50 synthetic employees
- `roles.json`
- `policies/*.md` — 30+ synthetic documents
- `api-rate-limits.json`
- `sample-logs/*.log`

Never use real identities or real financial data.
