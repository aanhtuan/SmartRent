---
name: smartrent-backend
description: Implement or review SmartRent APIs, ownership authorization, JPA persistence, and Flyway migrations.
---

# SmartRent backend

Activate for backend API/use-case implementation or review, authorization, persistence and migration tasks. Read [root rules](../../../AGENTS.md) and the relevant parts of [agent workflow](../../../docs/agent-workflow.md). Add the AI skill when a use case crosses the Gemini Adapter boundary.

## Select the contract

Read the relevant requirement/story in [Chapter 3](../../../docs/chapter-03-requirement-analysis/), the [architecture](../../../docs/chapter-05-software-architecture/01-architecture-design.md), the resource-specific [API design](../../../design/api/), and affected tables in the [schema](../../../design/database/schema.md). Include Chapter 4 when a backend change affects UX timing.

Read the [decision baseline](../../../docs/sprint-0-decisions.md) and [backlog](../../../docs/chapter-06-ai-programming/implementation-backlog.md). Canonical IDs/model/API references are normalized; new profile, lifecycle, overlap, billing and preview policies remain working baseline until their named review gate passes. Do not turn a proposed policy into an implementation/test expectation before that review. Record any new contradiction with both sources.

## Implement within module ownership

- Use Java 21/Spring Boot 3.x; keep controllers, DTOs, application services, policies and persistence responsibilities separate inside each module.
- Reuse [java-spring-boot](../java-spring-boot/SKILL.md) for relevant framework guidance. Its Long IDs, entity responses, ProblemDetail, CSRF defaults, Spring version and generic user endpoints are examples, not SmartRent contracts. Its configuration validator is not an application test.
- Resolve dependency cycles through module responsibilities and public interfaces; do not copy lazy injection as a workaround. Select CSRF/CORS behavior for the approved authentication flow rather than copying a generic JWT example.
- Derive actor identity from the authenticated context. Use ownership-scoped queries for lists and filters as well as individual records; reject mass assignment of privileged fields.
- Map UUIDs, snake_case DTOs, approved pagination and error envelopes explicitly. Maintain domain policies in one place rather than duplicating them across controllers.
- Keep transactions around business writes; avoid holding database transactions open during provider network calls. Recheck mutable eligibility before committing when it may have changed during AI processing.
- Use public module use cases for cross-module relationships. Apply approved database constraints with Flyway; preserve applied migrations and history. Do not introduce a generic repository that bypasses ownership.
- Before database changes, read the applicable [PostgreSQL guidance](../supabase-postgres-best-practices/SKILL.md). Keep PostgreSQL/JPA/Flyway; do not introduce Supabase Auth or auth.uid() from examples. Any proposed RLS policy complements server-side ownership checks and requires an approved design.

## Verify and hand off

Use JUnit 5/Mockito for policy and use-case behavior; Spring API tests for contracts/security; PostgreSQL Testcontainers for constraints, query scope, migrations and concurrent operations. Select actual commands from build manifests once present.

Include denied access, invalid lifecycle, rollback and after-commit notification cases for affected flows. Report commands/results, unresolved assumptions and remaining runtime checks using the workflow handoff format.
