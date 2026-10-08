# SmartRent backend — C6-01 foundation

One Java backend deployable, organized as a feature-based Modular Monolith with API,
application, domain and persistence boundaries. This increment provides bootstrap,
fail-closed HTTP security, an operational health check and build/test infrastructure.
Authentication, database infrastructure, business behavior and Gemini are not implemented.

## Toolchain and dependencies

| Component | Pinned selection |
|---|---|
| Java language/build runtime | JDK 21; Maven rejects other major versions |
| Spring Boot parent and starters | 3.5.16 |
| Maven / Wrapper scripts | 3.9.16 / 3.3.4, only-script distribution |
| Maven Enforcer | 3.6.2 |
| Spring Framework / Spring Security | 6.2.19 / 6.5.11, managed by Boot |
| JUnit Jupiter / Mockito | 5.12.2 / 5.17.0, managed by Boot starter-test |

The exact Boot parent/BOM manages compatible runtime, test and build-plugin versions;
do not independently upgrade transitive dependencies without compatibility review.
Starters are web, security, actuator and test. JPA/Hibernate, PostgreSQL, Flyway and
Testcontainers remain approved stack components but are introduced with database work
in C6-03; no H2 substitute or disabled datasource auto-configuration is needed here.

Sources: [Boot 3.5 requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html),
[Maven Central Boot releases](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/maven-metadata.xml),
[Maven Wrapper](https://maven.apache.org/tools/wrapper/index.html).
Wrapper scripts are from the official Apache 3.3.4 only-script distribution. The Maven
ZIP has a pinned SHA-256 in wrapper properties, calculated after checking its published
SHA-512. Windows PowerShell also uses the official wrapper script; Windows execution
has not been verified in this Linux task. Wrapper source text is normalized to LF
for review; Git attributes restore CRLF for the Windows script on checkout.

## Build and run

Install/provide a JDK 21 and point `JAVA_HOME` to it. Global Maven is unnecessary.
Run from the repository root:

```sh
cd backend
export JAVA_HOME=/absolute/path/to/jdk-21
export PATH="$JAVA_HOME/bin:$PATH"
java -version
./mvnw --version
./mvnw --batch-mode --no-transfer-progress dependency:go-offline
./mvnw --batch-mode --no-transfer-progress verify
java -jar target/smartrent-backend-0.0.1-SNAPSHOT.jar
```

First use downloads Maven and dependencies; subsequent builds use the local Maven
cache. `verify` compiles, runs tests and builds an executable Spring Boot JAR.
Use `mvnw.cmd` in a Windows shell. Stop the foreground application with Ctrl+C.

In another terminal:

```sh
curl --fail http://127.0.0.1:8080/actuator/health
# {"status":"UP"}
curl -i http://127.0.0.1:8080/actuator/env
# HTTP 403, no configuration body
```

`UP` describes this foundation process; it does not prove database, authentication,
AI or business readiness. The real-server smoke tests use an OS-assigned port.

## Runtime configuration and security

| Environment variable | Default | Meaning |
|---|---|---|
| `JAVA_HOME` | Wrapper can discover Java on PATH | Must resolve to JDK 21; Enforcer explains incompatible Java |
| `SERVER_ADDRESS` | `127.0.0.1` | Local-only listener; explicitly select another interface when authorized |
| `SERVER_PORT` | `8080` | Numeric HTTP listener port; invalid text fails property binding at startup |

No database/JWT/provider secret is required or accepted by application-specific
configuration yet. Missing optional listener settings use safe local defaults. Missing
JDK 21 is an actionable build failure; invalid server configuration is a startup failure.
Later tasks must define and validate their required credentials instead of adding
working secrets or permissive fallback profiles here. Do not commit `.env` files.

- Only GET `/actuator/health` is permitted, with status only; other actuator access is disabled.
- Every other HTTP request is denied, including config/heapdump, business paths,
  login and logout. Foundation denial is HTTP 403; it is not the future JWT/error API.
- No generated default account, basic authentication, form login, logout route,
  request cache or HTTP session is provided. CSRF protection remains enabled.
- JWT algorithms/keys, CORS origins, bearer error mapping and final CSRF policy belong
  to the separately reviewed authentication task. No business authorization is claimed.
- Error messages, exceptions, binding details and stack traces are excluded from HTTP
  error output. Circular references and bean overriding are disabled.
- Configuration remains operator-controlled; these defaults do not replace runtime
  access control, secret management or deployment review.

## Package boundaries

```text
com.smartrent
  SmartRentApplication
  identity / property / room / tenant / contract / payment
  maintenance / notification / assistant / aiintegration
    api / application / domain / persistence
```

Each feature has documentation-only `package-info.java` files for the four boundaries.
Only `identity.api.FoundationSecurityConfiguration` contains an HTTP security bean.
No placeholder business controllers, repositories, entities or services are generated.

| Boundary | Responsibility and allowed direction |
|---|---|
| api | HTTP/DTO mapping; delegate to application; no direct repositories |
| application | Public use cases, authorization orchestration and transactions; depend on domain/ports |
| domain | Business policies/value types; no Spring MVC, JPA or provider SDK coupling |
| persistence | Module-owned adapters implementing ports; no other module's internal repositories/tables |

Cross-feature calls use public application interfaces or in-process events. Provider
SDKs will stay in `aiintegration` adapters, never domain or API classes. Package
boundaries are a foundation convention; runtime module isolation is not yet proven
by business code or automated architecture tests.

## CI and review

[Backend CI](../.github/workflows/backend-ci.yml) runs on backend/workflow push or PR
changes, and manual dispatch. It selects Temurin Java 21 and runs the same wrapper
`verify` command, with read-only contents permission, no persisted checkout credentials,
SHA-pinned official actions, concurrency cancellation and a 15-minute timeout.
No secrets, database services or provider calls are required. Remote CI execution
requires a separately authorized push; local workflow lint is not a GitHub run.

See [task backlog](../docs/chapter-06-ai-programming/implementation-backlog.md),
[C6-01 evidence](../docs/ai-evidence/c6-01-backend-foundation.md) and
[root rules](../AGENTS.md). Product decisions D02–D10 are not accepted by this scaffold.
