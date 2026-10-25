# SmartRent — AI-assisted end-to-end development roadmap

## Continuous backend checkpoint — 2026-10-25

PO authorized B02–B15 continuous implementation using documented working baselines,
followed by B16/B17 stabilization. These backend slices now have local source and
verification; frontend remains deferred. Read [current completion evidence](ai-evidence/backend-completion.md)
for actual results, dependencies, assumptions and remaining hosted CI/live AI gates.
At that implementation checkpoint, no commit, push, merge, deployment or retained-volume migration had been performed. Local commits were later explicitly authorized; remote publication remains pending.
Earlier snapshots below are historical, not the current feature inventory.


## Start here

Current state: C6-01 and C6-03 are merged through PR #9/#10 (base `5ee6e8f`).
B01–B15 backend functionality and B16/B17 local stabilization exist in the current
working tree; the latest complete local verification passed 99 tests. Git delivery,
hosted CI for this revision, independent review, live Gemini evaluation and deployment
validation remain pending. Frontend/UI is deferred. G1 was approved on 2026-10-25;
G2–G4 working baselines were used under the later continuous-implementation instruction,
without fabricating individual sign-offs. See [completion evidence](ai-evidence/backend-completion.md).

Read [AGENTS.md](../AGENTS.md), [agent workflow](agent-workflow.md), [decision baseline](sprint-0-decisions.md), [readiness report](implementation-readiness.md), then the task in [Chapter 6 backlog](chapter-06-ai-programming/implementation-backlog.md). The stack and Modular Monolith architecture remain approved; new business defaults are working baseline until their named review gates pass.

## Delivery loop for every task

Specify -> Plan -> Implement -> Test -> Review -> Merge.

1. Specify observable AC, canonical FR/US, resource contracts, scope, authorization and current base SHA; preserve dirty work.
2. Plan the smallest independently reviewable increment, exact files/interfaces, tests and applicable skill references. A blocked business decision blocks only dependent tasks.
3. Implement on an authorized task branch such as `feat/<task-slug>`, one writer per checkout. Domain modules contain API/application/domain/persistence responsibilities; no cross-module internal repositories or provider SDKs in domain.
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

C6-02 frontend foundation depends only on G0 and approved tooling; the login UI consumes it. The original full-stack dependency order remains a reference. The current PO instruction deliberately defers frontend and UI integration until backend delivery; backend completion does not satisfy UI acceptance criteria.

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

Use TODO, READY, IN_PROGRESS, BLOCKED, IN_REVIEW, VERIFIED and MERGED. READY requires accepted dependencies/decisions and authorized execution scope. VERIFIED requires fresh relevant checks and review evidence; it is not MERGED. Only actual runs change runtime status. C6-01 is MERGED; C6-03 is MERGED through PR #10. C6-02 is deferred for the backend-first mission; B01/C6-04 is IN_REVIEW after local implementation/verification; C6-05–16 backend slices now have local implementation/verification evidence; hosted delivery and full-stack criteria remain open. Completing backend slices does not mark UI tasks complete. No task is MERGED merely because files exist locally.

Each PR/task includes problem/outcome, canonical FR/US, WB decisions accepted for this task, files, normal/denied/failure AC, migration/API compatibility, exact checks, evidence links and residual risks. Before tool handoff include branch/base SHA, dirty-file ownership, pending decisions and permission scope.

## Quality and operations

Use [Chapter 7 review plan](chapter-07-code-review-refactoring/review-plan.md), [Chapter 8 test strategy](chapter-08-software-testing/test-strategy.md) and [Chapter 9 documentation plan](chapter-09-technical-documentation/documentation-plan.md). CI starts with C6-01/02 and grows with each module. Do not promise durable notifications, calibration, load capacity or deployment readiness without the corresponding tests/design.

## Next authorized step

Prepare logical backend commits and reproducible operation on `feature/backend-completion`.
Do not add features. Review [completion evidence](ai-evidence/backend-completion.md),
verify documentation/security/migrations and the [backup procedure](../backend/README.md#back-up-a-retained-database-before-applying-pending-migrations).
Commit, push, merge and deployment require their separate authorization. Preserve the
retained volume and applied V1; frontend and live AI evaluation remain deferred.
