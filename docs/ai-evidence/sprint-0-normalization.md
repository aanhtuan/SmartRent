# Sprint 0 — Documentation normalization evidence

Date: 2026-10-09. Agent/tool: Codex session; exact underlying model not asserted. Base SHA: `35ce3aa1a7a13a03a255ef9a41311f1eaae48d64`. Existing local agent/skill configuration and modified skills-lock.json predate this task.

## Context and request

The read-only audit found API conflict markers, FR/UML/schema inconsistencies, preview/persistence disagreement, undefined profile/contract/billing policies and stale review/evidence claims. The user then requested: “fix tất cả nội dung trước đó kiểm soát road map theo chuẩn lộ trình ai end to end và dùng các skill chuẩn hoá toàn bộ lên được road map chuẩn chỉnh để bắt đầu”. This authorizes documentation remediation; individual new business-policy acceptance is not inferred.

## Output and refinement

Current artifacts: [roadmap](../project-roadmap.md), [decision register](../sprint-0-decisions.md), [Chapter 6 backlog](../chapter-06-ai-programming/implementation-backlog.md), Chapter 7–9 plans and aligned product/design documents. Changes are reviewable in the working tree; no commit/PR is claimed. Generic planning/framework instructions were constrained by project scope; no extra skills installed or automatic agents launched.

Review method: agent self-review against source contracts and audit findings. No independent/human review of the final diff has occurred yet. Working-baseline policy gates remain explicit. Refinements and check results are recorded below after execution.

## Verification

Commands actually run:

- `python3 -B /tmp/check-smartrent-docs.py`: initial failure for six missing end-of-file newlines; after repair, PASS for FR coverage/order, WF mapping, task IDs, links, fences, instruction consistency, change scope and protected external Markdown/JSON/config preservation. Checker is session-local; not a shipped project utility.
- `python3 -B /home/atuna/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/smartrent-<backend|frontend|ai|verification>`: invoked separately for all four folders, each returned `Skill is valid!`. This notation summarizes the four actual invocations; it is not a literal shell command.
- `git diff --check`: PASS; tracked changes only. Untracked documents were included by the temporary static checker.

Self-review refinements: corrected create orchestration to separate preview/confirm; unified out-of-scope disclosure responses; clarified manual failure confirmation, embedded AI metadata, derived occupancy/overdue and absence of full status history; repaired prompt newlines. No independent/human final review has occurred. No application build/runtime/CLI activation/live AI evaluation or deployment has been run; Mermaid rendering remains unverified. No historical prompt run or model output is fabricated.


## Artifact manifest for this task

64 Markdown/configuration artifacts changed or created. External installed skills, skills-lock.json and Gemini workspace settings were not edited. No application source was scaffolded.

- `.agents/skills/smartrent-ai/SKILL.md` — updated
- `.agents/skills/smartrent-backend/SKILL.md` — updated
- `.agents/skills/smartrent-frontend/SKILL.md` — updated
- `.agents/skills/smartrent-verification/SKILL.md` — updated
- `AGENTS.md` — updated
- `README.md` — updated
- `demo/chapter-05/README.md` — updated
- `design/api/authentication-api.md` — updated
- `design/api/contract-api.md` — updated
- `design/api/maintenance-api.md` — updated
- `design/api/notification-api.md` — updated
- `design/api/payment-api.md` — updated
- `design/api/property-api.md` — updated
- `design/api/room-api.md` — updated
- `design/architecture/smartrent-architecture.md` — updated
- `design/database/erd.md` — updated
- `design/database/schema.md` — updated
- `design/design-reviews/maintenance-request-ai-review.md` — updated
- `design/prototypes/maintenance-request-prototype.md` — updated
- `design/uml/class-model.md` — updated
- `design/uml/data-model-overview.md` — updated
- `design/uml/maintenance-sequence.md` — updated
- `design/uml/use-case-model.md` — updated
- `design/user-flows/smartrent-maintenance-flow.md` — updated
- `design/wireframes/maintenance-request-wireframe.md` — updated
- `docs/agent-workflow.md` — updated
- `docs/ai-evidence/README.md` — created
- `docs/ai-evidence/sprint-0-normalization.md` — created
- `docs/chapter-03-requirement-analysis/02-PRD.md` — updated
- `docs/chapter-03-requirement-analysis/03-requirement-analysis.md` — updated
- `docs/chapter-03-requirement-analysis/04-user-stories.md` — updated
- `docs/chapter-03-requirement-analysis/05-feature-specification.md` — updated
- `docs/chapter-04-product-design/01-user-flow.md` — updated
- `docs/chapter-04-product-design/02-wireframe.md` — updated
- `docs/chapter-04-product-design/03-prototype.md` — updated
- `docs/chapter-04-product-design/04-ai-design-review.md` — updated
- `docs/chapter-05-software-architecture/01-architecture-design.md` — updated
- `docs/chapter-05-software-architecture/02-architecture-patterns.md` — updated
- `docs/chapter-05-software-architecture/03-system-modeling-uml.md` — updated
- `docs/chapter-05-software-architecture/04-database-design.md` — updated
- `docs/chapter-05-software-architecture/05-api-design.md` — updated
- `docs/chapter-05-software-architecture/06-design-patterns.md` — updated
- `docs/chapter-05-software-architecture/chapter-05-review.md` — updated
- `docs/chapter-06-ai-programming/implementation-backlog.md` — created
- `docs/chapter-07-code-review-refactoring/review-plan.md` — created
- `docs/chapter-08-software-testing/test-strategy.md` — created
- `docs/chapter-09-technical-documentation/documentation-plan.md` — created
- `docs/implementation-readiness.md` — created
- `docs/project-roadmap.md` — created
- `docs/sprint-0-decisions.md` — created
- `prompts/chapter-03/feature-prompts.md` — updated
- `prompts/chapter-03/prd-prompts.md` — updated
- `prompts/chapter-03/product-discovery-prompts.md` — updated
- `prompts/chapter-03/requirement-prompts.md` — updated
- `prompts/chapter-04/design-review-prompts.md` — updated
- `prompts/chapter-04/prototype-prompts.md` — updated
- `prompts/chapter-04/user-flow-prompts.md` — updated
- `prompts/chapter-04/wireframe-prompts.md` — updated
- `prompts/chapter-05/api-prompts.md` — updated
- `prompts/chapter-05/architecture-pattern-prompts.md` — updated
- `prompts/chapter-05/architecture-prompts.md` — updated
- `prompts/chapter-05/database-prompts.md` — updated
- `prompts/chapter-05/design-pattern-prompts.md` — updated
- `prompts/chapter-05/uml-prompts.md` — updated
