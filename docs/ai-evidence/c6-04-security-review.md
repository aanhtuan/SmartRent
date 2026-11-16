# B01/C6-04 — Final security-focused review

Review date: **2026-10-25**, Asia/Ho_Chi_Minh. Reviewed actual source, tracked diff,
untracked source/tests and documentation. This is an agent code review with
executed regression tests; independent human review and hosted CI are pending.

Branch: `feat/c6-04-dev-account-provisioning`. The request's old `codex/` name was
superseded by the user's explicit naming correction; no branch switch or commit
was performed during this review. HEAD/base remains
`5ee6e8fa3d747bf2404539e73bbbe8cd9d9a617f`.

Authority: [G1 approval](../sprint-0-decisions.md#g1-backend-security-and-identity--po-approved-2026-10-25),
B01/C6-04 scope and the user's security-review request. No B02, G2–G4, frontend,
migration, local-volume write or publication is authorized by this review.

## Findings, evidence and disposition

| ID / severity | Trigger, evidence and impact | Correction / disposition |
|---|---|---|
| B01-S01 **MEDIUM** | Provisioning configuration originally called `Environment.getProperty` directly (pre-fix line 39). A supplied credential containing an unresolved placeholder caused Spring to include the configured value in a propagated exception/stack trace, exposing a synthetic test secret in startup diagnostics. Reproduced by the new regression test, which failed before the fix. | FIXED: [configuration lines 44–59](../../backend/src/main/java/com/smartrent/identity/application/DevAccountProvisioningConfiguration.java) catches resolution errors and throws a safe variable-name-only exception without retaining the original cause. [Configuration test lines 99–114](../../backend/src/test/java/com/smartrent/identity/DevAccountProvisioningConfigurationTests.java) checks the whole stack trace and captured output for leakage and no repository interaction. |
| B01-S02 **MEDIUM** | With an environment configured to ignore unresolved nested placeholders, `${...}` was nonblank and the runner accepted it as a password. That could persist an unintended literal instead of the expected external credential. The new context test failed because startup incorrectly succeeded. | FIXED: configuration line 52 rejects unresolved placeholder syntax as well as missing/blank values. [Regression lines 117–128](../../backend/src/test/java/com/smartrent/identity/DevAccountProvisioningConfigurationTests.java) proves failure before repository access even with lenient placeholder resolution. No password policy or hash parameters changed. |
| B01-D01 **LOW** | Current branch was renamed per the user, but README contribution rules, agent workflow, roadmap and plan still prescribed the old `codex/<task-slug>` convention. This could recreate an unwanted branch during publication/handoff. | FIXED: future task examples now use `feat/` or `fix/`. Historical Phase 0 branch names are retained as actual historical evidence. |
| **BLOCKER / HIGH** | No verified finding at these severities within reviewed B01 scope. | No open BLOCKER/HIGH/MEDIUM finding after the fixes and rerun. This is not a production-security certification. |

The two initial regression cases ran before the source fix: **16 cases, 2 failures,
0 errors/skipped**, as expected. Red output stays session-local; no credential
values are copied into this report. Existing valid profiles and credentials
continued to work after the fix.

## Security and acceptance review matrix

| Concern | Source / actual evidence | Result |
|---|---|---|
| Profile isolation / production fail-closed | [Configuration lines 17–27](../../backend/src/main/java/com/smartrent/identity/application/DevAccountProvisioningConfiguration.java); static bean-factory guard rejects any profile outside dev/test before bean instantiation. [Tests lines 60–67](../../backend/src/test/java/com/smartrent/identity/DevAccountProvisioningConfigurationTests.java) include `dev,prod`, `test,prod`, `dev,test,prod`, prod, staging mix, no active profile and foundation-test. | PASS. Production with the feature disabled stays unseeded; enabling in a forbidden/mixed profile fails startup. |
| Explicit enable and missing settings | `application.yml` defaults enable to false; context tests cover default/explicit false, all four missing fields, both placeholder cases and allowed dev/test combinations. | PASS; mock repository receives no calls in invalid/disabled contexts. This does not claim a whole invalid Boot application never validates Flyway metadata. |
| Argon2id / delegation | [PasswordHashingConfiguration lines 15–17](../../backend/src/main/java/com/smartrent/identity/application/PasswordHashingConfiguration.java): `{argon2id-v1}`, salt16/hash32, 19456 KiB, iterations2, p1. Real persisted values match. Hash tests reject wrong passwords, plaintext, `{noop}` and unknown version. | PASS, no algorithm/parameter change. B02 must reuse this bean/version, not replace it with the default factory's different ID registry. |
| Secrets / diagnostics | Account.toString redacts credentials/email; no controller/entity response added; safe exceptions name only the fixed slot or variable. Normal/failure tests inspect captured output and stack traces. | PASS for exercised paths; debug/property dumps or privileged process inspection are not prevented by these tests. |
| Idempotency / collisions | [Provisioner lines 21–40](../../backend/src/main/java/com/smartrent/identity/application/DevAccountProvisioner.java) checks fixed email + expected role/password; existing matches have no update path, including inactive records. | PASS, full seven-column snapshots remain equal after rerun. Conflicts do not reset/claim identities. |
| Atomicity / rollback | One proxied application transaction, runtime conflict rolls back prior flushed inserts. PostgreSQL tests intentionally conflict on the last slot. | PASS, password/role/unknown-encoding failures retain preexisting rows and remove all earlier batch inserts. |
| Concurrent / lock lifetime | [JPA adapter lines 19–23](../../backend/src/main/java/com/smartrent/identity/persistence/JpaAccountAdapter.java) uses `pg_advisory_xact_lock`. [Tests lines 210–271](../../backend/src/test/java/com/smartrent/identity/DevAccountProvisioningTests.java) observe a waiting lock in pg_locks, verify no early inserts, release it and complete; independently acquire the lock after success/rollback and retry safely. | PASS on PostgreSQL, in addition to two simultaneous successful callers. Lock serializes cooperating provisioners only; the DB unique key remains the backstop for unrelated writers. |
| Runtime privileges / schema | Unchanged bootstrap roles and V1 grant only users SELECT/INSERT/UPDATE to runtime; Flyway uses its own role. Existing privilege/JPA/schema/Flyway tests all rerun. | PASS. No runtime schema-owner/superuser access or new D03 fields. |
| Existing users / timestamps | Inactive identity and unrelated account snapshots compared across all seven stored columns, including hashes/timestamps; no JPA update on matching users. | PASS. Four fixed seed slots does not mean deleting other users to force total count four. |
| V1 / B02 compatibility | V1 byte hash matches HEAD and prior baseline; only V1 remains. Same users schema/roles and versioned encoding. No public API or authentication security-chain change. | PASS for B01 schema/encoder compatibility. B02 login/JWT behavior is NOT IMPLEMENTED and cannot be reported passing. |

Lock lifetime and custom DelegatingPasswordEncoder behavior were cross-checked
against [PostgreSQL 17 advisory locks](https://www.postgresql.org/docs/17/explicit-locking.html#ADVISORY-LOCKS)
and [Spring Security 6.5 password storage](https://docs.spring.io/spring-security/reference/6.5/features/authentication/password-storage.html).

## Fresh verification

From `backend/`, JDK 21.0.12.1, Maven Wrapper 3.9.16, Docker Desktop Linux daemon:

```sh
export JAVA_HOME=/home/atuna/SmartRent/.local/toolchains/jdk-21.0.12.1+1
export MAVEN_USER_HOME=/home/atuna/SmartRent/.local/maven
./mvnw --settings ../.local/ide/maven-settings.xml --batch-mode --no-transfer-progress \
  -Dtest=DevAccountProvisioningConfigurationTests,DevAccountProvisioningTests,PasswordHashingTests test
./mvnw --settings ../.local/ide/maven-settings.xml --batch-mode --no-transfer-progress verify
```

| Check | Executed result |
|---|---|
| Focused final B01 tests | **32 tests, 0 failures/errors/skipped; BUILD SUCCESS** |
| Full final backend verify | **54 tests, 0 failures/errors/skipped; BUILD SUCCESS**, 12.408 seconds; finished 2026-10-25 16:56:28 +07:00 |
| Retained C6-01/C6-03 checks | All 22 passed in the full run |
| PostgreSQL B01 integration | 10 passed with ephemeral PostgreSQL 17.11 and real runtime/migration role separation |
| Configuration / hashing | 18 + 4 passed; includes mixed prod profiles, safe missing/placeholder failures, hash version rejection |
| Argon2id benchmark | Same parameters; five-sample median encode **19.62 ms**, verify **20.72 ms**; development measurement only |

Reports: `backend/target/surefire-reports/` (ignored). Session logs:
`/tmp/smartrent-b01-review-red.log`, `/tmp/smartrent-b01-review-focused.log`,
`/tmp/smartrent-b01-review-verify.log`. The initial 47-test evidence remains in
[B01 implementation history](c6-04-dev-account-provisioning.md); current docs now
report 54. Byte Buddy dynamic-agent warnings persist without test failures.

## Files changed by this review

- Production fix: `identity/application/DevAccountProvisioningConfiguration.java`.
- Tests: `DevAccountProvisioningConfigurationTests`, `DevAccountProvisioningTests`,
  `PasswordHashingTests` (seven additional cases overall).
- Documentation: root/backend README, workflow, roadmap, readiness, Chapter 6
  backlog/plan, evidence index, B01 evidence and this review. Earlier Phase 0 edits
  remain identifiable through the saved pre-code snapshot.
- No V1, Compose, bootstrap, HTTP security-chain, frontend or B02 code change.

## Logical Git groups and publication decision

1. `docs(planning): finalize backend phase zero and approved G1 policy`
   — original Phase 0/G1 reviewed snapshot: audit, plan, decision register and
   baseline-status/handoff documentation. No application source.
2. `feat(identity): provision synthetic accounts safely in dev and test`
   — B01 application/config/dependency/tests, safe-placeholder fix, B01 runbook,
   current implementation status/evidence/security review and branch-name correction.

Shared Markdown files need separate hunks between these groups; never stage their
entire final versions in the first commit. No files were staged. Session-local
publication patches reconstruct these groups without changing HEAD or index;
apply/reconstruction checks and secret/diff checks are recorded below.

**GO for approval of local commits and a review PR** once the explicit Git action
is authorized. This is not permission to execute it and not approval to merge.
Hosted CI and independent human review remain PR gates. No live local-volume
provisioning, B02 auth/JWT/CORS/CSRF/rate-limit behavior, dependency CVE audit,
production capacity test or deployment was performed.

## Final Git/static preservation checks

- `git diff --check`: PASS; `git diff --cached --stat` empty. No staging or commit.
- Review covers **29 changed/new text files**, including preserved Phase 0 work;
  13 Markdown files / 171 relative references have existing file targets, balanced
  fenced blocks and no whitespace/conflict-marker errors. Anchor rendering,
  external URL availability and Mermaid rendering are not claimed by this checker.
- Targeted scan found no changed file containing existing nonempty local `.env`
  password values, GitHub/Gemini token patterns or private-key blocks. This is a
  targeted diff scan, not a guarantee against every possible secret format.
- V1 SHA-256 remains
  `c05eefa7a01d985830792055d10f34bc0fccd5fae773054584ee86a32f972d5b`;
  actual diff confirms no V1/bootstrap/Compose/CI/security-chain edit.
- Local PostgreSQL container remains exited and named volume
  `smartrent_postgres_data` remains present. No local-volume reads/writes/startup
  were needed. All database test writes target test-owned ephemeral containers.
- Logical split: **11 Phase 0/G1 files**, **26 B01 files**, with 8 shared Markdown
  files split at their actual content boundary (29 distinct files overall).
  Session-local `/tmp/smartrent-b01-publication/01-phase0-g1.patch` and
  `/tmp/smartrent-b01-publication/02-b01-reviewed.patch` are review aids, not commits.
  Both patches pass `git apply --check --whitespace=error-all` sequentially in an
  isolated temporary directory, reproducing every final changed/new file byte-for-byte.
  The real checkout and Git index are not modified by that reconstruction check.
- A dev/test profile and enable flag cannot independently prove that an operator's
  DB URL points to a development database. Keep production credentials unavailable
  to development provisioning; no production credential/access policy was changed.
