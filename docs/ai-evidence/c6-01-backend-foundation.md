# C6-01 — Backend foundation and backend CI evidence

## Context and authorization

Date: 2026-10-09 (Asia/Ho_Chi_Minh). Base: merged main
`cbfd078b013856fefbc2db4ccdb0b3e3847b73e6`; branch: `codex/c6-01-backend-foundation`.
The checkout was clean before implementation. Tool: Codex desktop; exact model/build
identifier not independently captured. No additional agents were used.

Prompt source: the user's current chat task, “Implement C6-01 — Backend Foundation
and Backend CI.” Exact authorization excerpt:

> I authorize implementation of C6-01, including project scaffolding, required development dependency downloads, writing tests, and running local verification commands.

Task constraints: Java 21/Spring Boot 3.x Maven, feature/layer foundation, safe startup,
context test, CI and instructions. No auth endpoints, tables/migrations, business
implementation, Gemini, unrelated changes, commit/push/merge/deploy or C6-02/C6-03.
This paragraph summarizes the prompt; it is not a reconstructed historical run.

Read root rules, backend/verification/Spring skills, roadmap, decisions, Chapter 6
AC, FR-01/NFR context and Chapter 5 architecture/patterns/API conventions.

## Plan, output and refinement

- Select Boot 3.5.16 from official Maven Central release metadata and Boot 3.5 Java/Maven requirements. Use the pinned Boot parent/BOM rather than unrelated framework example versions.
- Use official Apache Maven Wrapper 3.3.4 scripts, Maven 3.9.16 and Enforcer 3.6.2. Maven distribution SHA-512 verified; derived SHA-256 pinned. Wrapper distribution matched the published SHA-1 (legacy artifact identity check, not a modern signature verification).
- Machine initially had Java 25 and no global Maven. Downloaded Temurin 21.0.12.1+1 to `/tmp`, verifying Adoptium's SHA-256; left system Java unchanged. Maven wrapper/dependency caches are also session-local under `/tmp`.
- Implement bootstrap, 10 feature boundaries with four documentation-only layer packages each, and fail-closed identity HTTP configuration. No generated default account, business beans, DB/provider dependencies or credentials.
- Default loopback listener, status-only health, no other HTTP route access, no sessions/basic/form/logout and retained CSRF. These are foundation guards, not final JWT/authentication behavior or acceptance of pending business policy.
- Implement a real embedded-server context test for health and denied requests, plus invalid configuration binding test. Package a runnable JAR.
- Pin official checkout/setup-java actions to resolved v5 commit SHAs; read-only token, no persisted credentials, Java 21, wrapper verify, scoped triggers and timeout. Validate with checksum-verified actionlint 1.7.12 in `/tmp`.
- Update only backend instructions, CI, current project/task status and this evidence/index.
- Normalize the new Windows wrapper source to LF for diff review and declare CRLF checkout via backend Git attributes; script content and Apache license are preserved.

Self-review refinement: scope was kept database-free by omitting JPA/Flyway/driver
starters until C6-03, instead of disabling their auto-configuration or adding H2.
No fake domain objects or endpoints were introduced to make smoke tests pass.
No test failure required an implementation repair. Initial sandbox network calls
failed DNS/access; downloads/builds were retried through approved escalation.
Attempts to obtain SHA-512/SHA-256 sidecars for the Wrapper distribution returned
404; its available SHA-1 was checked and is distinguished from Maven ZIP/JDK SHA-256.

## Verification commands and results

Local Maven commands ran from `backend/` with:

```sh
export JAVA_HOME='/tmp/smartrent-jdk21/jdk-21.0.12.1+1'
export MAVEN_USER_HOME=/tmp/smartrent-maven-user
# Each Maven command also used -Dmaven.repo.local=/tmp/smartrent-maven-repository
```

| Check | Actual result |
|---|---|
| Initial `java -version`; `mvn -version` | Java 25.0.4.1; global Maven absent. This was not accepted as Java 21 verification. |
| `./mvnw -version` with task JDK | PASS: Maven 3.9.16, Java 21.0.12.1, Eclipse Adoptium. |
| `./mvnw --batch-mode --no-transfer-progress dependency:go-offline` with task cache | PASS: dependencies/plugins resolved; BUILD SUCCESS. |
| `./mvnw --batch-mode --no-transfer-progress verify` with task cache | PASS: release 21 compilation, 11 tests, 0 failures/errors/skipped, executable JAR produced. |
| Context/HTTP tests within verify | PASS: actual server, health 200 and exact status-only body; eight non-health GET paths denied 403 with empty bodies/no redirects/cookies; write/logout denied; no datasource/default accounts. |
| Invalid `server.port` binding test | PASS: context fails and diagnostics identify server.port. Expected failure is asserted by a passing test. |
| Java 25 `./mvnw --offline ... validate` | EXPECTED FAILURE: exit 1; “SmartRent requires JDK 21. Set JAVA_HOME to a JDK 21 installation.” |
| `/tmp/smartrent-actionlint/actionlint .github/workflows/backend-ci.yml` | PASS: actionlint 1.7.12, exit 0. Also manually reviewed triggers, permissions, action SHAs, toolchain and command. |
| Executable JAR startup and invalid-port run | PASS: temporary local port, health 200/UP, env 403/empty, no generated password; invalid port exits 1 with APPLICATION FAILED TO START/server.port. Process stopped after check. |
| Diff/new-file/secret/link/scope review | PASS: 4 modified + 54 new files, 32 local links, tracked/new-file whitespace, YAML/XML, action pinning/permissions/command, executable wrapper, 40 documented layer packages. No common secret-pattern candidates, generated artifacts or out-of-scope changes. Targeted static scan, not a comprehensive security audit. |
| GitHub-hosted CI | NOT RUN: no commit/push authorized. Local lint/build is not a remote workflow run. |
| PostgreSQL/Flyway/Testcontainers, JWT, Gemini, frontend/E2E | NOT RUN / out of C6-01 scope; no implementation claimed. |

Boot BOM resolved Spring Framework 6.2.19, Security 6.5.11, JUnit Jupiter 5.12.2,
Mockito 5.17.0. Tests emit the upstream Mockito dynamic-agent warning on Java 21;
this is not a test failure. No permissive JVM flag was added to hide it.

## Review, acceptance and handoff

Review method: agent self-review of actual new files and tracked diffs, not independent
review. Human review of final implementation is pending; no reviewer/sign-off invented.
Module packages are documentation-only except bootstrap/security. Domain packages
contain no HTTP/JPA/provider coupling; no cross-module repositories exist. Automated
architecture enforcement for future business code is not claimed.

C6-01 normal and denied local AC are demonstrated by verify. Required toolchain
failure is actionable; malformed listener config fails fast. No DB/JWT/provider
credentials are required at this increment, so missing-credential behavior is deferred
to the owning task instead of inventing mandatory settings. Remote CI is configured
but unexecuted. Task state is IN_REVIEW, not MERGED and not full G1 completion.

Output: [backend instructions](../../backend/README.md), [CI](../../.github/workflows/backend-ci.yml),
[task status](../chapter-06-ai-programming/implementation-backlog.md) and [roadmap](../project-roadmap.md).
Detailed local test reports are in ignored `backend/target/surefire-reports/` and can be
regenerated with verify; task JDK/checker caches under `/tmp` are not shipped artifacts.

Next step: human review and explicit authorization for any commit/push/merge or next
task. No deploy, auth/database/provider setup or business-policy acceptance is implied.

## Subsequent local commit authorization

After the README review, the user authorized committing all changes since the
Sprint 0 push/merge. That authorization covers local commits on the existing
C6-01 branch only. Push, merge, deployment and subsequent implementation tasks
remain unauthorized. The original verification/authorization record above describes
the implementation session before this later permission.

## Artifact manifest

Modified (4): root `README.md`, `docs/project-roadmap.md`,
`docs/chapter-06-ai-programming/implementation-backlog.md`, `docs/ai-evidence/README.md`.

Created (54):

- `.github/workflows/backend-ci.yml`
- `backend/.gitattributes`, `backend/.gitignore`, `backend/.mvn/wrapper/maven-wrapper.properties`
- `backend/pom.xml`, `backend/mvnw`, `backend/mvnw.cmd`, `backend/README.md`
- `backend/src/main/java/com/smartrent/SmartRentApplication.java`
- `backend/src/main/java/com/smartrent/identity/api/FoundationSecurityConfiguration.java`
- `backend/src/main/resources/application.yml`
- `backend/src/test/java/com/smartrent/SmartRentApplicationTests.java`
- `backend/src/test/java/com/smartrent/ServerConfigurationTests.java`
- This evidence file, `docs/ai-evidence/c6-01-backend-foundation.md`
- 40 `package-info.java` files: every combination of the ten module names below and
  four layer names `api`, `application`, `domain`, `persistence`, under
  `backend/src/main/java/com/smartrent/<module>/<layer>/package-info.java`.
  Modules: `identity`, `property`, `room`, `tenant`, `contract`, `payment`,
  `maintenance`, `notification`, `assistant`, `aiintegration`.

Ignored/regenerable: `backend/target/` (JAR, compiled classes, Surefire reports).
Session-only validation helpers are `/tmp/smartrent-c601-runtime-check.py` and
`/tmp/smartrent-c601-static-check.py`. These are not shipped utilities; standard
`./mvnw verify` regenerates the maintained application tests, while the runtime
curl/JAR procedure is documented in the backend README.
