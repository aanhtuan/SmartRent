# SmartRent backend — C6-01 and C6-03

One Java 21 Spring Boot deployable with feature/layer boundaries. C6-01 provides
bootstrap and default-deny HTTP security. C6-03 adds local PostgreSQL, Flyway and
identity persistence only. Authentication, account provisioning, other business
modules, frontend and Gemini are not implemented.

## Toolchain and dependencies

| Component | Pinned/resolved version |
|---|---|
| Java build/runtime | 21; Maven Enforcer rejects other major versions |
| Spring Boot | 3.5.16 |
| Maven / Wrapper | 3.9.16 / 3.3.4 |
| Spring Framework / Security | 6.2.19 / 6.5.11 |
| PostgreSQL server | 17.11, official Bookworm image pinned by SHA-256 digest |
| Hibernate / JDBC | 6.6.53.Final / 42.7.11 |
| Flyway core + PostgreSQL module | 11.7.2 |
| Testcontainers | 1.21.4, test scope |
| JUnit Jupiter / Mockito | 5.12.2 / 5.17.0 |

The exact Boot parent manages Java dependencies; do not independently override
transitive versions. Wrapper distribution checksum remains pinned. PostgreSQL uses
the same image/digest in Compose and integration tests. Windows wrapper execution
has not been verified; instructions below use a POSIX shell.

Sources: [Boot BOM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/3.5.16/spring-boot-dependencies-3.5.16.pom),
[PostgreSQL image metadata](https://github.com/docker-library/official-images/blob/master/library/postgres),
[Testcontainers 1.21.4](https://github.com/testcontainers/testcontainers-java/releases/tag/1.21.4).

## Local database and startup

Prerequisites: JDK 21, Docker daemon available to this user, Docker Compose and
network access for initial downloads. Testcontainers discovers the Docker Desktop
Linux socket in the verified Fedora environment; no global Docker API override
or disabled cleanup helper was needed.

From the repository root, if `.env` does not already exist:

```sh
cp .env.example .env
chmod 600 .env
```

Edit `.env`: set three different local passwords. Empty passwords are rejected;
there are no working example credentials. If changing POSTGRES_DB or POSTGRES_PORT,
also update DB_URL. Keep the usernames in the template; local bootstrap creates
those named roles. Do not overwrite an existing `.env` or volume.

```sh
docker compose config --quiet
docker compose up -d --wait
docker compose ps
docker compose exec -T postgres pg_isready -U smartrent_admin -d smartrent
```

`pg_isready` checks listener readiness, not application authorization or schema.
The subsequent backend startup and integration tests verify real connections.
Default host exposure is `127.0.0.1:5432`; data persists in
`smartrent_postgres_data`. Role bootstrap runs only on an empty data directory.
Changing environment passwords does not rotate roles in an existing volume.

Activate JDK 21, then load backend variables only:

```sh
export JAVA_HOME=/absolute/path/to/jdk-21
export PATH="$JAVA_HOME/bin:$PATH"
. ./.env
export DB_URL DB_USERNAME DB_PASSWORD DB_MIGRATION_USERNAME DB_MIGRATION_PASSWORD
cd backend
java -version
./mvnw --version
./mvnw --batch-mode --no-transfer-progress verify
java -jar target/smartrent-backend-0.0.1-SNAPSHOT.jar
```

The approved local toolchain for this task is under ignored
`.local/toolchains/jdk-21.0.12.1+1`; it was downloaded from Adoptium and SHA-256
verified. This machine-specific installation is not shipped with the repository.
Java does not automatically read `.env`. Do not use `set -a` to export bootstrap
credentials into the application process. Local `.env` is a development credential
file, not a production secret manager; Docker administrators can inspect container
configuration. Use `config --quiet` to avoid printing interpolated secrets.

In another terminal:

```sh
curl --fail --silent --show-error http://127.0.0.1:8080/actuator/health
# {"status":"UP"}
curl -i http://127.0.0.1:8080/actuator/env
# HTTP 403, no configuration body
```

Use SERVER_PORT=8081 when another process owns 8080. Stop only your foreground
process with Ctrl+C. Restart the same JAR with the same configuration: Flyway
validates V1/checksum and applies no new migration. Hibernate validates the mapping.
To pause local PostgreSQL without deleting data, use `docker compose stop postgres`.
Never delete/reset the named volume as a routine setup or troubleshooting step.

## Database responsibilities

- `smartrent_admin`: local initialization superuser; never the backend datasource.
- `smartrent_migrator`: non-superuser, no role/database creation; schema CREATE and
  migration table ownership for Flyway.
- `smartrent_app`: non-superuser; schema USAGE and users SELECT/INSERT/UPDATE only.
  No schema CREATE, hard DELETE, or migration-history access.

Flyway and the runtime pool use separate credentials in the same backend process.
Separating deployment-time migrations into another process is not implemented.
`clean-disabled=true`, `baseline-on-migrate=false` and `validate-on-migrate=true`.
Hibernate uses `ddl-auto=validate`; Open Session in View is disabled. Missing/blank
required DB variables fail startup with a configuration name, not its secret value.

V1 creates `users` plus Flyway's own history table. Identity columns are UUID id,
canonical email, password_hash, role, is_active, created_at and updated_at. Email
identity is trimmed/lowercase with UNIQUE and a canonical CHECK; backend-generated
UUID and string roles LANDLORD/TENANT follow the approved C6-03 decision. Passwords
must be hashed by the future provisioning/authentication task; no passwords or
accounts are seeded here. JPA timestamps use Instant and lifecycle callbacks.

D03 provisioning columns and all other domain tables are excluded. The full ERD
remains target design. Do not edit an applied V1; add approved forward migrations.

## Verification

From `backend/`, using JDK 21 and an accessible Docker daemon:

```sh
./mvnw --batch-mode --no-transfer-progress verify
```

`verify` resolves required dependencies as needed. `dependency:go-offline` is an
optional prefetch command, not a prerequisite or evidence that tests passed.

Current suite: 22 tests, including:

- 11 retained C6-01 HTTP/config tests. A **test-only** foundation profile excludes
  datasource/JPA/Flyway so the original no-datasource invariant remains meaningful.
- 6 PostgreSQL integration tests: V1 on a fresh ephemeral database, identity-only
  column inventory, JPA round-trip/timestamps, canonical/unique email and role/null
  constraints, limited runtime privileges, migration/checksum validation on repeat.
- 5 parameterized configuration tests, each checking blank and unresolved values.

Integration tests use separate ephemeral Testcontainers, never the local named
volume. They do not silently skip when Docker is unavailable. Only test-owned
containers are automatically cleaned up; local persistent data is preserved.
Reports are under ignored `target/surefire-reports/`.

[Backend CI](../.github/workflows/backend-ci.yml) uses Java 21 and wrapper verify,
with path triggers including database bootstrap/Compose changes. GitHub runners
provide Docker; no Compose credentials or live database is used by CI tests.
C6-01 hosted CI passed in PR #9; C6-03 changes have not been pushed or run remotely.

## Architecture and security

The ten feature modules retain api/application/domain/persistence packages.
Identity persistence owns UserRecord, UserRole and DB configuration guards;
no controller, repository API or authentication service was introduced. Cross-module
internal repositories remain forbidden. Domain packages have no HTTP/JPA/provider
coupling. Runtime module isolation is not proved by documentation-only packages.

Only GET health is public, with status only. All other HTTP requests remain denied;
no default account/basic/form login/logout/session is enabled. CSRF remains enabled.
JWT/CORS policy and business ownership checks belong to subsequent reviewed tasks.

See [task backlog](../docs/chapter-06-ai-programming/implementation-backlog.md),
[C6-03 evidence](../docs/ai-evidence/c6-03-database-foundation.md),
[decision register](../docs/sprint-0-decisions.md) and [root rules](../AGENTS.md).
