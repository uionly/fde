# Content Model

All content should be validated with Zod.

## Track

Suggested YAML/JSON:

```yaml
id: fde-foundations
slug: fde-foundations
title: FDE Foundations
description: Understand the role, operating model and mindset of a Forward Deployed Engineer.
order: 1
status: published
skills:
  - Discovery
  - Customer Delivery
```

## Lesson Frontmatter

```yaml
id: foundations-what-is-fde
slug: what-is-fde
title: What Is Forward Deployed Engineering?
track: fde-foundations
module: foundations
order: 1
difficulty: beginner
durationMinutes: 10
status: published
prerequisites: []
skills:
  - Customer Delivery
objectives:
  - Explain FDE end-to-end ownership
  - Distinguish FDE from traditional SDE work
experiments: []
practice:
  - fde-foundation-001
```

## Question

```json
{
  "id": "fde-data-001",
  "type": "single_choice",
  "category": "data",
  "difficulty": "intermediate",
  "skills": ["Data"],
  "scenario": "The assistant returns balances that are correct for yesterday but not today.",
  "prompt": "What should the FDE investigate first?",
  "choices": [
    {"id": "a", "text": "Use a larger model", "rationale": "Model capacity does not fix stale source data."},
    {"id": "b", "text": "Increase top-k", "rationale": "Retrieval depth does not address system-of-record freshness."},
    {"id": "c", "text": "Inspect source-data freshness", "rationale": "The symptom strongly indicates a data synchronization issue."},
    {"id": "d", "text": "Rewrite the system prompt", "rationale": "Prompt changes cannot make stale data current."}
  ],
  "correct": ["c"],
  "explanation": "Diagnose the data path before changing the model.",
  "relatedLesson": "data-freshness",
  "principle": "Debug the full system, not only the model."
}
```

## Lab

```yaml
id: discovery-workshop
slug: discovery-workshop
title: Customer Discovery Workshop
description: Turn a vague AI request into a measurable problem definition.
difficulty: beginner
estimatedMinutes: 45
skills:
  - Discovery
steps:
  - id: understand-request
    title: Read the customer request
    type: content
  - id: stakeholders
    title: Identify stakeholders
    type: multi_input
  - id: questions
    title: Draft discovery questions
    type: text
  - id: problem
    title: Write the problem statement
    type: text
```

## Experiment

```json
{
  "id": "retrieval-playground",
  "type": "retrieval",
  "title": "Retrieval Playground",
  "description": "Compare keyword, vector and hybrid search.",
  "learningGoal": "Understand that retrieval strategy is a system design choice.",
  "config": {
    "strategies": ["keyword", "vector", "hybrid"],
    "enableTopK": true,
    "enableMetadataFilters": true
  }
}
```

## Glossary

```yaml
term: Forward Deployed Engineer
slug: forward-deployed-engineer
shortDefinition: An engineer who works directly with customers to take ambiguous problems through solution design, implementation and adoption.
relatedLessons:
  - foundations-what-is-fde
```

## Required Validation Behavior

- duplicate IDs fail build/test
- duplicate slugs within track fail
- missing track references fail
- missing practice references fail
- invalid difficulty/type fail
- unpublished content is excluded from public indexes
