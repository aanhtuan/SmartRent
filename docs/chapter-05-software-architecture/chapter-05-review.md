# Chapter 5 — Current architecture/documentation review

## Scope and evidence status

Re-audited from main revision `35ce3aa1a7a13a03a255ef9a41311f1eaae48d64` and normalized during Sprint 0. Architecture remains Modular Monolith + Layered Architecture + REST API + PostgreSQL + AI Integration Boundary. This report supersedes the earlier blanket Pass/no-blocker conclusion; it does not rewrite historical approval evidence or claim application verification.

| Earlier claim / finding | Current handling |
|---|---|
| API and Assistant consistent | Conflict markers removed; Assistant retained under canonical FR-09; contract now reviewable. |
| UML matches schema | ER overview delegates to shared ERD/schema; Property/TenantProfile and embedded AI metadata aligned. WB fields still need G2/G4 acceptance. |
| UX/API flow consistent | Preview and explicit confirmation separated; failure no longer silently persists. G4 must accept exact lifecycle/security contract. |
| No status-history mismatch | Architecture now states current status/audit timestamps; no full timeline/history table promised. |
| No Chapter 5 prompt directory | Directory exists; demo now links versioned templates. Templates do not establish past model runs. |
| No blockers remain | Foundation planning is ready; G1–G4 decision/runtime gates remain explicit in roadmap. |

See [decision register](../sprint-0-decisions.md), [readiness report](../implementation-readiness.md) and [current task evidence](../ai-evidence/sprint-0-normalization.md). Static documentation checks and their actual results are recorded there after execution. No compilation, application test, live Gemini evaluation or deployment is asserted by Chapter 5.

## Historical context

The prior review reported status-history wording, missing-info metadata, Assistant coverage and missing prompt provenance. The subsequent audit found unresolved API markers and competing ER models despite its Pass labels. This revision corrects the final artifacts and records policy assumptions explicitly instead of declaring them individually human-approved.

## Transition to Chapter 6

Start with C6-01 backend foundation after authorized setup/download scope. Property/Profile/Contract/Billing/AI tasks must pass their named product-policy review gate before implementation. Preserve approved architecture, enforce backend role plus ownership, keep provider output untrusted, preserve explicit manual fallback, and report unavailable tests as not run.
