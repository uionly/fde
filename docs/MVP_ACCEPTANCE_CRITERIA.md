# MVP Acceptance Criteria

The MVP is releasable only when all P0 items pass.

> This file is the normative requirement checklist. Implementation and validation evidence is maintained in [`IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md); the boxes below are not used as a second status tracker.

## P0 — Core Learning

- [ ] Landing page explains the product clearly.
- [ ] `/learn` displays tracks from repository content.
- [ ] Track pages list lessons from content metadata.
- [ ] Lesson pages render MDX.
- [ ] Lesson content supports FDE Principle and Customer Scenario blocks.
- [ ] Previous/Next navigation works.
- [ ] At least 40 lessons can be added without route-code changes.

## P0 — Authentication & Progress

- [ ] Anonymous users can read public lessons.
- [ ] User can authenticate.
- [ ] User can mark lesson complete.
- [ ] Progress persists across sessions.
- [ ] Dashboard can resume latest lesson.
- [ ] Progress page shows track completion.

## P0 — Practice

- [ ] At least single- and multiple-choice questions work.
- [ ] Questions are validated from content files.
- [ ] Attempts persist.
- [ ] Explanation is shown after submission.
- [ ] Related lesson can be linked.
- [ ] Category/difficulty filters work.

## P0 — Experiments

All five exist and are usable without live AI:

- [ ] Chunking Playground
- [ ] Retrieval Playground
- [ ] Agent Tool Selection
- [ ] Prompt Injection Simulator
- [ ] AI Cost Calculator

Each must:
- [ ] explain the learning goal
- [ ] allow reset
- [ ] have deterministic mock behavior
- [ ] work on desktop
- [ ] be keyboard usable where reasonable

## P0 — Labs

At least:

- [ ] Customer Discovery Workshop
- [ ] Enterprise RAG Architecture
- [ ] AI Agent Design

Each:
- [ ] has ordered steps
- [ ] stores progress
- [ ] supports hints
- [ ] supports solution reveal
- [ ] resumes after relogin

## P0 — Northstar

- [ ] Northstar company profile exists.
- [ ] At least 5 progressive problems exist.
- [ ] Northstar is referenced from multiple tracks.
- [ ] Synthetic datasets contain no real customer/person data.

## P0 — Engineering Quality

- [ ] TypeScript strict mode
- [ ] lint passes
- [ ] typecheck passes
- [ ] unit tests pass
- [ ] Playwright MVP smoke path passes
- [ ] no secrets in repo
- [ ] `.env.example` exists
- [ ] basic accessibility checked
- [ ] loading/error states exist for authenticated async flows

## P1 — Progress Intelligence

- [ ] Skill scores shown.
- [ ] Skill scores are based on evidence, not lesson views.
- [ ] Weak-area recommendations shown.

## P1 — Resources

- [ ] Glossary works.
- [ ] Search works.
- [ ] Template/resource library works.

## MVP Smoke Journey

A test learner can:

1. land on homepage
2. open a track
3. read a lesson
4. register/login
5. mark it complete
6. answer a practice scenario
7. run one experiment
8. start a guided lab
9. leave and return
10. resume the lab
11. visit Northstar case study
12. view progress
