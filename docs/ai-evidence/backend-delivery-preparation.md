# Backend delivery preparation and proposed commit plan

Date: 2026-10-25, Asia/Ho_Chi_Minh. Branch: `feature/backend-completion`.
Original base: `5ee6e8fa3d747bf2404539e73bbbe8cd9d9a617f`.

Status: the PO authorized local commit execution on 2026-10-25. The original
preparation plan below is retained as history; see the execution record at the end.
Remote publication (push/PR/merge) and deployment remain unauthorized.

## Scope and preserved work

The preparation began with 58 tracked modifications and 118 untracked files (176
paths), not a claim that every path was independently ready to commit. Phase 0 and
B01 original snapshots remain under `/tmp`; they are session-local recovery aids,
not durable Git history. Reconstructing the pre-continuation snapshot established
74 files still exist: 5 byte-identical and 69 subsequently extended/formatted/updated;
zero missing. This establishes recoverability and path preservation, not that every
old line is unchanged. V1 and Compose/bootstrap are unchanged against HEAD.

A further before-preparation snapshot is in `/tmp/smartrent-before-delivery-preparation/`.
This task changes documentation only: backup/runbook, current status wording and
this plan/evidence. Existing application implementation is preserved.

## Commit ordering and shared-file rules

Use the reviewed historical Phase 0 and B01 snapshots as boundaries for commits
1–2. Do not stage today's complete README, UserRecord, identity adapter, Maven or
configuration file into those early commits. Stage only their appropriate hunks.
The exact final-state path lists below intentionally repeat files needing multiple
logical hunks. No broad `git add .` or directory-wide staging of a shared file.

- Commit 3 adds `findById` identity port/adapter support; manager/assignment methods
  and `IdentityQueries.assigned` belong to 6. `UserRecord.provisionedByUserId` belongs with V4 in 4.
- Commit 3 carries JWT/strict-JSON/validation dependencies and compatible security
  patch overrides; commit 2 carries only Bouncy Castle/password hashing additions.
- Adapt identity tests for external JWT keys in 3, then schema version/column count
  in 4. Current final tests are not suitable for blind staging into historical B01.
- V2–V9 form one small schema evolution group (about 100 SQL lines); this avoids
  landing V9 before V8 or enabling a final mapping before its schema exists.
- Room orchestration imports ContractQueries and MaintenanceStateQueries; both
  public facades land before commit 10. Contract workflow waits for PaymentDatesGuard.
- Keep strict error handling/shared clock/events/StoredRecord in 3 so later modules
  compile against real common primitives. No stub guards or circular injections.
- Package-info formatting goes into 17, not historical behavior commits.
- Final completion claims and 99-test evidence belong in 18, after functionality.

At planning time, intermediate commits had **not** been staged, built or tested separately. During
approved commit preparation, inspect each staged diff, run `git diff --cached --check`,
check secrets and compile/test its resulting tree as appropriate in an isolated
checkout. If an intermediate fails, move the dependent hunk into its prerequisite
commit rather than claiming the final-tree verification proves every commit.
The actual final working tree is the state verified below.

## Proposed commits — exact paths and rationale

### 01. `docs(planning): record Phase 0 audit and approved G1 policy`

Historical Phase 0 snapshot only; preserve its original scope and later apply completion status in commit 18.

- `README.md`
- `backend/README.md`
- `docs/agent-workflow.md`
- `docs/ai-evidence/README.md`
- `docs/ai-evidence/backend-phase-0-audit.md`
- `docs/ai-evidence/c6-03-database-foundation.md`
- `docs/chapter-06-ai-programming/backend-implementation-plan.md`
- `docs/chapter-06-ai-programming/implementation-backlog.md`
- `docs/implementation-readiness.md`
- `docs/project-roadmap.md`
- `docs/sprint-0-decisions.md`

### 02. `feat(identity): provision opt-in synthetic development accounts`

Reviewed B01 snapshot only; Argon2id, guarded seed, idempotency and PostgreSQL tests. Split later identity/query/assignment additions out.

- `.env.example`
- `backend/pom.xml`
- `backend/src/main/java/com/smartrent/identity/application/DevAccountProvisioner.java`
- `backend/src/main/java/com/smartrent/identity/application/DevAccountProvisioningConfiguration.java`
- `backend/src/main/java/com/smartrent/identity/application/DevelopmentAccount.java`
- `backend/src/main/java/com/smartrent/identity/application/PasswordHashingConfiguration.java`
- `backend/src/main/java/com/smartrent/identity/application/ProvisioningConflictException.java`
- `backend/src/main/java/com/smartrent/identity/domain/Account.java`
- `backend/src/main/java/com/smartrent/identity/domain/AccountRepository.java`
- `backend/src/main/java/com/smartrent/identity/domain/AccountRole.java`
- `backend/src/main/java/com/smartrent/identity/persistence/JpaAccountAdapter.java`
- `backend/src/main/java/com/smartrent/identity/persistence/UserRecord.java`
- `backend/src/main/resources/application.yml`
- `backend/src/test/java/com/smartrent/identity/DevAccountProvisioningConfigurationTests.java`
- `backend/src/test/java/com/smartrent/identity/DevAccountProvisioningTests.java`
- `backend/src/test/java/com/smartrent/identity/PasswordHashingTests.java`
- `docs/ai-evidence/c6-04-dev-account-provisioning.md`
- `docs/ai-evidence/c6-04-security-review.md`

### 03. `feat(identity): add stateless JWT authentication and API safeguards`

Depends on 2. Add runtime dependencies, external keys, rate limits, error/JSON boundary and shared primitives; exclude assignment methods until 6.

- `.env.example`
- `backend/pom.xml`
- `backend/src/main/java/com/smartrent/identity/api/ApiSecurityConfiguration.java`
- `backend/src/main/java/com/smartrent/identity/api/AuthenticationController.java`
- `backend/src/main/java/com/smartrent/identity/api/FoundationSecurityConfiguration.java`
- `backend/src/main/java/com/smartrent/identity/application/Actor.java`
- `backend/src/main/java/com/smartrent/identity/application/IdentityQueries.java`
- `backend/src/main/java/com/smartrent/identity/application/JwtConfiguration.java`
- `backend/src/main/java/com/smartrent/identity/application/LoginLimiter.java`
- `backend/src/main/java/com/smartrent/identity/application/LoginService.java`
- `backend/src/main/java/com/smartrent/identity/domain/AccountRepository.java`
- `backend/src/main/java/com/smartrent/identity/persistence/JpaAccountAdapter.java`
- `backend/src/main/java/com/smartrent/shared/api/ApiErrors.java`
- `backend/src/main/java/com/smartrent/shared/api/ApiExceptionHandler.java`
- `backend/src/main/java/com/smartrent/shared/api/ApiFailure.java`
- `backend/src/main/java/com/smartrent/shared/api/JsonConfiguration.java`
- `backend/src/main/java/com/smartrent/shared/api/PageResponse.java`
- `backend/src/main/java/com/smartrent/shared/application/BusinessNotice.java`
- `backend/src/main/java/com/smartrent/shared/application/BusinessTime.java`
- `backend/src/main/java/com/smartrent/shared/application/Inputs.java`
- `backend/src/main/java/com/smartrent/shared/persistence/StoredRecord.java`
- `backend/src/main/resources/application.yml`
- `backend/src/test/java/com/smartrent/TestJwtKeys.java`
- `backend/src/test/java/com/smartrent/identity/DevAccountProvisioningConfigurationTests.java`
- `backend/src/test/java/com/smartrent/identity/DevAccountProvisioningTests.java`
- `backend/src/test/java/com/smartrent/identity/application/JwtValidationTests.java`
- `backend/src/test/java/com/smartrent/identity/application/LoginLimiterTests.java`
- `backend/src/test/java/com/smartrent/identity/persistence/IdentityDatabaseTests.java`
- `backend/src/test/java/com/smartrent/shared/api/JsonInputTests.java`

### 04. `feat(database): add forward rental and notification migrations`

Depends on 3. Keep V2–V9 in ascending order in one coherent schema increment, preserving V1. Include V4 UserRecord mapping and schema/upgrade test expectations.

- `backend/src/main/java/com/smartrent/identity/persistence/UserRecord.java`
- `backend/src/main/resources/db/migration/V2__properties.sql`
- `backend/src/main/resources/db/migration/V3__rooms.sql`
- `backend/src/main/resources/db/migration/V4__tenant_assignment_and_profiles.sql`
- `backend/src/main/resources/db/migration/V5__contracts.sql`
- `backend/src/main/resources/db/migration/V6__payments.sql`
- `backend/src/main/resources/db/migration/V7__maintenance.sql`
- `backend/src/main/resources/db/migration/V8__notifications.sql`
- `backend/src/main/resources/db/migration/V9__maintenance_cancellation_integrity.sql`
- `backend/src/test/java/com/smartrent/MigrationUpgradeTests.java`
- `backend/src/test/java/com/smartrent/identity/persistence/IdentityDatabaseTests.java`

### 05. `feat(rental): add property and room persistence boundaries`

Depends on 3–4. Storage/domain/access primitives only; dependent lifecycle orchestration arrives in 10.

- `backend/src/main/java/com/smartrent/property/application/PropertyAccess.java`
- `backend/src/main/java/com/smartrent/property/domain/Property.java`
- `backend/src/main/java/com/smartrent/property/domain/PropertyRepository.java`
- `backend/src/main/java/com/smartrent/property/persistence/JpaPropertyAdapter.java`
- `backend/src/main/java/com/smartrent/property/persistence/PropertyRecord.java`
- `backend/src/main/java/com/smartrent/room/domain/Room.java`
- `backend/src/main/java/com/smartrent/room/domain/RoomRepository.java`
- `backend/src/main/java/com/smartrent/room/persistence/JpaRoomAdapter.java`
- `backend/src/main/java/com/smartrent/room/persistence/RoomRecord.java`

### 06. `feat(tenant): enforce trusted assignment and profile ownership`

Depends on 3–4. Tenant APIs, profile storage, opt-in synthetic assignment and matching identity port/adapter hunks.

- `.env.example`
- `backend/src/main/java/com/smartrent/identity/application/DevelopmentAssignmentConfiguration.java`
- `backend/src/main/java/com/smartrent/identity/application/IdentityQueries.java` (assignment method only)
- `backend/src/main/java/com/smartrent/identity/domain/AccountRepository.java`
- `backend/src/main/java/com/smartrent/identity/persistence/JpaAccountAdapter.java`
- `backend/src/main/java/com/smartrent/tenant/api/TenantController.java`
- `backend/src/main/java/com/smartrent/tenant/application/TenantAccess.java`
- `backend/src/main/java/com/smartrent/tenant/application/TenantService.java`
- `backend/src/main/java/com/smartrent/tenant/domain/Tenant.java`
- `backend/src/main/java/com/smartrent/tenant/domain/TenantRepository.java`
- `backend/src/main/java/com/smartrent/tenant/persistence/JpaTenantAdapter.java`
- `backend/src/main/java/com/smartrent/tenant/persistence/TenantRecord.java`

### 07. `feat(contract): add reservation persistence and query boundaries`

Depends on 3–4. Contract model/storage/query facade and billing guard interface before room lifecycle orchestration.

- `backend/src/main/java/com/smartrent/contract/application/ContractBillingGuard.java`
- `backend/src/main/java/com/smartrent/contract/application/ContractQueries.java`
- `backend/src/main/java/com/smartrent/contract/domain/Contract.java`
- `backend/src/main/java/com/smartrent/contract/domain/ContractRepository.java`
- `backend/src/main/java/com/smartrent/contract/persistence/ContractRecord.java`
- `backend/src/main/java/com/smartrent/contract/persistence/JpaContractAdapter.java`

### 08. `feat(payment): add billing persistence and date guard`

Depends on 3–4 and 7. Supply the real ContractBillingGuard implementation; no temporary no-op guard.

- `backend/src/main/java/com/smartrent/payment/application/PaymentDatesGuard.java`
- `backend/src/main/java/com/smartrent/payment/domain/Payment.java`
- `backend/src/main/java/com/smartrent/payment/domain/PaymentRepository.java`
- `backend/src/main/java/com/smartrent/payment/persistence/JpaPaymentAdapter.java`
- `backend/src/main/java/com/smartrent/payment/persistence/PaymentRecord.java`

### 09. `feat(maintenance): add request persistence and state queries`

Depends on 3–4. Maintenance model/storage/open-state facade required by room deactivation.

- `backend/src/main/java/com/smartrent/maintenance/application/MaintenanceStateQueries.java`
- `backend/src/main/java/com/smartrent/maintenance/domain/Maintenance.java`
- `backend/src/main/java/com/smartrent/maintenance/domain/MaintenanceRepository.java`
- `backend/src/main/java/com/smartrent/maintenance/persistence/JpaMaintenanceAdapter.java`
- `backend/src/main/java/com/smartrent/maintenance/persistence/MaintenanceRecord.java`

### 10. `feat(rental): implement property and room lifecycle APIs`

Depends on 5, 7 and 9. Wire real contract/maintenance guards, common lock order, derived occupancy and REST use cases.

- `backend/src/main/java/com/smartrent/property/api/PropertyController.java`
- `backend/src/main/java/com/smartrent/property/application/PropertyService.java`
- `backend/src/main/java/com/smartrent/room/api/RoomController.java`
- `backend/src/main/java/com/smartrent/room/application/RentalLifecycleGuard.java`
- `backend/src/main/java/com/smartrent/room/application/RoomAccess.java`
- `backend/src/main/java/com/smartrent/room/application/RoomLifecycleGuard.java`
- `backend/src/main/java/com/smartrent/room/application/RoomService.java`

### 11. `feat(contract): enforce scoped reservation and termination workflows`

Depends on 6–8 and 10. Contract access, application service and controller; align termination contract documentation.

- `backend/src/main/java/com/smartrent/contract/api/ContractController.java`
- `backend/src/main/java/com/smartrent/contract/application/ContractAccess.java`
- `backend/src/main/java/com/smartrent/contract/application/ContractService.java`
- `design/api/contract-api.md`

### 12. `feat(payment): implement scoped monthly billing workflows`

Depends on 6–8 and 11. Payment application service and controller.

- `backend/src/main/java/com/smartrent/payment/api/PaymentController.java`
- `backend/src/main/java/com/smartrent/payment/application/PaymentService.java`

### 13. `feat(notification): deliver isolated after-commit notifications`

Depends on 3–4. Separate transaction, recipient-scoped API, no durable-delivery claim.

- `backend/src/main/java/com/smartrent/notification/api/NotificationController.java`
- `backend/src/main/java/com/smartrent/notification/application/NotificationService.java`
- `backend/src/main/java/com/smartrent/notification/application/NotificationWriter.java`
- `backend/src/main/java/com/smartrent/notification/domain/Notification.java`
- `backend/src/main/java/com/smartrent/notification/domain/NotificationRepository.java`
- `backend/src/main/java/com/smartrent/notification/persistence/JpaNotificationAdapter.java`
- `backend/src/main/java/com/smartrent/notification/persistence/NotificationRecord.java`

### 14. `feat(ai): add bounded Gemini adapter and validated outputs`

Depends on 3. Gemini boundary, deterministic local HTTP/validation tests; live disabled.

- `backend/src/main/java/com/smartrent/aiintegration/application/AiGateway.java`
- `backend/src/main/java/com/smartrent/aiintegration/application/AiInvalid.java`
- `backend/src/main/java/com/smartrent/aiintegration/application/AiProvider.java`
- `backend/src/main/java/com/smartrent/aiintegration/application/AiUnavailable.java`
- `backend/src/main/java/com/smartrent/aiintegration/domain/Classification.java`
- `backend/src/main/java/com/smartrent/aiintegration/persistence/RestGeminiAdapter.java`
- `backend/src/test/java/com/smartrent/aiintegration/ClassificationValidationTests.java`
- `backend/src/test/java/com/smartrent/aiintegration/persistence/GeminiAdapterContractTests.java`

### 15. `feat(maintenance): enforce preview confirmation and idempotent submission`

Depends on 6–7, 9–10 and 14. Preview tokens, manual fallback, scoped workflow and confirmation contract/tests.

- `.env.example`
- `backend/src/main/java/com/smartrent/maintenance/api/MaintenanceController.java`
- `backend/src/main/java/com/smartrent/maintenance/application/MaintenanceAiService.java`
- `backend/src/main/java/com/smartrent/maintenance/application/MaintenanceQueries.java`
- `backend/src/main/java/com/smartrent/maintenance/application/MaintenanceService.java`
- `backend/src/main/java/com/smartrent/maintenance/application/PreviewTokens.java`
- `backend/src/main/java/com/smartrent/maintenance/application/SubmissionDigest.java`
- `backend/src/test/java/com/smartrent/PreviewTokenTests.java`
- `design/api/maintenance-api.md`

### 16. `feat(assistant): answer using authorized read-only rental context`

Depends on implemented public query facades and 14–15; no tools or writes.

- `backend/src/main/java/com/smartrent/assistant/api/AssistantController.java`
- `backend/src/main/java/com/smartrent/assistant/application/AssistantService.java`

### 17. `test(backend): verify API journeys and architectural boundaries`

Depends on all implementation slices. Complete HTTP/concurrency/rollback/clock/architecture suites and formatting-only package documentation.

- `backend/src/main/java/com/smartrent/aiintegration/api/package-info.java`
- `backend/src/main/java/com/smartrent/aiintegration/application/package-info.java`
- `backend/src/main/java/com/smartrent/aiintegration/domain/package-info.java`
- `backend/src/main/java/com/smartrent/aiintegration/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/assistant/api/package-info.java`
- `backend/src/main/java/com/smartrent/assistant/application/package-info.java`
- `backend/src/main/java/com/smartrent/assistant/domain/package-info.java`
- `backend/src/main/java/com/smartrent/assistant/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/contract/api/package-info.java`
- `backend/src/main/java/com/smartrent/contract/application/package-info.java`
- `backend/src/main/java/com/smartrent/contract/domain/package-info.java`
- `backend/src/main/java/com/smartrent/contract/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/identity/api/package-info.java`
- `backend/src/main/java/com/smartrent/identity/application/package-info.java`
- `backend/src/main/java/com/smartrent/identity/domain/package-info.java`
- `backend/src/main/java/com/smartrent/identity/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/maintenance/api/package-info.java`
- `backend/src/main/java/com/smartrent/maintenance/application/package-info.java`
- `backend/src/main/java/com/smartrent/maintenance/domain/package-info.java`
- `backend/src/main/java/com/smartrent/maintenance/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/notification/api/package-info.java`
- `backend/src/main/java/com/smartrent/notification/application/package-info.java`
- `backend/src/main/java/com/smartrent/notification/domain/package-info.java`
- `backend/src/main/java/com/smartrent/notification/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/payment/api/package-info.java`
- `backend/src/main/java/com/smartrent/payment/application/package-info.java`
- `backend/src/main/java/com/smartrent/payment/domain/package-info.java`
- `backend/src/main/java/com/smartrent/payment/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/property/api/package-info.java`
- `backend/src/main/java/com/smartrent/property/application/package-info.java`
- `backend/src/main/java/com/smartrent/property/domain/package-info.java`
- `backend/src/main/java/com/smartrent/property/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/room/api/package-info.java`
- `backend/src/main/java/com/smartrent/room/application/package-info.java`
- `backend/src/main/java/com/smartrent/room/domain/package-info.java`
- `backend/src/main/java/com/smartrent/room/persistence/package-info.java`
- `backend/src/main/java/com/smartrent/tenant/api/package-info.java`
- `backend/src/main/java/com/smartrent/tenant/application/package-info.java`
- `backend/src/main/java/com/smartrent/tenant/domain/package-info.java`
- `backend/src/main/java/com/smartrent/tenant/persistence/package-info.java`
- `backend/src/test/java/com/smartrent/ArchitectureBoundaryTests.java`
- `backend/src/test/java/com/smartrent/BackendJourneyTests.java`
- `backend/src/test/java/com/smartrent/BusinessClockTests.java`

### 18. `docs(backend): document verified delivery and safe database operation`

Depends on final local verification. Final README/runbook/status/evidence and this delivery plan; keep original records historical.

- `README.md`
- `backend/README.md`
- `design/database/schema.md`
- `docs/agent-workflow.md`
- `docs/ai-evidence/README.md`
- `docs/ai-evidence/backend-completion.md`
- `docs/ai-evidence/backend-delivery-preparation.md`
- `docs/chapter-06-ai-programming/backend-implementation-plan.md`
- `docs/chapter-06-ai-programming/implementation-backlog.md`
- `docs/implementation-readiness.md`
- `docs/project-roadmap.md`
- `docs/sprint-0-decisions.md`

## Fresh execution evidence

Both commands were run from `backend/`, using Java 21 and the existing local Maven
settings/cache. The portable runbook omits these machine-specific paths.

```sh
JAVA_HOME=/home/atuna/SmartRent/.local/toolchains/jdk-21.0.12.1+1 \
MAVEN_USER_HOME=/home/atuna/SmartRent/.local/maven \
./mvnw --settings ../.local/ide/maven-settings.xml \
  --batch-mode --no-transfer-progress verify
```

**PASS:** 99 tests, 0 failures/errors/skipped; BUILD SUCCESS, 32.376 s,
finished 2026-10-25 20:18:24 +07. Log: `/tmp/smartrent-delivery-verify.log`.
Application source/build/migrations were not changed after this run.

The same environment with `-Dtest=BackendJourneyTests test` also passed:
12 tests, 0 failures/errors/skipped; BUILD SUCCESS, 10.524 s,
finished 20:20:14 +07. Log: `/tmp/smartrent-delivery-api-demo.log`.
This reproduces the backend-only API journey with random-port HTTP servers,
synthetic identities, deterministic fake AI and real disposable PostgreSQL.
The intentional notification-persistence failure warning is an asserted failure
scenario, not a failed test. Surefire reports are ignored build artifacts.

Static checks matched 33 documented method/path pairs to 33 controller mappings;
this does not establish exhaustive field-by-field contract equivalence. Targeted
secret scanning found no private-key/provider-token shapes or exact matches of
existing local secret values in candidate files. Git whitespace checks, Markdown
fence/local-path checks passed; this is not a general secret-scanner certification,
a Markdown style-linter run or proof of every external URL/anchor.
Final inventory: **58 tracked modifications + 119 untracked files = 177 paths**.
All paths appear in the commit manifest. Shell syntax checking with `zsh -n`
passed 16 shell blocks; 18 changed/new Markdown files had 189 local file
references checked. These checks do not execute manual setup/backup commands.
`.env`, `.local/` and backend `target/` are ignored and not tracked. Only the blank
`.env.example` template is eligible. Existing CI uses pinned checkout/setup-java,
Java 21 and Maven verify; hosted CI for the new local commit series is **NOT RUN**.

## Migration preservation

V1 is the only migration already in HEAD. Its SHA-256 remains unchanged:
`c05eefa7a01d985830792055d10f34bc0fccd5fae773054584ee86a32f972d5b`.
V2–V9 are new files, never rewrites of V1. MigrationUpgradeTests passed a real
PostgreSQL V1-to-V9 upgrade preserving identity data/checksum and a harmless repeat;
runtime grants and schema compatibility are tested. V9 strengthens cancellation
integrity instead of editing the earlier exercised V7. No deployed/shared database
was queried to infer its migration state. Preserve all V2–V9 bytes once applied.

Current candidate checksums (compare before staging and publication):

- `V1__identity.sql`: `c05eefa7a01d985830792055d10f34bc0fccd5fae773054584ee86a32f972d5b`
- `V2__properties.sql`: `86d6fa0b48f6f71913c67e71dc3183d4a5bc7b90ed746fa6e40df619d96a3f64`
- `V3__rooms.sql`: `eb3dedd26e4c8417b9035552d1b6e348525a8a4b96ba041ce9ecea89cdf46441`
- `V4__tenant_assignment_and_profiles.sql`: `e25601c08d489ca92de76392f6639278b4c28ead01fd7eba4630e110d6531bc1`
- `V5__contracts.sql`: `f96b0b22b48d773c276f1c8d17bae0df66295254374c4b57ea20f11b86dc6b47`
- `V6__payments.sql`: `e8e5d0100f39c889d4b0f91ce399ac42f18dd8b50b282cfd0e63ab66b97f86b5`
- `V7__maintenance.sql`: `b696d4bf2e68ebe15ec4741582c0583c8b471b4161d685f85c9415c802ca9575`
- `V8__notifications.sql`: `e19df219160c47ac81964d1670c262436667e37bb64367ad29054befb77beb1c`
- `V9__maintenance_cancellation_integrity.sql`: `2b8719f7968441a8095928b08211ad16c673a8f7231d9918588beada408ee3ed`

## Safe retained-volume upgrade and remaining gates

The [runbook backup procedure](../../backend/README.md#back-up-a-retained-database-before-applying-pending-migrations)
uses a new protected custom-format dump, archive listing and checksum before
application/Flyway startup. A failed dump stays `.partial`. Roles/credentials need
separate secure preservation; listing alone does not prove restore success.
The existing `smartrent-postgres-1` container remains stopped and
`smartrent_postgres_data` remains present. **Backup/restore/retained-volume upgrade
NOT RUN.** A separately approved isolated restore rehearsal remains open.

Live Gemini availability, model quality, cost and data-retention evaluation are
NOT RUN. Automated fake/HTTP tests do not prove live semantic performance.
Notifications and rate limiting retain their documented best-effort/process-local
limits. Deployment, production load, external operational recovery and independent
human security review are NOT RUN; no production-ready certification is asserted.

Two Spring Framework advisories remain recorded against 6.2.19:
[CVE-2026-47890](https://spring.io/security/cve-2026-47890/) (vendor LOW, SSE fragments)
and [CVE-2026-47884](https://spring.io/security/cve-2026-47884/) (vendor MEDIUM,
XsltView/catch-all rendering). Official pages were rechecked during preparation.
The source does not implement the triggering features; the dependency itself is
not patched. The existing 88-package scan is the prior stabilization run, not a
new scan in this task. No unapproved Spring major upgrade or enterprise repository
was introduced. Release review must retain this residual explicitly.

Local result: suitable to proceed to reviewed commit preparation. Hosted CI,
publication authorization and residual-risk review remain gates before delivery.

## Local commit execution — 2026-10-25

Authority: the user explicitly approved local commits for the existing implementation,
including logical consolidation to avoid unnecessary intermediate build failures.
Push, opening a PR, merge, deployment and data deletion remain unauthorized.
Branch stayed `feature/backend-completion`; no existing history was rewritten.

The original 18 proposals were executed as **16 commits**. Proposals 3/4/6 were
consolidated into identity/security/schema/tenant ownership: IdentityQueries uses
assignment port methods, UserRecord requires the V4 assignment column, and current
identity integration tests require JWT configuration and the V9 schema. This avoids
manufactured intermediate source/test variants. All other logical groups retain
their proposed scope/order, with tenant prerequisites moved ahead of rental APIs.
Phase 0 and reviewed B01 remain the first two independent commits, reconstructed
from their reviewed snapshot patches in the index without overwriting working files.

Before documentation updates, all **177 original candidate files** were checked
against the pre-execution SHA-256 manifest and remained byte-identical. Only current
status and execution evidence were subsequently updated; application code, tests,
configuration and migrations were preserved exactly. The manifest and reviewed
patches/logs are session-local under `/tmp/smartrent-commit-execution/`.

| Commit | Message |
|---|---|
| `3605a62` | `docs(planning): record Phase 0 audit and approved G1 policy` |
| `e51c47a` | `feat(identity): provision opt-in synthetic development accounts` |
| `6a6dff5` | `feat(identity): integrate JWT security and tenant ownership schema` |
| `7d32afe` | `feat(rental): add property and room persistence boundaries` |
| `59e02ee` | `feat(contract): add reservation persistence and query boundaries` |
| `61bc7aa` | `feat(payment): add billing persistence and date guard` |
| `dee41e8` | `feat(maintenance): add request persistence and state queries` |
| `574a700` | `feat(rental): implement property and room lifecycle APIs` |
| `97bb13d` | `feat(contract): enforce scoped reservation and termination workflows` |
| `72ea7cd` | `feat(payment): implement scoped monthly billing workflows` |
| `1883235` | `feat(notification): deliver isolated after-commit notifications` |
| `6482d86` | `feat(ai): add bounded Gemini adapter and validated outputs` |
| `e1f6c82` | `feat(maintenance): enforce preview confirmation and idempotent submission` |
| `5e00c0c` | `feat(assistant): answer using authorized read-only rental context` |
| `fa38b26` | `test(backend): verify API journeys and architectural boundaries` |
| This documentation increment | `docs(backend): document verified delivery and safe database operation` |

Every commit's staged paths/diff were inspected and archived; staged whitespace,
conflict markers, forbidden artifact paths, targeted secret matches and unchanged V1
were checked before commit. No broad `git add .` was used. Shared Phase 0/B01 files
were staged from their original patches; `.env.example` was split between identity
configuration and later AI/preview configuration. No secret values were printed.

Verification of exact staged trees, exported to isolated directories:

- B01: full Java 21 Maven verify, **54 tests**, zero failures/errors/skipped;
  BUILD SUCCESS, finished 20:32:22 +07 (`b01-verify.log`).
- Consolidated identity/schema/tenant: full verify, **71 tests**, zero failures/
  errors/skipped; BUILD SUCCESS, finished 20:33:35 +07 (`identity-verify.log`).
- Each remaining application/test group (original 5, 7–17): Java 21 Maven
  `test-compile` passed before commit. This establishes compilation, not execution
  of every intermediate regression suite (`group-*-compile.log`).
- Final HEAD full Maven verify is run **after this documentation commit**; its
  exact commit hash and fresh result are returned in the delivery report. The
  earlier 99-test verification above is preserved as dated evidence, not relabeled
  as an executed final-HEAD result.

All intended 177 paths are included by the completed series. The retained local
PostgreSQL volume has not been started, migrated, backed up or restored by this Git
task. Live Gemini, hosted CI, independent review, restore rehearsal and deployment
validation retain their existing open status. Local commits do not approve release.
