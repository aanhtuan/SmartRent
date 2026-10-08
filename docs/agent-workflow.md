# SmartRent agent development workflow

## Scope and entry points

This workflow governs repository-local Codex/Gemini collaboration. [AGENTS.md](../AGENTS.md) contains shared rules; [.gemini/settings.json](../.gemini/settings.json) configures Gemini to read AGENTS.md as context. Shared skills live in `.agents/skills/` and are loaded for matching tasks.

The approved stack is React/TypeScript/Vite/Tailwind CSS, Java 21/Spring Boot 3.x, Spring Security/JWT, JPA/Hibernate/PostgreSQL/Flyway, Gemini API through the backend AI Adapter, JUnit 5/Mockito/Testcontainers, Vitest/Playwright, Docker Compose and GitHub Actions. Keep one modular backend deployable with layered responsibilities. Codex/Gemini development tooling does not authorize another application AI provider.

Agent-environment setup does not authorize application scaffolding, dependency installation, changes to product documentation, provider calls or production actions. Instruction files complement CLI sandbox/consent controls; they do not enforce access permissions.

## Select skills for the task

Use the smallest relevant set; activation means reading applicable instructions, not installing tools or executing every example. Root rules and approved task contracts govern conflicts with generic guidance.

| Task trigger | Primary skill | Additional guidance and limits |
|---|---|---|
| API, service, authorization or JPA implementation/review | [smartrent-backend](../.agents/skills/smartrent-backend/SKILL.md) | Read [java-spring-boot](../.agents/skills/java-spring-boot/SKILL.md) only for relevant framework questions; generic DTO/security/version examples do not set contracts. |
| Schema, migration, SQL, indexes, locking or data isolation diagnosis | smartrent-backend | Read [supabase-postgres-best-practices](../.agents/skills/supabase-postgres-best-practices/SKILL.md) before database changes. Apply PostgreSQL guidance; do not introduce Supabase Auth, hosted services or auth.uid() dependencies. RLS does not replace application ownership checks. |
| React/Vite screens, typed API interactions or UX | [smartrent-frontend](../.agents/skills/smartrent-frontend/SKILL.md) | Use [vercel-react-best-practices](../.agents/skills/vercel-react-best-practices/SKILL.md) for applicable React rendering/bundle guidance; exclude Next.js APIs, RSC and server actions. Do not add dependencies merely to copy an example. |
| Gemini Adapter, classification, Assistant or AI quality evaluation | [smartrent-ai](../.agents/skills/smartrent-ai/SKILL.md) | Consult task-specific official Gemini API documentation for Java/REST. Do not automatically choose models, add providers or run live calls. |
| Testing, diff review, completion claims or handoff | [smartrent-verification](../.agents/skills/smartrent-verification/SKILL.md) | [verification-before-completion](../.agents/skills/verification-before-completion/SKILL.md) is supplementary; avoid duplicating the same checks without a reason. |
| Skill discovery or a demonstrated capability gap | [find-skills](../.agents/skills/find-skills/SKILL.md) | Inspect skills.sh and source content first. Remote installation/update requires approval; downloads and reputation do not establish safety. |
| Create or revise a repository skill | Available built-in Codex skill-creator, selected by its exact path | The [repository Anthropic copy](../.agents/skills/skill-creator/SKILL.md) is optional design/evaluation reference; inspect Claude CLI dependencies before running scripts. Do not reinitialize existing skills. |

Use Specify/Plan below for ordinary planning. The installed [writing-plans](../.agents/skills/writing-plans/SKILL.md) is optional and references other Superpowers skills; do not install those, delegate, create extra plan files or commit merely because its template requests it. Preserve all installed skills unless removal is separately approved.

## Select task-specific references

| Task | Read before implementation |
|---|---|
| Product/domain behavior | Relevant [PRD](chapter-03-requirement-analysis/02-PRD.md), [analysis](chapter-03-requirement-analysis/03-requirement-analysis.md), [stories/AC](chapter-03-requirement-analysis/04-user-stories.md) and [feature specification](chapter-03-requirement-analysis/05-feature-specification.md). |
| Backend/API/database | Relevant Chapter 3 sources, [architecture](chapter-05-software-architecture/01-architecture-design.md), [API conventions](chapter-05-software-architecture/05-api-design.md), resource artifact in [design/api](../design/api/) and affected [schema](../design/database/schema.md). |
| Frontend | Relevant Chapter 3 AC, [Chapter 4](chapter-04-product-design/), [wireframe](../design/wireframes/maintenance-request-wireframe.md), [prototype](../design/prototypes/maintenance-request-prototype.md) and affected API. |
| AI | Relevant F-01/F-02, architecture AI boundary, Maintenance/Assistant API, UX timing and task-specific [prompts](../prompts/). |
| Review/testing | Task AC, actual diff/manifests, affected contracts and prior findings; do not treat prior review conclusions as proof. |

Reference requirement IDs together with their names and source paths because PRD and Analysis currently use different numbering. Link to the exact revision in evidence where possible. A design document describes intent, not an implemented feature.

## Baseline and implementation readiness

The earlier main audit is captured in [readiness](implementation-readiness.md). Documentation normalization removed merge markers and aligned IDs/model/preview references. New policy details are in [decision register](sprint-0-decisions.md); review gates there replace the old blanket unresolved/conflict list. Do not confuse consistency of a working baseline with individual Product Owner approval or runtime verification.

Use [project roadmap](project-roadmap.md) for sprint/gate ownership and [Chapter 6 backlog](chapter-06-ai-programming/implementation-backlog.md) for the executable task contract. A new contradiction is recorded with file/line and blocks dependent work only. Foundation tasks can start under authorized scope while G2–G4 business reviews remain pending.

## Specify

Create the task specification in the authorized issue/chat/PR; add repository task files only when approved. Use this template:

```text
Task ID / title:
Goal and user-visible outcome:
Base branch and commit:
References: requirement ID + name + source; relevant US/AC/API/schema/UX
In scope / out of scope:
Dependencies and approved decisions:
Acceptance criteria: observable normal, denied and failure scenarios
Expected files/modules:
Verification plan and required tools:
Authorization scope and actions requiring separate permission:
Open questions:
```

A task is ready when acceptance criteria and affected contracts are coherent. Mark assumptions explicitly. Do not use an assumed rule as a test expectation without approval.

## Plan

Inspect the working tree and relevant sources; identify existing user changes. Select the matching skill(s), affected boundaries, migration/security impact and meaningful tests. State what remains blocked and what can proceed. Reuse existing conventions and dependencies instead of adding frameworks or abstractions by default.

For agent configuration, plan only approved configuration files. For application tasks, select versions/build commands from the actual manifests or an approved setup decision.

## Implement

Use a small task branch from the agreed main revision, normally `codex/<task-slug>`. Check main freshness before branching; do not merge unrelated work or reset a user's checkout. Preserve dirty work before switching or use an explicitly authorized isolated checkout.

Keep one writer per checkout. Codex and Gemini may exchange implementation/review roles, but do not edit concurrently. Keep changes within the task; do not install remote skills, add endpoints or resolve product conflicts as incidental fixes.

Implement backend authorization and invariants in the owning use case; frontend controls are supplementary. Keep Flyway changes reviewable and compatible with applied migrations. Provider calls stay behind AI Integration and never grant permission or business authority.

## Test

Discover actual commands from Maven/Gradle/package manifests and existing CI configuration. The repository initially has no application manifests: report application gates as not applicable/not run rather than creating code to satisfy this workflow.

| Change | Relevant gates once implemented |
|---|---|
| Backend domain/API | Compile; JUnit 5/Mockito; Spring API validation/security tests; contract/error mapping. |
| Database | Flyway on empty and existing test databases; PostgreSQL Testcontainers; FK/unique/check, ownership queries, rollback and concurrent invariant tests. |
| Frontend | TypeScript, configured lint/format checks, Vitest; Playwright for affected user journeys. |
| AI | Fake-provider success/schema/enum/range/missing-information/timeout/rate-limit tests; context isolation and injection tests; approved quality fixtures. |
| Agent configuration | Skill metadata, Gemini JSON, relative paths, task routing, CLI discovery and instruction consistency; expected-file scope and preservation checks. |
| Cross-cutting security | Cross-landlord/tenant denials; privileged field assignment; token/secret leakage; provider egress; notification commit ordering. |

Avoid blanket full-suite repetition when focused checks already resolve the change and no remaining concern requires it. Report environment prerequisites such as Docker, database or provider credentials. Live AI smoke tests are separate from deterministic CI and require authorized data/cost scope.

Use `git diff --check` for tracked changes and also inspect/validate untracked new files, which ordinary diff commands omit. Do not run destructive database cleanup or production migrations as tests.

## Review

Review the actual diff against the task and contracts. An independent agent review, when authorized, is advisory; human approval remains necessary for merge. Do not equate a second model's agreement with correctness.

For each actionable finding give severity, file/line, trigger, impact and a test or evidence when available. Check module/layer boundaries, tenant query scope, DTO exposure, transactions, migration integrity, AI authority/fallback and credentials. Reviewers must not silently fix product decisions or authorize their own merge.

Resolve findings, rerun affected checks and record residual limitations. PR descriptions explain the final behavior, relevant tests and remaining risks, without claiming planned features are complete.

## Merge

A proposed PR gate includes task/AC traceability, applicable checks passing, reviewed migrations/contracts, no introduced conflicts/secrets and human review. Branch protection and GitHub Actions must be configured in a separately authorized infrastructure task; they are not established by this document.

Push, PR creation and merge follow the user's explicit authorization and applicable environment controls. Never push/merge/deploy merely because tests pass or an agent approves. This agent-environment task does not authorize commits, push or merge.

## CS2028 AI usage evidence

Record real Context → Prompt → AI Output → Human Review → Refinement → Final Result evidence in an authorized task/PR or evidence location. Do not create extra repository files without scope approval.

```text
Task/run ID and timestamp:
Agent/tool/version and model when known:
Base commit and input artifact revisions:
Prompt version or exact sanitized prompt:
Output/diff reference:
Human review: accepted/rejected/modified findings and rationale
Iteration: feedback, next prompt and resulting change (if any)
Verification: commands, environment and passed/failed/not-run results
Final artifact/commit/PR and remaining limitations:
```

Use synthetic/redacted data. Do not store API keys, JWTs, tenant PII, raw sensitive provider payloads or invented model/version details. If historical output is unavailable, state that limitation instead of reconstructing it as original evidence.

## Codex and Gemini handoff

Start both tools from the repository root when practical. Codex reads root AGENTS.md and repository `.agents/skills/`; Gemini uses the workspace context.fileName setting and supports the same skills directory. Avoid duplicate skills/context copies and global configuration changes.

Before handoff, provide:

```text
Task/goal and acceptance criteria:
Current branch, base SHA and working-tree status:
Changed files and ownership of uncommitted work:
Approved decisions and unresolved conflicts:
Checks run: exact commands/results; checks not run and why
Next concrete step:
Current authorization, forbidden actions and required user decisions:
```

The receiving agent rereads root rules, checks Git status/diff, verifies references and preserves work. A handoff does not expand permission. Do not transmit repository contents or data to another service outside the authorized development environment.

## Compatibility verification and limitations

- Validate each new skill with the available skill-creator validator; parse YAML/JSON and resolve local links. Keep new SKILL.md frontmatter portable with name/description.
- Inspect effective instructions and skill discovery in a fresh Codex session; inspect Gemini context and skill listing when Gemini CLI is installed. Verify from the root and an existing nested directory without issuing write tasks or live provider requests.
- CLI versions, global instructions and workspace trust can affect loading. Record the tested versions and exact method; metadata/path validation alone does not prove runtime activation.
- If Gemini is unavailable, report static compatibility separately and leave runtime verification pending. Do not install it without separate approval.
- Preserve the existing java-spring-boot skill and skills-lock.json. Its extended frontmatter can fail the bundled strict validator; its generic examples/configuration script do not prove SmartRent correctness. Report legacy findings separately and request a scoped remediation task if needed.
- Instructions never disable sandbox, approval prompts, skill consent or security checks. No hooks, remote MCP services, automatic agents or permissive command policies are installed by this setup.
