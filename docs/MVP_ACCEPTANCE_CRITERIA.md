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

## P0 — Visitor Progress

- [ ] Anonymous users can read public lessons.
- [ ] User can mark lesson complete.
- [ ] Lesson, practice, lab, and Arcade progress persists across reloads on the same browser.
- [ ] Progress page shows track completion.
- [ ] No demo identity, sign-in option, or authentication gate is exposed.
- [ ] Start fresh clears only app-owned visitor progress and preserves theme/unrelated browser settings.

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
- [ ] resumes after leaving and returning on the same browser

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
- [ ] browser-storage failure states are communicated accessibly

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
4. mark it complete
5. answer a practice scenario
6. run one experiment
7. start a guided lab
8. leave and return
9. resume the lab
10. visit Northstar case study
11. view progress
12. start fresh and verify a clean visitor state
