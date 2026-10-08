---
name: smartrent-verification
description: Verify SmartRent changes against acceptance criteria and prepare test, review, and handoff evidence.
---

# SmartRent verification

Activate when verifying a task, reviewing a diff, making completion claims or preparing a PR/handoff. Read [root rules](../../../AGENTS.md) and [agent workflow](../../../docs/agent-workflow.md), then the task AC and only the affected contracts. Use this as the SmartRent verification entry point; verification-before-completion is supplementary guidance, not a reason to repeat already relevant checks without new evidence.

## Establish what changed

Record branch/base SHA and inspect Git status/diff, including untracked files. Separate pre-existing changes from task changes. Locate application manifests and available tools before choosing checks. Do not install dependencies or rewrite configuration merely to make an unapproved check runnable.

Map each AC to an observable test or review result. If conflicting sources prevent an expected result from being defined, report a blocked decision rather than inventing behavior or declaring a pass.

Check the [roadmap](../../../docs/project-roadmap.md), [decision gates](../../../docs/sprint-0-decisions.md) and owning backlog task. Documentation consistency does not approve a working-baseline product policy, prove application execution or advance a runtime gate. Keep template evidence separate from actual model/test runs.

## Choose meaningful gates

- Backend policies/API: JUnit 5, Mockito and Spring API/security tests for normal and denied behavior.
- Persistence: PostgreSQL Testcontainers for Flyway, FK/unique/check constraints, scoped queries, rollback and race conditions. An in-memory database is not evidence of PostgreSQL-specific correctness.
- Frontend: project TypeScript/lint checks and Vitest; Playwright for affected user journeys with loading, errors and fallback.
- AI: fake-provider failure/schema/isolation tests and approved evaluation fixtures. Separate live smoke tests from reproducible CI.
- Agent configuration: validate YAML frontmatter/JSON, relative references, discovery and consistency. Distinguish a legacy skill warning from failure in new files; do not repair unrelated skills without authorization.
- Skill changes: verify task routing and generic-example limits, including Gemini-only application integration and the approved Java/PostgreSQL/Vite stack. For backend/AI changes, review cross-landlord access, applied-migration edits, conflicting preview/persistence requirements, prompt injection, missing information and provider timeout scenarios as applicable. Metadata validation is not a behavioral evaluation; report scenario review separately from actual agent runs.
- Security: inspect cross-tenant access, mass assignment, token handling, provider egress and secrets in the affected diff. Check authorization before AI/data access and notification after commit where relevant.

Use build commands actually present in the repository. Configuration-only work does not justify inventing application tests or scaffolding code. Formatting checks cannot prove business correctness; coverage percentage cannot replace critical scenarios.

## Review and report

Review the actual diff independently of the implementer's summary. Prioritize actionable correctness, authorization, data integrity and architecture findings with severity, file/line evidence and a reproducible scenario when possible.

Before claiming completion, run the relevant available checks on the final state and inspect their results. For each check report passed, failed or not run, exact command, environment and relevant output. Prior results, a proposed command or another model's agreement are not fresh execution evidence. List unverified runtime behavior and remaining decisions. Capture CS2028 prompt/review/iteration evidence and the handoff fields from the workflow. Verification or another agent's approval never authorizes push, merge or deployment.
