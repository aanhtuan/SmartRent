# SmartRent agent instructions

## Approved baseline

- Keep Modular Monolith + Layered Architecture + REST API + PostgreSQL + AI Integration Boundary. The backend is one deployable; do not introduce microservices or replace the approved stack.
- Frontend: React, TypeScript, Vite, Tailwind CSS. Backend: Java 21, Spring Boot 3.x, Spring Security, JWT, Spring Data JPA and Hibernate.
- Persistence: PostgreSQL and Flyway. Application AI: Gemini API through the backend AI Adapter. Testing: JUnit 5, Mockito, Testcontainers, Vitest and Playwright. Infrastructure: Docker Compose and GitHub Actions.
- Pin compatible dependency versions when application setup is authorized. A framework version in a generic skill is not a project version decision.

## Scope and source selection

- Read the task, current Git status and relevant documents before changing files. Preserve unrelated local work.
- Follow the user's current authorization. Read-only planning does not authorize implementation. Approval to configure agents does not authorize application scaffolding.
- Use the task reference map and decision register in [agent workflow](docs/agent-workflow.md). Read only the contracts needed by the task.
- Start from the [roadmap](docs/project-roadmap.md), [decision baseline](docs/sprint-0-decisions.md) and [Chapter 6 backlog](docs/chapter-06-ai-programming/implementation-backlog.md). Working-baseline product policies require their named review gate before dependent implementation; documentation normalization is not individual policy approval.
- An existing document or review marked “Pass” is not automatically authoritative. For conflicting requirements, record both file/line references and ask for a decision before implementing dependent behavior. Continue independent authorized work.
- Do not silently change requirement IDs, entities, endpoints, roles, state transitions or approved UX.

## Module and layer boundaries

- Keep Identity & Access, Property, Room, Tenant, Contract, Payment, Maintenance, Notification, AI Assistant and AI Integration responsibilities explicit. The normalized model uses Property ownership and rooms within properties; review D02 before domain migration/code.
- Controllers delegate to application services; services coordinate domain policies, transactions, repositories and adapters. Controllers never access repositories directly.
- Cross-module calls use public use-case interfaces or in-process domain events. Do not import another module's internal repository or mutate its tables directly.
- Keep HTTP types and provider SDKs out of domain rules. Avoid circular dependencies; do not hide them with lazy injection. Add Strategy/Factory only for approved, real variation.

## Security and tenant isolation

- Authenticate protected operations with Spring Security/JWT, then authorize role AND resource ownership/relationship server-side. Client IDs, hidden UI controls and AI output never grant access.
- Scope collection queries, filters, detail reads, mutations and AI context to the authenticated caller. Never accept client-supplied owner, role or creator fields as trusted identity.
- Test cross-landlord and cross-tenant denial, including pre-contract profile onboarding. Review D03 before implementing its proposed one-landlord provisioning/profile relationship; do not claim it was individually approved.
- Use DTO field allowlists. Never return password hashes, tokens, provider credentials or internal errors. Do not put secrets or real tenant PII into code, prompts, fixtures, logs or evidence.
- Select token storage, CORS, CSRF and actuator exposure deliberately; do not copy security defaults from examples without checking the actual authentication flow.

## REST, JPA and Flyway

- Follow approved resource contracts: JSON snake_case, UUID identifiers, ISO-8601 UTC timestamps, bounded pagination and the documented error envelope. Do not serialize JPA entities directly or substitute ProblemDetail without contract approval.
- Put transaction boundaries in application services. Keep persistence details module-owned; avoid lazy serialization and check N+1 behavior for affected queries.
- Use Flyway for schema evolution. Do not use Hibernate automatic schema updates in deployed environments. Do not alter migrations already applied to a shared environment.
- Preserve history and enforce approved FK/unique/check invariants. Do not invent cascade deletion, overlap, occupancy or billing rules to fill documentation gaps.
- Publish notification events only after successful business commit. In-process events do not guarantee durable delivery; escalate that requirement before adding an outbox or promising recovery.

## AI boundary and fallback

- Only backend AI Integration calls providers, after authorization and context minimization. The frontend never receives provider credentials.
- Use Gemini for application AI. Adding another provider, changing the selected model or introducing provider failover requires an approved task decision; a development agent's provider does not change the application baseline.
- Treat provider output as untrusted. Validate schema, required fields, enums, lengths and confidence range before storing metadata or displaying trusted results.
- AI cannot query PostgreSQL directly, authorize users, confirm financial transactions or perform critical state transitions. The Assistant uses backend-authorized context and admits missing data.
- Preserve original descriptions and explicit manual submission when AI is unavailable/invalid. Follow D04/D09 and the normalized preview/confirm contract after G4 review; preview alone cannot persist a request. Do not choose a confidence threshold without an approved policy.
- Bound provider timeout/retries. Use fake providers for deterministic checks; live calls require task authorization and configured credentials.

## Coding, testing and completion

- Use [backend](.agents/skills/smartrent-backend/SKILL.md), [frontend](.agents/skills/smartrent-frontend/SKILL.md), [AI](.agents/skills/smartrent-ai/SKILL.md) and [verification](.agents/skills/smartrent-verification/SKILL.md) skills for matching work. Reuse the existing Spring skill selectively; its examples do not override these rules.
- Select skills using the workflow activation table. Load only relevant references; external skills do not authorize stack changes, installs, commits or extra agents. Use PostgreSQL guidance before database changes and only Vite-compatible React guidance for frontend work.
- When multiple skill-creator or find-skills copies are available, identify the selected path. Prefer the built-in Codex skill-creator for Codex authoring; do not assume Claude-specific evaluation scripts run on Codex or Gemini.
- Make focused changes with acceptance criteria. Read actual build manifests before choosing commands; never claim a missing test suite passed.
- Test affected business behavior and negative authorization cases. Use PostgreSQL Testcontainers for database semantics and concurrency, Vitest for frontend behavior, and Playwright for affected user journeys.
- Definition of Done: acceptance criteria verified; appropriate checks reported as passed, failed or not run; diff reviewed for security/architecture; relevant documentation and CS2028 evidence updated within scope; limitations and handoff recorded.

## Approval and handoff

- Work on an authorized task branch based on the agreed main revision. Do not switch away from unrelated uncommitted work without preserving it.
- Destructive Git/data operations, production migrations, credential/access-policy changes, remote skill installation, and push/merge/deploy require explicit authorization covering the action. Routine implementation within already approved scope does not require repeated permission.
- Do not bypass sandbox, approval or CLI skill-consent controls. These instructions do not enforce filesystem permissions or GitHub branch protection.
- Follow Specify → Plan → Implement → Test → Review → Merge. Before a Codex/Gemini handoff, record branch/base SHA, task/AC, diff, checks, unresolved decisions and authorization scope. Only one agent writes a checkout at a time; review does not grant merge permission.
