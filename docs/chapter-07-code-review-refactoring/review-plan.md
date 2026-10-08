# Chapter 7 — Code review and refactoring plan

Status: planned; no code review run is claimed. Follow [roadmap](../project-roadmap.md) and [workflow](../agent-workflow.md).

For every task, review the real diff against canonical FR/AC and accepted decision IDs. Check module/layer direction, ownership on list/filter/read/write/context, DTO allowlists, transactions, Flyway history, state transitions, concurrency, AI output/egress and credential leakage. Give severity, file/line, reproducible trigger, impact and verification. Review generated code as critically as handwritten code.

Agent review is advisory. Use another agent only when delegation is authorized; one writer per checkout. Human decisions on product/security and merge cannot be delegated implicitly. Do not mark a self-review as independent review.

Refactor only demonstrated problems: duplicate policies, cyclic module dependencies, oversized use cases, N+1 queries, unsafe mappings or untestable provider coupling. Preserve API/behavior; isolate behavior changes in explicit tasks. Re-run affected tests; collect before/after evidence, not invented performance improvement.

Exit: actionable high-severity findings resolved or explicitly accepted by the responsible reviewer; acceptance evidence, residual risks and actual review identity recorded in the task/PR. No merge merely because a model says Pass.
