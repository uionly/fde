# Field Arcade Implementation Plan

The Field Arcade adds short, no-typing enterprise AI simulations under the dedicated `/games` route. It extends the completed MVP without replacing technical experiments, quick practice, or guided labs.

## G1 — Game Platform — Complete

Deliverables:

- Zod-validated repository game content
- `/games` arcade index
- `/games/[gameSlug]` static game routes
- permanent compatibility redirects from `/labs/games` and `/labs/games/[gameSlug]`
- client renderer registry
- shared briefing, decision, simulation, scorecard, and debrief experience
- deterministic authored scenario rotation
- Quality, Safety, Cost Efficiency, and Latency Performance scoring
- versioned device profile with legacy migration, XP, streaks, scenario completion, personal bests, attempts, and mastery
- keyboard, touch, mobile, and reduced-motion support
- six quick missions with two variants each

Acceptance:

- A learner can complete a mission without typing, see system consequences, reload, and continue with the next deterministic variant.
- XP is awarded once per scenario and a replay can improve a personal best without duplicating the reward.

## G2 — Routing and Retrieval Simulations

Implement:

1. Model Router Rush using accessible card-to-lane assignment
2. Retrieval Rank Race using accessible reordering and a bounded context budget

Acceptance:

- Both games provide pointer/touch controls and named keyboard alternatives.
- Scoring is deterministic and independently measures quality, safety, cost efficiency, and latency performance.

## G3 — Security and Agent Simulations

Implement:

1. Prompt Injection Detective using selectable threat evidence
2. Agent Access Lockdown using permission, approval, scope, and transaction controls

Acceptance:

- Unsafe configurations cannot receive a production-ready result.
- Learners can identify and correct every violated boundary without typing.

## G4 — Progression and Recommendations

Deliverables:

- daily full-simulation mission
- skill mastery integration
- recommended-next-game logic
- personal-best comparisons
- replay variants and professional achievement titles
- dashboard and progress-page integration

Acceptance:

- Game results affect recommendations only through completed evidence.
- Replays never duplicate scenario XP.

## G5 — Arcade Expansion

Implement one at a time:

1. Architecture Circuit
2. Incident Commander
3. Eval Set Draft
4. Discovery Signal Sorter
5. SLA Control Room

Acceptance:

- Every game connects an AI concept to a customer deployment decision.
- Every primary interaction works with pointer, touch, and keyboard and contains no required text entry.
