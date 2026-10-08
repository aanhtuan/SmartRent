# SmartRent — AI-assisted end-to-end development roadmap

## Start here

Current state: Sprint 0 baseline merged; C6-01 backend foundation implemented locally and IN_REVIEW, with passing Maven build/tests and a backend CI definition. See [C6-01 evidence](ai-evidence/c6-01-backend-foundation.md). Remote CI and human review are pending; the full G1 gate has not passed. C6-02–16 remain TODO. Do not interpret this roadmap as permission to install, call providers, commit, push, merge or deploy.

Read [AGENTS.md](../AGENTS.md), [agent workflow](agent-workflow.md), [decision baseline](sprint-0-decisions.md), [readiness report](implementation-readiness.md), then the task in [Chapter 6 backlog](chapter-06-ai-programming/implementation-backlog.md). The stack and Modular Monolith architecture remain approved; new business defaults are working baseline until their named review gates pass.

## Delivery loop for every task

Specify -> Plan -> Implement -> Test -> Review -> Merge.

1. Specify observable AC, canonical FR/US, resource contracts, scope, authorization and current base SHA; preserve dirty work.
2. Plan the smallest independently reviewable increment, exact files/interfaces, tests and applicable skill references. A blocked business decision blocks only dependent tasks.
3. Implement on an authorized `codex/<task-slug>` branch, one writer per checkout. Domain modules contain API/application/domain/persistence responsibilities; no cross-module internal repositories or provider SDKs in domain.
4. Test normal, denied and failure behavior against the actual build. Use deterministic AI fakes; live checks are separate.
5. Review the actual diff for correctness, isolation, migration/transaction safety and unmet AC. Resolve findings and rerun affected checks. Model agreement is not proof; human review approves policy.
6. Merge only under explicit permission and configured repository protections. Record actual commands/results and remaining limitations.

For each iteration retain Context -> Prompt -> AI Output -> Human Review -> Refinement -> Final Result. Only record real events; see [evidence policy](ai-evidence/README.md).

## Sprint roadmap and gates

| Sprint / course chapter | Depends on | Deliverable | Exit gate |
|---|---|---|---|
| S0: baseline normalization / Chapters 3–5 | Existing documents and audit | Canonical IDs, aligned UX/API/UML/schema, WB register, task backlog, evidence policy | G0: no merge markers/broken references; remaining policy review gates explicit; foundation ready, domain not blanket approved. |
| S1: foundation / Chapter 6 | G0 + authorized scaffold/download scope | C6-01–05: backend/frontend skeleton, CI, Compose/Flyway identity, synthetic accounts, login/me | G1: pinned manifests, reproducible startup/build/tests, accepted JWT/CORS policy; no exposed credentials. |
| S2: rental resources / Chapter 6 | G1 + D02/D03/D05/D06 review | C6-06–07: Property/Room, tenant management and scoped UI | G2: owner isolation and pre-contract onboarding proven; date/occupancy/model accepted; migrations reviewed. |
| S3: contracts/billing / Chapter 6 | G2 + D07 review | C6-08–09: contracts, overlap protection, monthly billing/payment status | G3: concurrent overlap test and billing date/amount/terminal-state tests pass; historical access proven. |
| S4: maintenance/AI / Chapter 6 | G3 + D04/D09/D10 review | C6-10–13: manual request path, notifications, Gemini preview/confirm/reclassification | G4: manual journey works without provider; preview creates no request; confirm reauthorizes; no duplicate creation; AI/schema/egress/fallback checks pass. |
| S5: Assistant and release candidate / Chapters 7–9 | G4 | C6-14–16: authorized read-only Assistant, regression/refactoring, runbooks/demo | G5: affected E2E + integration + AI eval evidence; reviewed residual risks; local release candidate reproducible. |
| Publication / final demo | G5 + explicit external-action permission | Reviewed PR/release/deployment or local demo | Human authorizes push/merge/deploy; rollback and configured environment verified. No automatic production claim. |

Sprint numbers express dependency order, not calendar deadlines. Estimate after real implementation velocity and tool availability are known. Testing/review/docs run in every sprint; Chapters 7–9 consolidate them, rather than postponing them until S5.

## Dependency order

C6-01 -> C6-03 -> C6-04 -> C6-05 -> C6-06 -> C6-07 -> C6-08 -> C6-09 -> C6-10 -> C6-11 -> C6-12 -> C6-13 -> C6-14 -> C6-15 -> C6-16.

C6-02 frontend foundation depends only on G0 and approved tooling; C6-05 consumes it. Sequence is for task dependencies, not authorization for parallel agents. Integrate UI with each owning feature; do not defer all integration to the final sprint.

## Skills by task

| Work | Primary | Supplemental, only where relevant |
|---|---|---|
| Plan/task decomposition | Repository workflow; installed writing-plans principles | User scope overrides extra plan files, automatic commits and missing Superpowers dependencies. |
| Java API/domain/security | smartrent-backend | java-spring-boot framework references; generic examples do not override SmartRent contracts. |
| PostgreSQL/JPA/Flyway | smartrent-backend | supabase-postgres-best-practices before schema/query/migration changes; no Supabase Auth/service adoption. |
| React/Vite | smartrent-frontend | vercel-react-best-practices client React rules; no Next.js/RSC APIs. |
| Gemini integration/evaluation | smartrent-ai | Official task-specific Gemini Java/REST documentation before implementation; no automatic model/provider changes. |
| Tests/review/handoff | smartrent-verification | verification-before-completion for evidence discipline. |
| Skill authoring/discovery | Built-in Codex skill-creator / find-skills | No remote installation or auto-update without separate approval. |

## Readiness and task states

Use TODO, READY, IN_PROGRESS, BLOCKED, IN_REVIEW, VERIFIED and MERGED. READY requires accepted dependencies/decisions and authorized execution scope. VERIFIED requires fresh relevant checks and review evidence; it is not MERGED. Only actual runs change runtime status. C6-01 is IN_REVIEW with local implementation/checks; C6-02–16 are TODO. No task is MERGED merely because files exist locally.

Each PR/task includes problem/outcome, canonical FR/US, WB decisions accepted for this task, files, normal/denied/failure AC, migration/API compatibility, exact checks, evidence links and residual risks. Before tool handoff include branch/base SHA, dirty-file ownership, pending decisions and permission scope.

## Quality and operations

Use [Chapter 7 review plan](chapter-07-code-review-refactoring/review-plan.md), [Chapter 8 test strategy](chapter-08-software-testing/test-strategy.md) and [Chapter 9 documentation plan](chapter-09-technical-documentation/documentation-plan.md). CI starts with C6-01/02 and grows with each module. Do not promise durable notifications, calibration, load capacity or deployment readiness without the corresponding tests/design.

## Next authorized step

Review the local C6-01 implementation and its evidence. Local commits are authorized; push/merge/deploy and starting C6-02/C6-03 require separate approval. Product review for G2/G3/G4 can proceed independently; those policies were not silently accepted by foundation work. Preserve the implementation and existing local work during handoff.
