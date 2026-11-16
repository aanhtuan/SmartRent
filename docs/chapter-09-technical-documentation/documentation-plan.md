# Chapter 9 — Technical documentation plan

Status: planned deliverables, not completed runbooks. Update with every owning task; see [roadmap](../project-roadmap.md).

- README: actual implemented status, prerequisites, pinned versions, local commands, test commands and known limitations.
- Architecture: module/layer ownership, public module interfaces, dependency direction, AI trust boundary and accepted decision history.
- API: source-qualified FR mapping, DTO examples, auth/ownership, errors, pagination, preview/confirm/idempotency and historical visibility.
- Database: actual Flyway versions, schema/FKs/indexes, business invariants, upgrade/backup/restore assumptions; never rewrite applied migrations.
- Operations: local Compose, environment variable placeholders, safe provisioning, health/readiness, logs/correlation, provider timeout/fallback, deployment/rollback prerequisites when authorized.
- Security: token/role/resource scope, least privilege, redaction/egress policy and negative test evidence; do not publish credentials or real tenant data.
- Demo: reproducible synthetic fixtures and journeys, expected failures, mocked versus live AI clearly separated.
- CS2028: real Context/Prompt/Output/Review/Refinement/Final Result records and verification references.

Owner is the task implementer; reviewer checks documentation against the actual code/commands. G5 requires a clean local reproduction by a reviewer or an explicit unverified limitation. Do not mark production deployment, restore/recovery or live provider behavior as verified until performed within authorized scope.
