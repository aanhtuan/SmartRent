# Chapter 6 — Dependency-ordered implementation backlog

## Contract

All tasks are TODO; no application code, migrations, CI runs or live AI calls are completed by this document. Read [roadmap](../project-roadmap.md), [decisions](../sprint-0-decisions.md) and [workflow](../agent-workflow.md). Paths below are planned repository paths, not existing application artifacts. Use approved source-qualified FR IDs and the relevant Chapter 3 stories.

Every task: specify AC -> select skill/contracts -> write meaningful tests for business behavior -> implement -> run checks -> review -> record real evidence. Setup checks may be smoke/build checks rather than tests mirroring configuration. DoD: AC demonstrated, appropriate commands/results recorded, security/architecture reviewed, docs/evidence updated, limitations stated. Commit/push/merge/deploy are separate authorization. No unavailable command is reported passing.

## First five tasks

### C6-01 — Backend foundation and backend CI

- Sources: FR-01 and NFR; Chapter 5 module/layer boundaries. Skill: smartrent-backend.
- Depends: G0; authorization for scaffold/dependency downloads. Choose compatible pinned Spring Boot 3.x/Java 21 dependencies from official sources during execution; propose Maven Wrapper and record selected versions.
- Files: `backend/pom.xml`, `backend/mvnw`, wrapper files, application bootstrap/config, module packages, smoke test, `.github/workflows/backend-ci.yml`.
- Interface produced: single backend deployable with Identity, Property, Room, Tenant, Contract, Payment, Maintenance, Notification, AI Assistant and AI Integration responsibilities. No feature endpoint except authorized operational startup checks.
- AC normal: compile/start in test environment; meaningful context smoke test; CI uses Java 21 and same build command. Denied/failure: no public secret/config dump; missing required runtime config gives actionable startup failure. Domain contains no HTTP/provider SDK coupling.
- Verification after files exist: `./mvnw verify` from backend; inspect CI and module dependency direction. Do not expose actuator broadly. DoD: common DoD plus exact version/tool assumptions and backend startup instructions.

### C6-02 — Frontend foundation and frontend CI

- Sources: frontend architecture, US-01 and API conventions. Skills: smartrent-frontend; relevant React guidance.
- Depends: G0, authorized tooling/download scope; independent of backend build.
- Files: `frontend/package.json`, lockfile, Vite/TS/Tailwind configuration, `frontend/src/app/`, `frontend/src/shared/api/`, client tests, `.github/workflows/frontend-ci.yml`.
- Interface: typed JSON API client using configured backend base URL/error envelope; feature-based UI shell, no fake completed domain features.
- AC normal: build/typecheck/Vitest work; API client maps successful/error responses. Denied/failure: no provider credentials in bundle; rejected/network requests show safe errors; no cross-account cache reuse.
- Verification: establish scripts `typecheck`, `lint`, `test:run`, `build`; run `npm ci`, then declared scripts once dependency installation is authorized. DoD: common DoD plus frontend startup and configured browser target.

### C6-03 — PostgreSQL, Compose and identity migration

- Sources: schema users, Flyway/JPA conventions. Skills: smartrent-backend + PostgreSQL.
- Depends: C6-01; accepted database version/config at G1.
- Files: root Compose config, `.env.example` with placeholders, backend datasource/test config, `backend/src/main/resources/db/migration/V1__identity.sql`, Testcontainers integration tests.
- Interface: UUID users/email uniqueness/hash/roles/is_active; WB provisioning field only after D03 review. If G2 has not passed, exclude that extension and add a later forward migration; never silently implement it.
- AC normal: healthy local DB, Flyway on clean database and harmless second startup, JPA schema validation. Denied/failure: duplicate email/invalid role rejected, production auto-update disabled, missing secrets fail clearly. No database port exposure policy assumed for production.
- Verification: `docker compose config`, local startup/health check, `./mvnw verify` with real PostgreSQL Testcontainers; record Docker prerequisites. DoD: common DoD plus migration checksums/history preserved.

### C6-04 — Synthetic dev/test account provisioning

- Sources: FR-01 valid-account assumption; D08. Skill: smartrent-backend.
- Depends: C6-03; accepted seed/security policy at G1. Tenant-to-landlord assignment is deferred to C6-07 if D03 is not accepted yet.
- Files: environment-restricted provisioning utility/config, seed tests and local demo instructions; no public user creation API.
- Interface: two landlord and two tenant test identities; supplied development passwords hashed by application; idempotent invocation.
- AC normal: initial creation succeeds, repeat does not duplicate/reset identities unexpectedly. Denied/failure: unavailable outside enabled dev/test configuration; no plaintext password in code/logs/evidence; conflicting existing identity reports safe error.
- Verification: provisioning integration tests, password-hash matching, repeat-run and disabled-profile checks. DoD: common DoD plus reproducible synthetic fixture map without credentials.

### C6-05 — Login, current user and login UI

- Sources: FR-01; US-01 AC01–03; authentication API. Skills: backend + frontend + verification.
- Depends: C6-01–04 and G1 JWT/CORS/token-storage decisions.
- Files: Identity API/application/security classes and tests; frontend auth feature; Playwright auth specs.
- Interface: `POST /api/auth/login`, `GET /api/users/me`, Bearer access token and standard error envelope. No new registration/refresh/logout endpoint.
- AC normal: valid login/me and role-directed UI. Denied: wrong password, inactive user, missing/invalid/expired token rejected; client role/owner claims cannot change access. Failure: malformed input/rate-limit errors mapped; no hash/internal exception returned. Browser token in memory; expiry/reload prompts login.
- Verification: JUnit/Mockito, Spring security/API integration, Vitest, Playwright login/denial journeys; CI runs declared gates. DoD: common DoD plus G1 evidence, no claim that login proves ownership isolation.

## Domain increments

| Task | Sources / skill | Depends and files | AC: normal / denied / failure; verification |
|---|---|---|---|
| C6-06 Property/Room and UI | FR-02, US-02; backend/frontend/PostgreSQL | C6-05 + D02/D05 accepted; Property/Room modules, feature screens, forward migrations | Owner CRUD/list and soft deactivate; tenant/other landlord denied including filters; duplicate room code and invalid deactivation rejected. PostgreSQL scoped-query tests + UI integration/E2E. |
| C6-07 Tenant Profile/onboarding | FR-03, US-03; backend/frontend/PostgreSQL | C6-06 + D03 accepted; Tenant module, provisioning assignments, profile schema/API/UI | Assigned manager creates/views/updates profile and tenant permitted own contacts; other landlord cannot claim known user UUID/list PII; duplicate/role/ownership updates rejected. Test onboarding before contract and own historical visibility; validate forward migration. |
| C6-08 Contracts and occupancy | FR-04, US-03 assignment; backend/frontend/PostgreSQL | C6-07 + D05/D06 accepted; Contract module, Room public use case, contract screens/migrations | Valid date-bounded contract and calculated occupancy; both resources in manager scope; overlap/concurrent activation rejected; future/expired contracts grant no current tenancy. Unit date-boundary + PostgreSQL race/rollback tests + E2E. |
| C6-09 Billing/payment tracking | FR-05, US-04; backend/frontend/PostgreSQL | C6-08 + G3/D07 accepted; Payment module/screens, due-date migration | Monthly amount/due-date display and manual PAID; cross-tenant reads denied; duplicate periods, fractional VND/invalid dates and PAID edits rejected; overdue uses business clock. Boundary/constraint/API/E2E tests. |
| C6-10 Manual maintenance | FR-06/07, US-05/06; backend/frontend/PostgreSQL | C6-08 + D04 approved create/idempotency semantics; Maintenance module/UI/migrations | Explicit manual confirm creates one PENDING with original description; same submission key retry returns same request; missing/currently expired relationship denied; conflicting reuse/invalid transition rejected. Test race + rollback + date change between requests. |
| C6-11 In-app notifications | FR-08, US-09; backend/frontend | C6-09/10 + D10 accepted; Notification module/UI | Committed create/status/billing/contract events yield authorized notifications; recipient-only read/mark-read; rollback yields no event; delivery failure does not revert source state. Integration tests distinguish best-effort crash limitation from tested recovery. |
| C6-12 Gemini Adapter and evaluation | FR-10, F-01, US-08; AI/backend | C6-10 + D09/model/egress scope accepted; AI Integration interfaces, Gemini adapter, validator, fake fixtures | Structured sufficient/missing-info validated; unauthorized context never sent; invalid JSON/enums/range, timeout and injection safely degrade. Deterministic contract tests; reviewed Vietnamese eval set and rubric; no live claims from mocks. |
| C6-13 Preview/confirm and reclassification | FR-06/10, US-05/08, Chapter 4; AI/backend/frontend/PostgreSQL | C6-10–12 + G4/D04 token details accepted; preview/confirm UI/API/token implementation | Preview produces no business row/notification; edits trigger new preview; confirm validates binding/expiry and reauthorizes; missing info asks/retries or manual submits; tampered/stale token denied; token renewal/retry does not duplicate; classify changes metadata only. Signed-token/security/race tests + E2E/fake-provider scenarios. |
| C6-14 Read-only Assistant | FR-09, F-02, US-07; AI/backend/frontend | C6-09/12/13 + authorized context API; Assistant module/UI | Vietnamese answers cite available account context or admit missing facts; no cross-owner context, DB tools, financial confirmation or internal writes; timeout maps safe error. Context isolation, injection, unsupported-fact eval and E2E. |
| C6-15 Regression and refactoring | All FR; verification + affected skills | C6-06–14; tests and narrowly scoped refactors | Accepted journeys retained; no broadened permissions/API drift; module boundary, query/N+1 and concurrency concerns verified. Chapter 7 review evidence + Chapter 8 regression; no arbitrary coverage percentage substituted for scenarios. |
| C6-16 Reproducible demo/documentation | All FR; verification | C6-15; README/runbooks/API docs/evidence/demo | Clean local setup, migrations/seed, login-to-maintenance/payment/Assistant demo reproducible; failure/denied cases documented; commands/version results real; unavailable live provider marked. G5 review; deployment remains separately authorized. |

Every domain row inherits the common DoD, owns an independently reviewable increment and includes the affected contract/migration/docs in scope. Resolve decisions at the listed gate before implementation, not after tests encode an assumption. Do not create an entire module in one unreviewable change; split a row into API/policy/persistence/UI increments if its diff cannot be reviewed safely.
