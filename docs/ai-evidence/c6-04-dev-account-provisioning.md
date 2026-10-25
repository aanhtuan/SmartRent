# B01 / C6-04 — Synthetic development account provisioning

## Context, authority and delivery state

- Actual execution/PO approval date: **2026-10-25**, Asia/Ho_Chi_Minh.
- Base/unchanged HEAD: `5ee6e8fa3d747bf2404539e73bbbe8cd9d9a617f` (C6-03 PR #10).
- Branch: `feat/c6-04-dev-account-provisioning`, created from the existing
  `codex/backend-phase0-audit` checkout while retaining all uncommitted documents.
- Status: **IN_REVIEW** — final security review fixed two configuration issues;
  fresh full verification passed 54 tests. See [security review](c6-04-security-review.md).
  Implementation and local verification completed;
  no commit, push, PR, hosted CI, merge or deployment for this increment.
- Scope: FR-01 valid-account prerequisite, D08, B01/C6-04 in the
  [backend plan](../chapter-06-ai-programming/backend-implementation-plan.md)
  and [original backlog](../chapter-06-ai-programming/implementation-backlog.md).
- PO approved G1 in the actual conversation, including **30-minute** access tokens,
  superseding the earlier 15-minute draft. Recorded in the
  [G1 decision register](../sprint-0-decisions.md#g1-backend-security-and-identity--po-approved-2026-10-25).
  B02/JWT implementation is outside this increment; G2/G3/G4 are not approved.

## Prompt, agent output and review boundary

The user's actual instruction authorized finalizing Phase 0 locally, then a focused
B01 increment with disabled-by-default dev/test provisioning, two synthetic accounts
per role, versioned/benchmarked Argon2id, atomic/idempotent writes, preserved existing
credentials/roles/status and meaningful PostgreSQL tests. It expressly prohibited
commits/push/merge/deploy, V1 changes, volume deletion and frontend implementation.
This is a sanitized summary of that interaction, not a fabricated historical log.

Codex performed the work using repository-local `smartrent-backend`, PostgreSQL
best-practices and `smartrent-verification` guidance. The exact underlying model
version is not independently recorded. No remote skill was installed and no other
agent was spawned. G1 approval is actual human policy review; the final code/diff
review here is agent self-review. Independent human code review remains pending.

Before backend edits, Phase 0/G1 documents received local diff/link/security review.
Tracked patches and the two new Phase 0 documents were snapshotted under
`/tmp/smartrent-phase0-before-g1*` and `/tmp/smartrent-phase0-g1-reviewed*`.
These are session-local safeguards, not version-controlled delivery artifacts.
No Phase 0 commit was created because Git delivery was expressly not authorized.
Existing document changes are retained in the same working tree.

## Implementation

- `identity.domain`: pure-JDK account value/role and account repository port.
  Diagnostic output redacts email/credentials; no HTTP serialization added.
- `identity.application`: four fixed `.test` identities, conditional profile/flag
  configuration, versioned PasswordEncoder, transaction-bound provisioner and safe
  conflict exception. No controller, public registration or authentication endpoint.
- `identity.persistence`: module-owned JPA adapter, mapping to the existing
  `UserRecord`, transaction advisory lock serializing provisioning batches.
- Configuration defaults to false. Only explicit `dev`/`test` profiles are allowed
  when enabled; mixed production/staging profiles fail before database operations.
  All four nonblank passwords must be externally supplied.
- A matching existing identity is read/verified without updating UUID, hash, role,
  active status or timestamps. Conflicts abort the transaction; unrelated users are
  untouched. Thus a nonempty database can contain more than four total users.
- Runtime account writes use the existing least-privilege application datasource;
  Flyway keeps its separate credentials. No DDL, new migration or D03 assignment.
- Spring Boot 3.5.16 / Spring Security 6.5.11 retained. New cryptographic dependency:
  `org.bouncycastle:bcprov-jdk18on:1.86`, explicitly pinned, resolved by Maven.
  The Boot BOM does not manage this dependency. Selection verified against
  [Maven Central metadata](https://repo.maven.apache.org/maven2/org/bouncycastle/bcprov-jdk18on/maven-metadata.xml).
- `{argon2id-v1}` encoding delegates to Argon2id: salt 16 bytes, hash 32 bytes,
  memory 19 MiB (19456 KiB), iterations 2, parallelism 1. No plaintext/legacy fallback.
  See [Spring's versioned PasswordEncoder guidance](https://docs.spring.io/spring-security/reference/6.5/features/authentication/password-storage.html).

## Actual test and refinement sequence

1. Added PostgreSQL acceptance tests before provisioning classes existed.
   The initial focused Maven run failed compilation for the missing classes:
   expected RED, not an application regression.
2. Implemented the domain/use-case/adapter/configuration. The first integration
   fixture incorrectly used JUnit PER_CLASS; Spring requested a mapped PostgreSQL
   port before Testcontainers startup. Corrected the fixture to normal per-method
   lifecycle, asserting automatic startup's four accounts before first fixture cleanup.
3. Focused `DevAccountProvisioningTests` run passed all eight tests with real
   PostgreSQL 17.11 and the production role-bootstrap/V1 configuration.
4. Added profile/flag/missing-credential cases, salted/versioned hash checks,
   redaction checks and a timing benchmark; ran the complete backend `verify`.

From `backend/`, the actual verification command was:

```sh
JAVA_HOME=/home/atuna/SmartRent/.local/toolchains/jdk-21.0.12.1+1 \
MAVEN_USER_HOME=/home/atuna/SmartRent/.local/maven \
./mvnw --settings ../.local/ide/maven-settings.xml \
  --batch-mode --no-transfer-progress verify
```

The machine-local settings/cache are ignored, not shipped project requirements.
The portable command remains `./mvnw --batch-mode --no-transfer-progress verify`
with JDK 21 and Docker available. That exact no-custom-settings variant was not
separately rerun on this machine; hosted CI is pending.

Initial pre-security-review run finished **2026-10-25 16:38:38 +07:00**, duration **13.733 s**:

```text
Tests run: 47, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

| Suite | Cases | Verified behavior |
|---|---:|---|
| Retained C6-01/C6-03 suites | 22 | HTTP default-deny/health, DB configuration, Flyway/JPA/privilege invariants |
| DevAccountProvisioningTests | 8 | Automatic startup/runner; exactly 2+2 roles; hashes; full-state idempotency/inactive preservation; password/role/unknown-encoding conflicts and rollback; missing input; concurrent calls; unrelated-user preservation |
| DevAccountProvisioningConfigurationTests | 14 | Default/explicit disable; 3 allowed profile combinations; 5 rejected non-dev/mixed/empty combinations; all 4 missing-credential positions; no repository interaction on invalid/disabled config |
| PasswordHashingTests | 3 | Independent salts/versioned parameters, match/wrong-password checks, diagnostic redaction, benchmark |

A single test can check multiple assertions; coverage listed above is not a claim
that every possible failure mode or future security policy is tested. Disabled and
invalid-profile cases use an isolated Spring context with a mock repository to
prove no repository calls, while persistence/races/rollback use real PostgreSQL.

Argon2id benchmark, one warm-up pair followed by five encode/verify samples:
**encode median 18.95 ms; verify median 20.71 ms**. The test outputs only parameters
and timings, never passwords/hashes. These are development-host wall-clock figures,
not production sizing, constant-time proof or authorization to retune parameters.
No production latency target was approved. Re-benchmark and explicitly review tuning
before production or a change to the approved encoding version.

JUnit/Mockito emitted a JVM warning about dynamic Byte Buddy agent attachment;
it did not fail tests. This warning was not hidden or counted as an application error.
Generated reports: `backend/target/surefire-reports/` (ignored). Local logs are
`/tmp/smartrent-b01-red.log`, `/tmp/smartrent-b01-integration.log` and
`/tmp/smartrent-b01-verify.log`; these are session-local, not permanent CI evidence.

## Initial acceptance and security self-review (before final review)

| Acceptance criterion | Local result |
|---|---|
| Exactly four fixed synthetic account slots; 2 LANDLORD + 2 TENANT | PASS, actual PostgreSQL inserts/role counts |
| Explicit enable plus dev/test only; default-disabled; missing secrets rejected | PASS, configuration tests and enabled PostgreSQL startup |
| Versioned Argon2id matching, salt differentiation and benchmark | PASS, actual encoder and persisted hashes, no hash values in evidence |
| Idempotent, transactional; preserve credentials/roles/inactive status/timestamps | PASS, stored-state comparisons and late-conflict rollback |
| Concurrent invocations do not duplicate identities | PASS, two synchronized callers against PostgreSQL |
| Existing unrelated accounts retained | PASS, independent preexisting synthetic row remains byte-for-byte equivalent |
| DB runtime/migration privilege boundary | PASS, existing privilege suite retained; new writes use runtime role |
| V1, local volume and unrelated Phase 0 work preserved | Final diff/checksum/volume checks recorded below |
| New hosted CI / independent human review | NOT RUN / PENDING |

The unchanged HTTP boundary still allows only status-only health. No browser/JWT,
CORS/CSRF or rate-limit behavior is claimed as implemented. Test fixtures contain
only synthetic identities and dynamically generated passwords. The only test
DELETE targets each test's own ephemeral PostgreSQL container; the existing local
Compose volume is not connected, started, reset or deleted.

## Remaining scope and handoff

- B01 is IN_REVIEW, not MERGED. Phase 0 and B01 changes remain uncommitted locally.
- B02 is next only under its authorized task scope: RS256 keys, issuer/audience,
  30-minute TTL, bearer boundary, CORS/CSRF validation, login/me, rate limits and
  safe API errors still need implementation/tests. No signing key generated here.
- G2/G3/G4 require separate PO decisions. No tenant-manager relation is inferred.
- No fresh hosted CI, independent code review, live local-volume provisioning or
  deployment was performed. The documented opt-in JAR command was not separately
  run against the retained local volume; Spring Boot provisioning was exercised
  by the real PostgreSQL integration context instead.
- Preserve base SHA, branch, this diff, V1 checksum and existing named volume.
  Commit/push/merge/deploy require separate authorization. Do not package local
  credentials, caches, test artifacts or session logs into a commit.

## Initial local static checks — 2026-10-25 (before final review)

- `git diff --check`: PASS; index remains empty, HEAD unchanged at `5ee6e8f`.
- Reviewed 28 changed/new text files (including preserved Phase 0 work),
  12 Markdown files and 157 relative file references: existing targets, balanced
  fenced blocks, final newlines, no trailing whitespace/conflict markers: PASS.
  Markdown links were checked for file existence; Mermaid rendering and external
  URL availability were not revalidated by this static checker.
- Targeted secret scan: no changed file contains any existing nonempty local
  `.env` password, provider/GitHub token pattern or private-key block. PASS for
  these checks; this is not a comprehensive external dependency/CVE audit.
- V1 SHA-256 unchanged:
  `c05eefa7a01d985830792055d10f34bc0fccd5fae773054584ee86a32f972d5b`.
- PostgreSQL bootstrap, Compose, CI workflow and existing foundation HTTP/security
  implementation remain unchanged. CI configuration review confirms Java 21 and
  wrapper `verify` will discover the new `*Tests` classes; actual hosted run is pending.
- `docker ps -a` still reports the original `smartrent-postgres-1` exited;
  `docker volume ls` still includes `smartrent_postgres_data`. No local-volume
  data inspection/write was performed. Testcontainers fixtures were cleaned up
  by their normal test lifecycle.
- Surefire XML independently totals 47 / 0 / 0 / 0 (tests/failures/errors/skipped).
  Final static checker is session-local `/tmp/check-smartrent-b01.py`.

## Final security review checkpoint

The [final security review](c6-04-security-review.md) records two reproduced
configuration defects, their fixes and seven additional regression cases.
The fresh Java 21 `verify` run finished 2026-10-25 16:56:28 +07:00:
54 tests, 0 failures/errors/skipped, BUILD SUCCESS (12.408 s).
Argon2id medians in that run: 19.62 ms encode / 20.72 ms verify, same parameters.
The earlier 47-test result and static counts above are retained as historical
execution evidence, not presented as the current suite totals.
