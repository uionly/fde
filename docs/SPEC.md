# FDE Learning Lab — Product Specification

## 1. Product

**Name:** FDE Learning Lab

**Tagline:** Learn Forward Deployed Engineering by solving real enterprise problems.

## 2. Vision

Create an interactive learning platform that helps experienced Software Engineers transition into Forward Deployed Engineers.

The platform is not primarily a video LMS.

It combines:

- structured reading
- architecture explanations
- interactive diagrams
- scenario decisions
- configurable technical experiments
- practice questions
- debugging challenges
- guided labs
- enterprise case studies
- capstone engagement
- progress and skill tracking

The learner should repeatedly operate through the **10D FDE Framework**:

1. Discover
2. Define
3. De-risk
4. Design
5. Demonstrate
6. Develop
7. Evaluate
8. Deploy
9. Drive Adoption
10. Distill

## 3. Primary Persona

Experienced Software Engineer:

- 1–8 years development experience
- understands at least one programming language
- understands APIs, Git and databases
- basic cloud familiarity
- limited end-to-end customer ownership
- interested in FDE, FDSE, AI Engineering, Solutions Engineering, Architecture or Technical Consulting

The platform must not teach beginner programming.

## 4. Product Goals

Learners should be able to:

- understand FDE responsibilities
- conduct customer discovery
- transform ambiguous requests into problems/outcomes
- map workflows
- define technical and business success
- scope and de-risk solutions
- design enterprise architecture
- work rapidly in unfamiliar systems
- use AI-native software engineering workflows
- understand LLM application architecture
- design evaluation strategies
- design and experiment with RAG
- design tool-using agents
- understand MCP
- reason about enterprise data and integration
- apply identity/security principles
- debug customer systems
- reason about observability, reliability and cost
- drive adoption
- calculate business impact
- complete a realistic forward-deployed engagement

## 5. V1 Non-Goals

Do not initially build:

- video hosting
- course marketplace
- payment system
- live classrooms
- full cloud browser IDE
- native mobile apps
- community forum
- public leaderboards
- real enterprise integrations
- Kubernetes sandbox
- enterprise team management
- certificates

## 6. Learning Modes

### Learn
Structured lessons containing text, code, diagrams, examples and knowledge checks.

### Explore
Interactive visual/technical experiments.

### Practice
Scenario-based questions, architecture decisions, tool-selection challenges and debugging exercises.

### Build
Longer guided labs and capstone phases.

## 7. Main Navigation

- Home
- Learn
- Labs
- Practice
- Case Studies
- Capstone
- Progress
- Resources

Utility:
- Search
- Theme toggle
- Start fresh within AI Labs

## 8. Progress Workspace

The device-local progress workspace shows:

### Continue Learning
Current lesson and track progress.

### Skill Snapshot
Discovery, Architecture, AI Engineering, Data, Security, Production, Delivery, Business Thinking.

### Current Challenge
Recommended scenario/debugging exercise.

### Current Lab
Progress through active lab.

### Recommended Next
Simple prerequisite/progress-based recommendations.

## 9. Curriculum Tracks

### Track 1 — FDE Foundations
- What Is Forward Deployed Engineering?
- SDE vs FDSWE vs FDE
- FDE vs Solutions Engineer
- AI-Native FDE
- End-to-End Ownership
- 10D Framework
- FDE Mindset
- Outcomes vs Features

### Track 2 — Discovery & Problem Framing
- Customer Discovery
- Stakeholder Mapping
- Business Workflows
- Technical Discovery
- Data Discovery
- Security Discovery
- Constraints
- Unknowns
- Problem Statements
- Solution Hypotheses
- Success Criteria
- Business KPIs

### Track 3 — Solution Architecture
- Current State
- Target State
- Context Diagrams
- Data Flow
- Sequence Diagrams
- Trust Boundaries
- Trade-Offs
- Legacy Integration
- Architecture De-Risking
- Build vs Buy vs Integrate
- Prototype vs Production

### Track 4 — AI-Native Engineering
- Coding Agents
- Unknown Repositories
- AI Planning
- AI-Assisted Implementation
- Testing
- Debugging
- Refactoring
- Verification
- AI Coding Security
- Engineering Velocity

### Track 5 — LLM Engineering
- Application Architecture
- Tokens
- Context
- Instructions
- Structured Output
- Tool Calling
- Model Selection
- Reasoning Models
- Hallucination
- Context Engineering

### Track 6 — AI Evaluations
- AI Testing
- Evaluation-Driven Development
- Golden Datasets
- Code Evaluation
- Human Evaluation
- LLM-as-Judge
- Rubrics
- Pairwise Evaluation
- Regression
- Continuous Evaluation

### Track 7 — Enterprise RAG
- RAG Architecture
- Ingestion
- Parsing
- Chunking
- Embeddings
- Vector Search
- Keyword Search
- Hybrid Retrieval
- Metadata
- Reranking
- Citations
- Permission-Aware Retrieval
- Evaluation
- Agentic Retrieval

### Track 8 — Agents & Tools
- Workflow vs Agent
- Agent Loop
- Tools
- State
- Memory
- Planning
- Recovery
- Human Approval
- Multi-Agent Design
- Agent Evaluation

### Track 9 — MCP & Enterprise Integration
- Enterprise Tool Integration
- MCP Fundamentals
- Clients
- Servers
- Tools
- Resources
- Authentication
- Authorization
- Remote MCP
- Security

### Track 10 — Data Engineering for FDEs
- Customer Data Discovery
- Structured vs Unstructured
- Schemas
- Data Contracts
- ETL/ELT
- Batch vs Streaming
- Data Quality
- Freshness
- Lineage
- Governance

### Track 11 — Enterprise AI Security
- Authentication
- Authorization
- RBAC
- ABAC
- Least Privilege
- Prompt Injection
- Indirect Prompt Injection
- Exfiltration
- Tool Abuse
- Human Approval
- Auditability
- Threat Modeling

### Track 12 — Production & Observability
- Production Readiness
- Logs
- Metrics
- Traces
- AI Traces
- Tokens
- Cost
- Latency
- Reliability
- Fallbacks
- Incident Response

### Track 13 — Customer Delivery
- Customer Communication
- Workshops
- Architecture Reviews
- Technical Demos
- Risk Communication
- Scope
- RAID
- Adoption
- Training
- Handover

### Track 14 — Business Impact
- Baselines
- Adoption Metrics
- Automation
- Human Intervention
- Productivity
- Cost Reduction
- Cost per Task
- ROI
- Executive Communication

## 10. Lesson Page

Route:

`/learn/[trackSlug]/[lessonSlug]`

Desktop structure:

- breadcrumb
- track/module title
- lesson title
- duration/difficulty
- main reading column (~720–780px)
- right table-of-contents/module sidebar
- previous/next navigation

Supported lesson blocks:

- heading
- paragraph
- bullet list
- code
- image
- Mermaid diagram
- comparison
- decision table
- callout
- FDE Principle
- customer scenario
- knowledge check
- interactive experiment
- related resource

Bottom actions:

- Mark Complete
- Practice This Topic
- Next Lesson

## 11. FDE Principle Component

Fields:

- title
- body
- variant: `principle | warning | insight`

Example:

**FDE Principle — Validate the problem before optimizing the solution.**

## 12. Customer Scenario Component

Scenario:
"The customer asks for an AI chatbot."

Question:
"What should you do first?"

Options:
A. Select model
B. Design RAG
C. Understand why the current workflow is failing
D. Build prototype

Correct: C

After selection show:
- correct/incorrect
- explanation
- why alternatives are weaker
- linked lesson/principle

Persist the attempt on this device when browser storage is available.

## 13. Interactive Experiment Framework

Experiments must be reusable components configured from data.

Every experiment supports where applicable:

- title
- description
- input controls
- run
- output
- explanation
- reset
- optional challenge
- event tracking

Registry-driven rendering.

## 14. MVP Experiments

### Chunking Playground
Inputs:
- source text
- chunk size
- overlap
- split strategy

Outputs:
- resulting chunks
- chunk count
- average size
- overlap visualization

### Retrieval Playground
Built-in enterprise corpus.

Controls:
- query
- keyword/vector/hybrid
- top K
- metadata filtering

Outputs:
- rank
- document
- score
- passage

V1 may use deterministic/local search rather than external embeddings.

### Agent Tool Selection
Scenario + list of enterprise tools.
Learner chooses tool sequence.
Provide scoring/explanation.

### Prompt Injection Simulator
System policy + retrieved document + user query.
Learner chooses response strategy.
Show security consequences.

### AI Cost Calculator
Inputs:
- requests/month
- input tokens
- output tokens
- input/output price
- retry rate
- cache hit rate

Outputs:
- token volume
- monthly model cost
- cost/request
- cost/successful request

## 15. Practice Engine

Route: `/practice`

Categories:
- Discovery
- Architecture
- LLM
- Evaluations
- RAG
- Agents
- Data
- Security
- Debugging
- Delivery
- Business

Question types:
- single choice
- multiple choice
- ranking
- architecture choice
- tool selection
- root cause
- short answer (manual/self-check in MVP)
- scenario decision

Difficulty:
- beginner
- intermediate
- advanced

Feedback:
- result
- explanation
- why alternatives are wrong
- related lesson
- FDE principle
- recommended next practice

## 16. Debugging Challenges

Challenge provides:
- customer ticket
- architecture
- logs
- metrics
- configuration
- API responses
- sample data

Learner opens evidence panels and chooses:
- root cause
- remediation

Example:
Login succeeds, agent works, CRM call returns 403.
Evidence reveals missing role claim.

## 17. Architecture Challenges

Use React Flow.

Available node types:
- User
- Web App
- API
- LLM
- Agent
- Database
- Search
- Vector Store
- Identity Provider
- Queue
- SaaS
- Object Storage
- MCP Server
- Human Approval

Architectures serialize to JSON.

Evaluation should be constraint/rule based, not exact-layout matching.

Example required constraints for a bank knowledge assistant:
- identity integration
- permission-aware retrieval
- search/retrieval layer
- model layer

Penalties:
- missing access-control propagation
- direct unrestricted document access
- unsafe direct database exposure

## 18. Guided Labs

Initial labs:

1. Customer Discovery Workshop
2. Enterprise RAG Architecture
3. AI Agent Design

Future:
- Build RAG Pipeline
- MCP Server
- Evaluation Suite
- Threat Model
- Production Debugging

Every lab:
- title
- scenario
- goals
- ordered steps
- explanation
- task
- learner state/input
- validation
- progressive hint
- solution/reveal
- completion status

## 19. Coding Exercises

Do not build a full browser IDE in V1.

Use Monaco for:
- Python snippets
- JSON
- prompt configuration
- tool schemas

No arbitrary host command execution.

A separate sandbox/execution service may be introduced later.

## 20. Case Studies

### Northstar Financial
Primary continuous storyline.

### Apex Retail
Support, inventory, order automation.

### Horizon Insurance
Claims, policy retrieval, review.

### Vertex SaaS
Engineering support, incident triage, onboarding.

## 21. Northstar Continuous Story

Northstar Financial:
- regulated financial-services company
- ~5,000 employees
- identity provider
- CRM
- support system
- knowledge repositories
- legacy/internal APIs
- mixed cloud and legacy systems

Initial request:

"Build an AI customer-service agent."

Reveal issues progressively:

1. requirements unclear
2. permission-sensitive documents
3. stale CRM data
4. API rate limits
5. risky agent actions
6. poor retrieval
7. low user trust
8. rising model cost
9. production failures
10. executives demand ROI

## 22. Capstone

Route: `/capstone`

**Northstar AI Transformation**

Phases:
1. Discovery
2. Problem Definition
3. Architecture
4. Prototype
5. Retrieval
6. Tools
7. Agent
8. Security
9. Evaluation
10. Production
11. Adoption
12. ROI

Persist answers and progress.

Each phase is an editable field artifact with repository-authored structured decisions, required written reasoning, transparent four-dimension scoring, hints, consequences, and an expert comparison. Drafts, the active phase, deterministic results, and optional coach reviews resume on the current browser.

Completion and sequential unlocking are deterministic. Required selection cardinality and reasoning presence control whether a learner may continue; authored consequences produce customer-alignment, architecture, safety, and delivery-readiness evidence. Re-evaluate saved inputs against current authored rules before using them for completion or skill evidence.

Optional FDE Coach review may critique and score the written reasoning. It is advisory and must never complete a phase, block a learner, unlock later work, or contribute progress/skill evidence. The app remains fully usable in `AI_MODE=mock`.

Future: export FDE Engagement Report PDF.

## 23. AI Tutor (Post-MVP / Optional)

Name: **FDE Coach**

Context:
- current lesson
- learner progress
- active lab/capstone
- course framework

Capabilities:
- explain
- give example
- give progressive hint
- challenge reasoning
- interview learner
- review architecture

Tutor policy:
1. ask for learner reasoning where useful
2. give hints before answers
3. teach underlying principle
4. reveal solution only after request/appropriate progression

## 24. Content Storage

V1 content lives in repository as MDX/JSON/YAML.

Suggested:

```
content/
  tracks/
  lessons/
  labs/
  questions/
  challenges/
  case-studies/
  glossary/
  datasets/
```

Content is version controlled.

Do not introduce CMS for MVP.

## 25. Visitor Progress

The current showcase has no identity or account system. Persist on this browser:

- lesson completion
- practice attempts and scores
- lab step progress and working notes
- Field Arcade XP, completions, streaks, and personal bests
- capstone decisions, reasoning, phase completion, and optional coach reviews

Derive skill scores and recommendations from saved practice, completed-lab evidence, and verified deterministic capstone results. Cross-device sync, time tracking, tamper-resistant certification, and account history are future capabilities.

Lesson opening alone must not increase a skill score.

## 26. Skills

Initial dimensions:

- Discovery
- Architecture
- Software Engineering
- AI Engineering
- Data
- Security
- Production
- Customer Delivery
- Business Thinking

Scores: 0–100.

Derived from weighted practice/labs/capstone evidence.

## 27. Progress Page

Route: `/progress`

Show:
- overall curriculum progress
- track progress
- skill chart
- strengths
- weak areas
- recent activity
- recommended next modules

## 28. Search

Global search across:
- lessons
- labs
- glossary
- practice topics
- resources

V1: simple indexed textual search.
Later: semantic.

## 29. Glossary

Route: `/resources/glossary`

Each entry:
- term
- definition
- related lessons
- related experiments

## 30. Resources

Templates:
- Discovery Canvas
- Stakeholder Map
- Workflow Template
- Problem Statement
- Solution Brief
- Assumption Log
- Risk Register
- RAID Log
- ADR
- RAG Checklist
- Agent Canvas
- MCP Checklist
- Threat Model
- Eval Dataset
- Eval Scorecard
- Production Checklist
- Cost Calculator
- ROI Calculator
- Demo Checklist
- Handover Template

V1 may render/download Markdown/CSV templates.

## 31. Visitor Mode

The AI Labs showcase is intentionally account-free. Do not expose a sign-in, demo identity, or authentication gate.

All public learning surfaces are available immediately. Lesson completion, practice evidence, guided-lab state, skill recommendations, and Field Arcade progress are stored in versioned, Zod-validated browser storage. They do not synchronize across browsers or devices.

The **Start fresh** action clears only app-owned visitor progress keys and preserves theme and unrelated browser settings.

## 32. Technical Stack

Frontend/application:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Interactive:
- React Flow
- Monaco
- Recharts
- Mermaid

Backend:
- Next.js Server Components and route handlers where server behavior is required

Persistence:
- versioned browser local storage for visitor learning state

Validation:
- Zod

Testing:
- Vitest
- Playwright

## 33. AI Provider Abstraction

Optional post-MVP experiences may use AI through a server-side provider boundary.

Use interface such as:

```ts
export interface AIProvider {
  generate(request: GenerateRequest): Promise<GenerateResponse>
}
```

Implement:
- `MockAIProvider` as the credential-free default
- optional Anthropic structured coaching for the capstone

Environment:
- `AI_MODE=mock`
- `AI_MODE=live`

The app must remain usable without AI API credentials.

Client requests may contain only bounded learner notes and authored IDs. Resolve customer context, labels, rubric, and deterministic score on the server. Validate structured model output before returning it. Live coaching must use no tools, keep secrets server-side, expose safe typed failures, apply rate limiting, and emit metadata-only request/success/failure audit records without learner text or network identifiers.

## 34. Data Model

Core entities:

### User
- id
- email
- name
- image
- createdAt

### LessonProgress
- id
- userId
- lessonId
- status
- startedAt
- completedAt
- timeSpentSeconds

### PracticeAttempt
- id
- userId
- questionId
- answerJson
- correct
- score
- createdAt

### LabProgress
- id
- userId
- labId
- currentStep
- stateJson
- completed
- updatedAt

### CapstoneProgress
- id
- userId
- phaseId
- responseJson
- score
- feedback
- updatedAt

### SkillScore
- userId
- skill
- score
- updatedAt

## 35. Persistence Surface

Current visitor-state contracts are typed browser APIs for lesson completion, practice attempts, lab progress, and Field Arcade profiles. Content loading and scoring stay in reusable domain modules. Resource downloads may use route handlers.

If durable accounts are added later, define authenticated server contracts as a separate product milestone rather than reviving a demo identity.

## 36. Experiment Registry

Expected design:

```ts
export const experimentRegistry = {
  chunking: ChunkingPlayground,
  retrieval: RetrievalPlayground,
  toolSelection: ToolSelectionSimulator,
  injection: PromptInjectionSimulator,
  cost: CostCalculator,
}
```

Content references experiment IDs/types rather than importing experiment components directly.

## 37. Visual Design

Character:
- developer documentation
- engineering laboratory
- professional SaaS

Color:
- neutral light/dark foundation
- TO THE NEW magenta primary and cyan accent
- branded emerald, rose, and amber status colors

Typography:
- Montserrat for interface, headings, and prose
- monospace for code, logs, and evidence panels

Avoid:
- visual noise
- excessive gradients
- cartoonish badges
- gamified coins
- generic corporate hero imagery

Use responsive layout, but optimize labs/architecture exercises for desktop.

## 38. Analytics

Suggested provider: PostHog.

Events:
- lesson_viewed
- lesson_completed
- experiment_started
- experiment_completed
- practice_answered
- practice_correct
- lab_started
- lab_step_completed
- lab_completed
- capstone_phase_completed

## 39. Accessibility

Minimum:
- semantic HTML
- keyboard navigation
- visible focus
- sufficient contrast
- no color-only state
- ARIA where needed
- accessible interactive diagrams where practical

## 40. Security

- validate all inputs
- keep secrets server-side
- rate limit write/AI endpoints
- sanitize rendered content
- no arbitrary shell execution
- no learner code on main server process
- audit live AI requests
- cap input/prompt sizes
- clear, narrowly scoped browser-state reset behavior

## 41. MVP Content Scope

Do not author all tracks before product validation.

Initial content:
- FDE Foundations
- Discovery
- Architecture
- LLM Fundamentals
- Evaluations
- RAG
- Agents
- Security

Target 40–50 lessons.

Initial practice target: 150 scenario-heavy questions.

## 42. MVP Completion Definition

Users can:

1. browse the landing page
2. browse learning tracks
3. read validated MDX lessons
4. persist lesson progress on the current browser
5. use at least 5 interactive experiments
6. answer scenario questions
7. receive useful explanations
8. complete at least 3 guided labs
9. view the skill/progress dashboard
10. start the Northstar case study
11. leave and resume later on the same browser

## 43. Landing Page

Hero:

**Become a Forward Deployed Engineer**

Supporting copy:

Learn how to take ambiguous enterprise problems from discovery to architecture, AI implementation, production deployment, adoption and measurable business impact.

CTA:
**Start Learning**

Secondary:
**Explore the FDE Roadmap**

Sections:
- What is FDE?
- Skills roadmap
- Interactive labs
- Enterprise scenarios
- 10D Framework
- Capstone
- CTA

## 44. Core Product Principle

The product must never feel like:

"Read documentation and answer quizzes."

It should feel like:

**"You have been deployed to a customer. Solve the problem."**

Every major concept should connect to a decision, experiment, scenario, failure or measurable customer outcome.
