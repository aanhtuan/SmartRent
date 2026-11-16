# SmartRent continuous backend implementation — local acceptance evidence

Date: **2026-10-25**, Asia/Ho_Chi_Minh. Branch: `feature/backend-completion`.
Base/unchanged HEAD: `5ee6e8fa3d747bf2404539e73bbbe8cd9d9a617f`.

**Historical implementation checkpoint (before later local commit approval):** B01–B15 backend functionality implemented locally; B16/B17 local
stabilization and documentation executed. **Local acceptance: PASS.** This is not
MERGED, a production certification, full-stack course completion or proof of live
Gemini quality. Hosted CI at this revision, independent human review and the
recorded dependency release decision remain open. No Git publication/deployment.

## Actual user authority and preserved work

The PO changed the workflow to continuous backend-first implementation: complete
B02–B15 using approved decisions and documented working baselines, perform essential
compile/migration/smoke checks, then B16/B17 comprehensive stabilization. No routine
review approval was requested between increments. Significant policy/security
conflicts still require a decision. G1 remains approved on 2026-10-25, with **30-minute**
access tokens. Individual historical G2/G3/G4 sign-offs were not fabricated.

The supplied branch/count were older: the actual starting branch was
`feat/c6-04-dev-account-provisioning` and B01's last security run passed **54** tests,
not 47. It was safely renamed to `feature/backend-completion` without checkout,
reset or stash. Before further edits, all tracked changes and untracked files
were snapshotted to `/tmp/smartrent-before-backend-continuation/`.
Original Phase 0 and B01 snapshots/evidence remain preserved; no existing changes
were discarded. No commits were created because separate Git authorization remains
required. The index and HEAD remain unchanged.

## Implementation notes by increment

| Increment | Concrete implementation / source | Actual verification |
|---|---|---|
| B02 / C6-05 | Identity login/me, external RSA keys, RS256 issuer/audience/required claim validation, TTL30m, DB active/role recheck, stateless bearer, exact CORS, bounded login limiter, error envelope and strict DTO input | Initial PostgreSQL login/me smoke passed, then JWT/security/limiter and regression suites |
| B03–B04 / C6-06 | Property and Room CRUD/soft deactivation, owner scope, unique room codes, public access/query boundaries; V2/V3 | Initial persist ordering defect found by smoke test and fixed before proceeding; owner/tenant/duplicate smoke rerun passed |
| B05 / C6-07 | Trusted immutable dev/test assignment utility, profile CRUD/contact updates, no public account claim or owner mutation; V4 | Synthetic dev assignment and profile-to-contract journey; cross-owner and immutable-field rejection |
| B06–B07 / C6-08 | Inclusive active reservations, common property/room lock order, overlap checks, current/future/history access, termination/future cancellation, derived expiry | PostgreSQL creation/PATCH/deactivation races, future-tenancy denial, cancellation/date preservation, terminal denial and business-clock checks |
| B08 / C6-09 | Manual whole-VND billing, first-of-month/contract period and due-date checks, unique periods, derived overdue, terminal PAID; V6 | Tenant/owner history scope, validation and duplicate bill race |
| B09–B10 / C6-10 | Exact original description, explicit manual create, scoped idempotency/digest, creator serialization, lifecycle/cancellation and reauthorization; V7, forward V9 integrity correction | Same-key race yields 201/200 one row; changed input409, role/scope denial, concurrent transitions, history after tenancy termination |
| B11 / C6-11 | Notification recipient CRUD/read status, committed events and REQUIRES_NEW writer, delivery errors caught outside that transaction; V8 | Actual notification HTTP journey; business rollback suppresses delivery; forced delivery failure does not undo committed bill |
| B12 / C6-12 | Gemini REST boundary, structured schemas, strict output validation, bounded HTTP body/concurrency/deadline, no automatic retry/failover, live disabled | Real loopback fake HTTP transport: schema, malformed/types/refusal, 429, oversized body, timeout, disabled behavior; no live requests |
| B13–B14 / C6-13 | Read-only preview, external HMAC keyring/kid, five-minute token, actor/room/exact-digest binding, explicit confirm/fallback, optimistic reclassification | Preview no row, token binding/tamper/expiry/key rotation tests, missing-info422, provider fallback, old metadata retained on provider failure |
| B15 / C6-14 | Read-only Assistant using authorized public query snapshots; no names/email/phone/address/original request text in structured context; partial-context flag | Own-context HTTP journey and fake-provider capture; empty context asks for information; fake success does not measure Vietnamese semantic quality |
| B16–B17 / C6-15–16 | Dependency/architecture/security review, Java formatting, batched occupancy, strict JSON bounds, API error corrections, runbook and reproducible HTTP test demo | Fresh complete verify and static checks below; hosted CI/live evaluation pending |

The application remains one Spring Boot deployable. Domain data/ports use the JDK;
controllers do not access persistence. Cross-module orchestration uses public
application facades/ports/events. No Gemini adapter imports JPA/JDBC or repositories.
No circular-reference workaround or `@Lazy` was introduced.

## Working-baseline assumptions used under the new instruction

- One landlord manager per tenant profile; no public registration, generic user
  admin, owner transfer or ADMIN role. Existing users are not arbitrarily backfilled.
- Business date Asia/Ho_Chi_Minh, timestamps UTC; inclusive room periods, single
  tenant per room reservation; no new rule limiting a tenant to one rental room.
- Termination/current and future cancellation follow section 3 of the backend plan.
  Bills already created are retained; non-termination date edits cannot exclude
  existing billing periods. Billing remains manual whole VND, not contract rent or banking.
- Manual maintenance has NOT_REQUESTED/null suggestion metadata. Cancellation reason
  is stored, without inventing a full status timeline. Existing identical own retry
  is checked before present tenancy or old preview expiration; new writes reauthorize.
- Notifications are in-app **best-effort after commit**, not an outbox/durable retry
  guarantee. PAYMENT_UPDATED follows the documented plan baseline.
- Gemini model `gemini-3.8-flash`, v1beta generateContent, is the explicit working
  baseline; live requests default off, other models/automatic failover are rejected.
  Live data/retention/cost and semantic evaluation still need separate authorization.
- Assistant context is bounded/partial and read-only. Pattern-based input redaction
  is not a universal PII detector. Do not send real personal details to a provider.

These assumptions are recorded as current implementation guidance under the PO
workflow amendment, not retroactive historical approvals.

## Final executed verification

From `backend/`:

```sh
JAVA_HOME=/home/atuna/SmartRent/.local/toolchains/jdk-21.0.12.1+1 \
MAVEN_USER_HOME=/home/atuna/SmartRent/.local/maven \
./mvnw --settings ../.local/ide/maven-settings.xml \
  --batch-mode --no-transfer-progress verify
```

Actual final run finished **2026-10-25 17:42:04 +07:00**, duration **30.775 s**:

```text
Tests run: 99, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

| Suite | Cases | What the actual run establishes |
|---|---:|---|
| Existing foundation/server/database configuration | 16 | Database-free health/security invariant and safe config validation |
| IdentityDatabaseTests | 6 | Latest schema, HTTP auth boundary, JPA normalization/timestamps, constraints, runtime grants and Flyway repeat |
| Retained B01 provisioning/config/hash tests | 32 | Opt-in dev/test/mixed-profile denial, atomic/idempotent four-account seed, hash benchmark and safe config errors |
| JwtValidationTests / LoginLimiterTests | 12 + 2 | RS256 acceptance; invalid issuer/audience/subject/time/TTL/jti/signature/algorithm rejection; missing keys; failure/IP limits and expiry |
| BackendJourneyTests | 12 | Real HTTP through all 33 business route families, broad missing-token coverage, key normal/denied/failure workflows, ownership/role checks, races, rollback and notification failure isolation |
| MigrationUpgradeTests | 1 | V1-only synthetic existing user upgraded to V9 without changing its identity/state/timestamps or V1 checksum; denied DDL/DELETE/history and harmless repeat |
| BusinessClockTests | 2 | Vietnamese midnight changes effective expiry/tenancy/overdue; PAID stays PAID |
| GeminiAdapterContractTests / ClassificationValidationTests | 7 + 3 | Local HTTP wire/schema/size/deadline/failure behavior; validated enums/finite range/text bounds |
| PreviewTokenTests | 3 | Actor/room/digest/signature binding, expiry, missing info, key rotation and no default signing secret |
| JsonInputTests / ArchitectureBoundaryTests | 2 + 1 | Duplicate/trailing/coerced/oversized/deep JSON rejection; domain independence/controller persistence/AI DB boundary and no affected XSLT/SSE source usage |

A test may contain multiple scenarios/assertions; the count is not a coverage
percentage or proof of every possible input/state combination. Static inventory
matches **33 documented method/path pairs to 33 controller mappings**, with no
extra public account-management endpoints. This is route coverage, not a generated
OpenAPI schema validator or an exhaustive semantic/formal proof of all contracts.

During stabilization, verified corrections included:
- JPA field initialization before persist, rather than queuing an all-null insert.
- Notification delivery exceptions caught outside the separate writer transaction.
- Derived status filters use the injected business clock; unpaid OVERDUE projection
  cannot override a new future due date. Assistant uses derived contract status.
- Common locks and current-tenancy checks; no fake lifecycle guards remain.
- Batched occupancy for room lists instead of a contract query per row.
- Tenant PATCH rejects immutable identity/manager fields403 and supports clearing
  optional contact data without changing identity.
- Safe 404/405/415 envelopes instead of mapping framework routing errors to500.
- Consistent CORS rejection envelope, bearer-only CSRF checks, bounded/strict JSON.

Reports are under ignored `backend/target/surefire-reports/`. Final session log:
`/tmp/smartrent-backend-final.log`. Earlier smoke/regression logs remain session-local
under `/tmp/smartrent-b02-*`, `smartrent-b03-*`, `smartrent-b05-*`,
`smartrent-b06-b08-*`, `smartrent-backend-*`. Dynamic Byte Buddy agent warnings did
not fail the tests and were not hidden. No unexecuted hosted/live check is marked PASS.

## Dependency review

The runtime dependency tree was actually resolved with Maven `dependency:tree`.
Public package coordinates/versions, not source/config/secrets, were queried against
OSV's batch API. Initial scan returned 18 package/advisory matches. Maven Central
metadata and advisory fixed ranges were examined before choosing compatible patches:

| Component | Before | Current pinned override |
|---|---|---|
| Tomcat | 10.1.55 | 10.1.61 |
| Jackson BOM | 2.21.4 | 2.21.8 |
| PostgreSQL JDBC | 42.7.11 | 42.7.14 |
| Log4j BOM | 2.24.3 | 2.25.5 |

Spring Boot stays **3.5.16**, Spring Framework **6.2.19**, Security **6.5.11** and
Bouncy Castle **1.86**. The final suite above passed after those overrides.
A fresh OSV check covered **88 runtime/compile packages**, retaining two findings:

| Advisory | Vendor conditions / current triage | Remaining decision |
|---|---|---|
| [CVE-2026-47890](https://spring.io/security/cve-2026-47890/) / GHSA-j9f9-w8pj-32f8 | Spring rates LOW; requires SSE view fragments and attacker-controlled streamed data. No SSE emitter/fragment route in this REST implementation. | Record conditional exposure assessment; recheck if introducing SSE/views. |
| [CVE-2026-47884](https://spring.io/security/cve-2026-47884/) / GHSA-pc63-qcmh-9cmg | Spring rates MEDIUM; requires XsltView plus a catch-all route resolving an unspecified view. Controllers here are REST JSON, with no XsltView mapping. | Retain dependency residual for release review; no claim that the package is patched. |

GitHub/OSV severity labels differ from the vendor; this report preserves that
package-level findings exist rather than calling the scan clean. Vendor fixes are
Spring7.0.9 OSS or6.2.20 Enterprise. Maven Central's public6.2 metadata ended at6.2.19
when checked. No paid repository/credentials were added and no unauthorized Spring7
migration was made. A zero-advisory release policy would require an explicit
platform/support decision. Functional verification can proceed with this clearly
recorded residual; deployment/security certification is not approved by this task.

Session scan artifacts: `/tmp/smartrent-backend-dependencies-final.txt`,
`/tmp/smartrent-osv-details.json`, `/tmp/smartrent-osv-final-results.json`.
This is an advisory database check plus source/config applicability review, not
penetration testing or a guarantee that undisclosed vulnerabilities do not exist.

## Database and Git preservation

- V1 SHA-256 remains
  `c05eefa7a01d985830792055d10f34bc0fccd5fae773054584ee86a32f972d5b`.
- No original migration, role bootstrap or Compose configuration was overwritten.
  V2–V9 are forward evolutions; V9 was added instead of editing the exercised V7.
- The retained `smartrent-postgres-1` stays exited; named volume
  `smartrent_postgres_data` remains present. No local-volume query/write/startup/reset.
  Only test-owned ephemeral PostgreSQL fixtures were mutated/cleaned up.
- Existing ignored `.env`, caches/toolchains and original Phase 0/B01 work are
  preserved. A pinned Google Java Format1.28.0 JAR was SHA-256 checked and stored
  under ignored `.local/tools`; it is not a repository dependency/skill install.
- No staging, commit, push, PR, merge, deployment or protection change occurred.

Logical future Git groups: preserve Phase 0/G1 and B01 as their own history; then
B02 authentication/shared API; B03/04 Property/Room; B05 assignment/profile;
B06/07 Contract/lifecycle; B08 billing; B09/10 Maintenance; B11 notifications;
B12 Gemini transport; B13/14 confirmation/reclassification; B15 Assistant;
B16 dependency/security/formatting; B17 docs/evidence. Shared files need staged
hunks, and public query/guard contracts must precede their callers. Do not blindly
stage directories or turn this working tree into one backend mega-commit.
The snapshot at task entry preserves the original B01 boundary for that split.

## Reproducible demo and remaining gates

```sh
cd backend
./mvnw --batch-mode --no-transfer-progress -Dtest=BackendJourneyTests test
```

The journey suite was executed in the final verify (12 tests). The same focused
command was also run during earlier increments; the final standalone no-settings
variant was not separately repeated. Tests create synthetic users, keys and DBs,
start actual HTTP servers, exercise APIs and use fake Gemini; no local-volume
mutation or credential copying is needed. See [backend runbook](../../backend/README.md)
for explicit normal startup/external keys and manual local setup.

Remaining: independent human review; hosted CI for the final revision after approved
publication; dependency residual/platform policy; separately approved live Gemini
synthetic quality/retention/quota evaluation. Frontend is deferred, not implemented.
There is no deployment, durable notification guarantee, production load/capacity
proof or production backup/restore acceptance. Local functional acceptance is not
silently promoted to overall release/backend completion under unrun external gates.

## CS2028 provenance

Actual prompt: PO requested continuous backend-first implementation, use of the
existing contracts/working baselines, then full stabilization, with no Git publication
or retained-volume changes. Codex read repository skills/contracts and implemented
sequentially in this checkout. No subagents, remote skill installation, provider
credentials or live provider requests were used. The underlying model version was
not independently recorded. Prompt content here is a sanitized interaction summary,
not fabricated historical output.

Actual iterations included B02 compile correction, a property persist failure caught
by PostgreSQL smoke, passing rental/AI HTTP journeys, expanded race/security/upgrade
suites, dependency patches and reruns, and final99-test acceptance. Review and
refactoring are agent self-review plus executable checks; independent human code
review has not been invented. Existing dated evidence is retained as history.

## Later delivery-preparation checkpoint — 2026-10-25

The same final application code was freshly verified at 20:18:24 +07 (99 tests,
zero failures/errors/skipped). The runbook API-journey command passed separately
at 20:20:14 +07 (12 tests). Documentation status wording and a protected backup
procedure were added without touching the retained PostgreSQL volume. See the
[delivery plan and exact commit manifest](backend-delivery-preparation.md).
No stage, commit, push, merge or deployment occurred; hosted/live/recovery gates
remain open. The earlier run above remains the original stabilization record.

## Local Git delivery follow-up — 2026-10-25

The user later authorized local commits. Phase 0 and B01 were preserved as separate
commits; the implementation is organized into the 16-commit series described in the
[delivery execution record](backend-delivery-preparation.md#local-commit-execution--2026-10-25).
Earlier statements about unchanged HEAD/no commits describe the implementation
checkpoint, not this later delivery action. No push, PR, merge or deployment was
authorized or performed. Final HEAD verification is reported after the documentation
commit; no earlier test run is presented as that run.
