# Backend-first Phase 0 — Audit and planning evidence

Date: 2026-10-25, Asia/Ho_Chi_Minh.
Base/main: `5ee6e8fa3d747bf2404539e73bbbe8cd9d9a617f`.
Work branch: `codex/backend-phase0-audit`; clean main before authorized work.
Agent: Codex, current session; exact model/version not independently captured.
No extra agents, remote skill installation or provider calls.

## Context and sanitized prompt

The user requested completion of the entire SmartRent backend in small increments,
starting with an audit and Vietnamese plan. Frontend/UI/frontend E2E are deferred.
Reconcile stale C6-03 delivery documents. Present explicit G1–G4 recommendations
and obtain PO approval before implementing dependent business policies. Preserve
existing work, migrations and database data; no push/merge/deploy/data deletion or
repository-protection changes are authorized for this mission.

## Inputs inspected

- AGENTS and repository backend, AI, PostgreSQL, verification and writing-plans skills;
  agent-workflow overrides generic skill examples for commits/agents/Superpowers.
- Entire Chapter 6 backlog; roadmap, Sprint 0 decisions and historical readiness.
- Chapter 3 product discovery, PRD, requirement analysis, user stories and feature
  specification; Chapter 4 maintenance interaction/fallback/confirmation context.
- Chapter 5 architecture/patterns/UML/database/API/design patterns and review;
  design architecture, UML, schema/ERD and all seven resource API contracts.
- Existing Maven/wrapper, application/security/identity configuration, V1, bootstrap,
  Compose, tests, README/backend guide, CI, and Chapters 7–9 review/test/docs plans.
- Prior C6-03 implementation/review/delivery evidence and current GitHub metadata.

## Facts independently verified

| Item | Observation |
|---|---|
| Git | Clean main at `5ee6e8f` before changes. `git ls-remote --heads origin main` matches; task branch created from that revision. |
| C6-03 delivery | PR #10 merged 2026-10-12, merge SHA `5ee6e8f`. Push run 38262445259 and PR run 38262783855 are success for head `4d037c4`. API metadata read again; no remote mutation. |
| Current executable code | Foundation/default-deny HTTP, health and identity persistence. Other feature packages do not establish business implementation. |
| API inventory | 33 method/path business contracts: identity/profile/Assistant 7, Property 4, Room 5, Contract 4, Payment 4, Maintenance 6, Notification 3. These are designed, not implemented. |
| Frontend | No frontend application; excluded from this execution. C6-05 UI and later UI criteria remain deferred, not silently passed. |
| Database | Only V1 migration. Its SHA-256 `c05eefa7a01d985830792055d10f34bc0fccd5fae773054584ee86a32f972d5b` matches the committed version before/after Phase 0. |
| Docker | Context desktop-linux; daemon 29.8.2 reachable. `docker compose config --quiet` succeeds. Local PostgreSQL container is stopped (Exited 255 from a prior run); health is not claimed. No container start/cleanup or volume change performed. |
| JDK | Local checksum-verified Temurin 21.0.12.1+1 remains available. Boot parent remains pinned 3.5.16. |

## Output, review and refinement

Created the [Vietnamese backend implementation plan](../chapter-06-ai-programming/backend-implementation-plan.md)
with an audit table, explicit proposed G1–G4 policy packages, module boundaries,
forward-migration strategy and 17 backend slices mapped to original C6 tasks.
The plan separates backend acceptance from deferred UI/full-course-gate acceptance.

Corrected stale C6-03 delivery status in README, backend guide, roadmap/backlog,
evidence index and a new delivery-confirmation section in the original C6-03 record.
Added a current readiness snapshot while preserving the Sprint 0 historical text.
Corrected stale workflow statements about canonical FR numbering and absent manifests.
Updated authorization descriptions to the user's current backend-first mission;
no PO approval of proposed policies was invented.

Self-review caught the following planning concerns and made them explicit:

- Backend login must not wait for deferred React work or imply full G1 completion.
- Cancellation reason and future contract termination need contract/schema decisions.
- Existing idempotent retry after preview/tenancy expiry needs an explicit rule.
- Manual category selection differs from the current create DTO; PO must decide.
- Room/contract/maintenance guards need acyclic public-facade wiring and shared locks.
- Provider model availability/schema do not prove live model quality or privacy.
- Existing latest-schema assertions hardcode V1/seven users columns; later approved
  migrations require current-schema tests plus a preserved V1-to-latest upgrade test,
  rather than removing migration/security coverage to keep the suite green.

No business code, dependency, SQL migration, credential or Cloud setting changed.
No policy-dependent backend feature started. This is Phase 0 completion, **not**
backend completion, human approval, independent review or production readiness.

## Executed checks

From backend, using the existing ignored local Maven settings/cache:

```sh
JAVA_HOME=/home/atuna/SmartRent/.local/toolchains/jdk-21.0.12.1+1 \
MAVEN_USER_HOME=/home/atuna/SmartRent/.local/maven \
./mvnw --offline --settings ../.local/ide/maven-settings.xml \
  --batch-mode --no-transfer-progress verify
```

Result: exit 0, **22 tests, 0 failures/errors/skipped; BUILD SUCCESS**.
Tests include real PostgreSQL Testcontainers, independent of the stopped local
Compose container. Temporary run log: `/tmp/smartrent-backend-phase0-verify.log`;
regenerable reports: `backend/target/surefire-reports/` (ignored). This is a fresh
baseline execution, not evidence that planned features have tests or pass.

Documentation checks performed after edits: tracked/untracked whitespace and merge
marker scan; relative Markdown path and fence checks; Git scope and local-secret
scan; unchanged V1 hash and no application/config/migration diff. These checks do
not validate unimplemented business policies or Mermaid rendering.

Observed documentation-check result: 10 changed/new Markdown files, 142 valid
relative path references; no conflict marker, unbalanced fence, trailing whitespace
or detected local credential/private-key/token pattern. V1 matches committed bytes.
The existing `smartrent_postgres_data` named volume is present; its contents were
not inspected or written by this audit.

NOT RUN: local database/application startup, business/API/concurrency suites not
yet written, live Gemini/evaluation, frontend/UI E2E, dependency vulnerability
scanner and hosted CI for this Phase 0 branch. Existing hosted C6-03 results above
are revision-specific. No deployment, backup/restore, destructive cleanup or Git
publication was performed.

## Handoff and next action

PO reviews section 3 of the implementation plan. G1 seed/hash/JWT/CORS/rate-limit
decisions unblock B01/C6-04 and B02/C6-05 backend first; G2/G3/G4 may be reviewed
independently before their own increments. Preserve the uncommitted Phase 0 diff;
do not reset it or silently adopt draft decisions. Record actual approval/date and
update affected contracts before implementing changed policy.

Complete backend delivery still requires all approved slices, actual acceptance
evidence, final-SHA CI, accurate runbook/demo and explicit residual limitations.
Push/merge/deploy remain separately authorized actions. No user passwords, JWTs,
provider keys, real tenant data or raw sensitive prompts are included here.


## PO decision and local review checkpoint — 2026-10-25

The user explicitly approved G1 for B01/B02 with a **30-minute JWT TTL**, preserving
all other reviewed G1 details, requiring benchmarked versioned Argon2id, immutable
idempotent seed behavior, and DB role separation. G2/G3/G4 remain unapproved.
The actual decision is recorded in sprint-0-decisions and reflected in the plan.
The user authorized B01 implementation after this documentation review, but
explicitly prohibited commits/push/merge/deploy without separate authorization.

Pre-existing Phase 0 work was preserved first as `/tmp/smartrent-phase0-before-g1.patch`
and `/tmp/smartrent-phase0-before-g1-new-docs.tar.gz`. The finalized local Phase 0
review snapshot is `/tmp/smartrent-phase0-g1-reviewed.patch` plus its new-document
archive. Diff/Markdown/link/secret/scope checks were run before application edits.
This finalizes the **local review checkpoint only**; Phase 0 is not committed or
published. No Git permission is inferred from the phrase "finalize". B01 carries
these existing documentation changes forward intact on its focused task branch.
