# SmartRent backend

One Java 21 / Spring Boot modular monolith with REST APIs, PostgreSQL persistence
and a backend Gemini boundary. The current working tree implements backend slices
B01–B15. Local verification and remaining release gates are recorded in
[completion evidence](../docs/ai-evidence/backend-completion.md).
Frontend, hosted CI for this uncommitted revision, live Gemini evaluation and
deployment are not completed. Historical C6-01/C6-03 delivery remains PR #9/#10.

## Toolchain and dependencies

| Component | Pinned/resolved version |
|---|---|
| Java | 21 (Enforcer rejects other major versions) |
| Spring Boot / Framework / Security | 3.5.16 / 6.2.19 / 6.5.11 |
| Maven / Wrapper | 3.9.16 / 3.3.4 |
| PostgreSQL image | 17.11 Bookworm, SHA-256 pinned in Compose/tests |
| Hibernate / Flyway | 6.6.53.Final / 11.7.2 |
| PostgreSQL JDBC | 42.7.14 |
| Tomcat / Jackson BOM / Log4j BOM | 10.1.61 / 2.21.8 / 2.25.5 |
| Bouncy Castle | 1.86 |
| Testcontainers / JUnit / Mockito | 1.21.4 / 5.12.2 / 5.17.0 |

The four compatible patch overrides in `pom.xml` follow the actual dependency
advisory review. Boot remains 3.5.16. Two Spring Framework advisories remain in
package-level scan results; affected XSLT/SSE features are absent here. See
[dependency findings](../docs/ai-evidence/backend-completion.md#dependency-review).
No claim of an advisory-free or production-certified release is made.

## Verify and run the API demo without touching local data

Prerequisites: JDK 21, accessible Docker daemon, network for initial artifacts/images.
From `backend/`:

```sh
./mvnw --batch-mode --no-transfer-progress verify
./mvnw --batch-mode --no-transfer-progress -Dtest=BackendJourneyTests test
```

The second command runs the HTTP API demonstration as JUnit assertions against
real Spring Boot servers and ephemeral PostgreSQL, with synthetic accounts and
deterministic fake AI. It covers login, rental resources, billing, manual/AI
maintenance, notifications and Assistant. It requires no local `.env`, Compose
startup, externally supplied signing keys or live Gemini account. Test-owned keys
and databases are temporary. Reports: `target/surefire-reports/`.

For this Fedora checkout's existing toolchain/cache, the verified command is:

```sh
JAVA_HOME=/home/atuna/SmartRent/.local/toolchains/jdk-21.0.12.1+1 \
MAVEN_USER_HOME=/home/atuna/SmartRent/.local/maven \
./mvnw --settings ../.local/ide/maven-settings.xml \
  --batch-mode --no-transfer-progress verify
```

These machine-local paths are ignored and are not portable project requirements.
Tests fail rather than silently skip when Docker is unavailable. The historical
C6-01 database-free smoke profile is test-only; it is not an application deployment mode.

## Local database and normal application startup

From the repository root, create `.env` only if it does not exist:

```sh
(set -C; umask 077; cat .env.example > .env)
chmod 600 .env
```

Set three different database-role passwords and required JWT key file paths.
Preserve an existing `.env` and named volume. Java does not automatically load `.env`.
Before starting the application against a retained database, complete the backup
procedure below. The commands below describe explicit local startup; this increment's verification
used Testcontainers and did not start or migrate the retained local volume.

```sh
docker compose config --quiet
docker compose up -d --wait
docker compose ps
docker compose exec -T postgres pg_isready -U smartrent_admin -d smartrent
. ./.env
export DB_URL DB_USERNAME DB_PASSWORD DB_MIGRATION_USERNAME DB_MIGRATION_PASSWORD
export SMARTRENT_JWT_PRIVATE_KEY_FILE SMARTRENT_JWT_PUBLIC_KEY_FILE
export SMARTRENT_JWT_ISSUER SMARTRENT_JWT_AUDIENCE SMARTRENT_CORS_ORIGINS
cd backend
./mvnw --batch-mode --no-transfer-progress verify
java -jar target/smartrent-backend-0.0.1-SNAPSHOT.jar
```

Use Java 21 on PATH for `java -jar`. Normal startup requires externally configured,
matching RSA keys (PKCS#8 private PEM, X.509 public PEM, at least 2048 bits).
The application never generates default keys. For a new development-only key pair,
the following optional commands use ignored `.local/keys`; first ensure neither
target exists, as OpenSSL writes its output files:

```sh
mkdir -p .local/keys
umask 077
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out .local/keys/jwt-private.pem
openssl pkey -in .local/keys/jwt-private.pem -pubout -out .local/keys/jwt-public.pem
```

Configure absolute paths to these files. Do not regenerate or overwrite existing
keys during routine startup. These manual setup commands were not executed against
the retained local database in this increment; automated tests generate independent
keys outside Git. Missing/mismatched keys fail startup with safe messages.

In another terminal:

```sh
curl --fail --silent --show-error http://127.0.0.1:8080/actuator/health
# {"status":"UP"}
curl -i http://127.0.0.1:8080/api/users/me
# HTTP 401 with error.code UNAUTHENTICATED
```

Default listener: `127.0.0.1:8080`; choose `SERVER_PORT=8081` if necessary.
A banner alone is not readiness. Stop the foreground app with Ctrl+C. To pause
PostgreSQL use `docker compose stop postgres`; never delete/reset its named volume.
Compose passwords do not rotate existing role passwords automatically.

## Back up a retained database before applying pending migrations

Stop any backend process that could apply Flyway. Keep the existing PostgreSQL 17
container, volume and credentials. If the existing container is stopped, an operator
can run `docker compose start postgres` from the repository root; this starts the
existing container without recreating it. Do not start the new application yet.
If no existing container is found, investigate its original Compose project/context
instead of initializing a replacement. Check `docker context show` and
`docker compose ps -a` first. Never use `down -v`, reset migrations or edit V1.

From the repository root, with the existing database running and healthy:

```sh
(
  set -eu
  umask 077
  mkdir -p .local/backups
  backup_dir=$(mktemp -d "$PWD/.local/backups/pre-backend-upgrade.XXXXXXXX")
  docker compose exec -T postgres sh -c \
    'exec pg_dump --format=custom --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
    > "$backup_dir/database.dump.partial"
  test -s "$backup_dir/database.dump.partial"
  docker compose exec -T postgres pg_restore --list \
    < "$backup_dir/database.dump.partial" > "$backup_dir/archive-list.txt"
  mv "$backup_dir/database.dump.partial" "$backup_dir/database.dump"
  sha256sum "$backup_dir/database.dump" > "$backup_dir/database.dump.sha256"
  git rev-parse HEAD > "$backup_dir/base-commit.txt"
  git diff --binary -- backend/src/main/resources/db/migration \
    > "$backup_dir/tracked-migration-diff.patch"
  cp -R backend/src/main/resources/db/migration "$backup_dir/migrations"
  printf 'Backup and inventory saved in %s\n' "$backup_dir"
)
```

Check the exit status and stderr; any failure blocks the upgrade. A failed dump
remains explicitly `.partial`. These commands read the database and write only new
local backup files; `pg_restore --list` lists archive metadata without connecting
to a destination. The dump includes data, schema and Flyway history. `pg_dump`
does not include global role definitions: retain the existing secure role/bootstrap
configuration and credentials separately. Never put them in a PR or printed report.
See the PostgreSQL 17 [pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html)
and [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html) references.

Backups may contain private data and password hashes. `.local/` is ignored, but
Git ignore alone is not encryption or an off-machine backup. Store a protected
copy outside this checkout and validate the checksum. Archive listing is only a
readability check: before treating recovery as verified, restore into a separately
approved, isolated scratch PostgreSQL 17 instance, recreate the required roles,
then check Flyway history, row counts and application read access there. Never
restore into the retained database or run `--clean` as part of this procedure.

**Delivery verification has not backed up, restored, started or migrated the retained
local volume.** Automated migration tests use disposable synthetic databases.
Only after backup verification and operator acceptance should normal application
startup apply V2–V9. This procedure covers schema evolution on PostgreSQL 17;
a PostgreSQL major-version upgrade requires a separate migration/recovery plan.

## Database responsibilities and evolution

- Bootstrap `smartrent_admin` is never the application datasource.
- `smartrent_migrator` owns migrations/DDL; `smartrent_app` has table-specific
  SELECT/INSERT/UPDATE, no hard DELETE/DDL/migration-history access.
- Hibernate `ddl-auto=validate`, OSIV off. Flyway clean disabled, no baseline-on-migrate.
- V1 is immutable. V2–V8 add properties, rooms, trusted tenant assignment/profiles,
  contracts, payments, maintenance and notifications. V9 strengthens cancellation
  integrity without rewriting an already exercised V7.
- No arbitrary backfill assigns existing users to landlords. Nullable trusted
  assignment is populated only through the explicit development utility below or
  a separately authorized operational process. No public assignment endpoint exists.
- Migration tests prove V1 -> latest preserves existing UUID/email/hash/role/active
  flags/timestamps and V1 checksum. Normal startup applies pending forward migrations;
  do not point development configuration at a production database.

## Explicit dev/test account provisioning — B01/C6-04

Default disabled. Both `SMARTRENT_DEV_ACCOUNTS_ENABLED=true` and an explicit profile
of `dev`, `test`, or `dev,test` are required. Any non-dev/test profile combination,
including `dev,prod`, fails closed when the feature is enabled. All four nonblank
passwords must be supplied externally; unresolved placeholders are rejected safely.

| Fixed synthetic email | Role | Required password variable |
|---|---|---|
| `landlord.one@smartrent.test` | LANDLORD | `SMARTRENT_SEED_LANDLORD_ONE_PASSWORD` |
| `landlord.two@smartrent.test` | LANDLORD | `SMARTRENT_SEED_LANDLORD_TWO_PASSWORD` |
| `tenant.one@smartrent.test` | TENANT | `SMARTRENT_SEED_TENANT_ONE_PASSWORD` |
| `tenant.two@smartrent.test` | TENANT | `SMARTRENT_SEED_TENANT_TWO_PASSWORD` |

Export only those account-password variables by name, plus the DB/JWT variables.
Never use `set -a` to export bootstrap admin credentials to the backend. Then:

```sh
SPRING_PROFILES_ACTIVE=dev SMARTRENT_DEV_ACCOUNTS_ENABLED=true \
SMARTRENT_DEV_ASSIGNMENTS_ENABLED=true \
java -jar target/smartrent-backend-0.0.1-SNAPSHOT.jar
```

This explicit command writes synthetic accounts and assignments to the selected
development database. The separate assignments flag defaults false and maps only
Tenant One -> Landlord One and Tenant Two -> Landlord Two. It does not create
profiles, change account credentials/roles/status or overwrite existing assignments.
All enabled-profile guards reject `dev+prod`. Provisioning runs before assignments.

Argon2id `{argon2id-v1}` uses salt16/hash32 bytes, 19 MiB, two iterations, p1.
Provisioning is transactional/idempotent with an advisory lock. Matching existing
inactive users remain inactive; password/role conflicts roll back the batch.
Unrelated users remain untouched. G1 access-token TTL is 30 minutes; there is no
public registration, refresh, logout or generic user-administration endpoint.

## API behavior and security

All 33 business routes are listed in [API contracts](../design/api/README.md).
Login and status-only health are public. Other `/api` routes require bearer JWT,
then backend role and owner/relationship checks. Inactive accounts fail on each
protected request. CORS uses exact configured origins, no credentials/wildcards.
CSRF is disabled for this stateless bearer-only API; cookie/basic authentication
cannot authenticate, and relevant tests prove these conditions.

JSON uses snake_case, UUIDs, UTC timestamps and the documented error envelope.
Pagination is page >=1, page_size 1–100. DTO allowlists, strict JSON parsing and
bounded parser inputs reject privileged/unknown fields and coercion surprises.
Cross-scope objects return 404; wrong role 403; invalid shape 400; lifecycle 422.
Login limits are per process: five failures/15 minutes per IP+email and 30 attempts/
15 minutes per IP. No trusted proxy header or distributed-limiter claim is made.

Room occupancy and unpaid overdue status are derived with Asia/Ho_Chi_Minh time.
Contract writes and room/property deactivation share property/room lock order;
ACTIVE inclusive periods cannot overlap. Monthly amounts are manually entered
whole VND, without proration/banking integration; PAID is terminal.

Maintenance preserves original descriptions, explicit submission and idempotency.
An existing own identical submission returns 200 before checking current tenancy
or a renewed/expired preview; changed input reusing a key returns 409. New writes
require effective tenancy. Cancellation requires a reason; tenant/AI cannot change
lifecycle. Notifications are best-effort after commit in a separate transaction,
not durable across a crash. Delivery failure does not undo business commit.

## Gemini and preview configuration

Gemini live requests default disabled. The backend REST adapter uses the fixed
working-baseline model `gemini-3.8-flash` and v1beta generateContent route, structured
JSON output, local validation, a 10-second deadline, 2-second connection timeout,
bounded response/body/concurrency and no automatic retry/provider failover.
Model changes require task review. No live request or Vietnamese quality evaluation
was run; fake/HTTP contract tests do not prove semantic quality.

Set `SMARTRENT_PREVIEW_KEYS_FILE` to an external JSON keyring with a dedicated
base64-encoded >=32-byte HMAC key and `SMARTRENT_PREVIEW_ACTIVE_KID` to its key ID.
Keep RSA and preview keys separate and outside Git. Retain old key IDs for the
five-minute preview grace period during rotation. No working key is shipped.
Without preview signing configuration, preview is unavailable but manual submission
still works. Tokens bind actor, room, exact-input digest, state/result and expiration;
they never grant authorization. No business row/event is created by preview.

Assistant context comes only from authorized public queries, excludes names/email/
phone/address/original maintenance text, and explicitly marks its bounded context
as partial. Input text is treated as untrusted data. Pattern-based redaction of
classification text does not guarantee removal of every possible personal detail;
keep real PII out of provider inputs and approve data/retention scope before live use.

## Release boundaries

See [implementation notes and evidence](../docs/ai-evidence/backend-completion.md)
for actual commands/results, policy assumptions, dependency residuals and Git groups.
Full frontend/course completion, live Gemini quality, hosted CI at this revision,
production backup/restore and deployment are not claimed. No Git publication or
local-volume migration was performed by this implementation task.
