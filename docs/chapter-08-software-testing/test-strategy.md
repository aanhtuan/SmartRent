# Chapter 8 — Software testing strategy

Status: planned; application tests do not exist yet. See [backlog](../chapter-06-ai-programming/implementation-backlog.md) and [decisions](../sprint-0-decisions.md). Test expectations for working-baseline product policies require their gate approval first.

| Boundary | Tool | Required evidence |
|---|---|---|
| Domain/application policies | JUnit 5 + Mockito | Normal/denied/lifecycle/failure branches; injected business clock for date boundaries. |
| HTTP/security | Spring API/security tests | JWT invalid/expired/inactive, role + object relationship, error envelope, mass assignment, bounded pagination. |
| PostgreSQL/JPA/Flyway | PostgreSQL Testcontainers | Clean and upgrade migrations, uniqueness/FK/check, scoped lists/filters, rollback, concurrent contract and submission races. H2 is insufficient evidence. |
| React interactions/API | TypeScript + Vitest | Loading/empty/error, accessible controls, account cache isolation, exact approved request/response shapes. |
| User journeys | Playwright | Login, owner CRUD, tenant history, contract/payment, manual and preview/confirm maintenance, notification recipient isolation, Assistant safe failure. |
| AI contract/safety | Fake adapter + reviewed Vietnamese fixtures | Schema/enum/range, missing confidence, injection, missing context, timeouts/rate limits, no unauthorized egress/write/status changes. |
| Live Gemini | Separately authorized smoke/evaluation | Pinned model/prompt/API/SDK, sanitized data, costs/latency/errors and reviewed labels. Never equate mocked success with provider quality. |

AI evaluation rubric: category/priority correctness, missing-information appropriateness, unsupported facts, data leakage and fallback behavior. Include ambiguous/noisy Vietnamese and adversarial cases, not only happy paths. Report sample count/distribution and failures. Accuracy/latency/cost thresholds are reviewed before release; no unsupported numerical guarantee is introduced here. Confidence is not calibrated accuracy.

CI grows with each task: backend verify, frontend typecheck/lint/test/build, database integration and then affected E2E. Record prerequisites and skipped checks. A release candidate requires all applicable critical AC and security/data-integrity scenarios verified; failed or unavailable gates block the relevant claim. Secret checks inspect new code/config/evidence without printing real secrets.

Retain exact commands, exit/results, environment and artifact references; rerun changed/failing checks after fixes. Do not run destructive cleanup against shared/production databases. Performance/load tests require an approved workload/budget; no capacity claim from a local smoke test.
