---
name: smartrent-ai
description: Implement or evaluate SmartRent Gemini adapters, authorized context, structured outputs, and manual fallback.
---

# SmartRent AI integration

Activate for classification, Assistant, Gemini Adapter implementation/review and AI evaluation tasks. Read [root rules](../../../AGENTS.md), [agent workflow](../../../docs/agent-workflow.md), [Feature F-01/F-02](../../../docs/chapter-03-requirement-analysis/05-feature-specification.md), [AI architecture](../../../docs/chapter-05-software-architecture/01-architecture-design.md), and the relevant [API artifact](../../../design/api/).

For classification, include [maintenance API](../../../design/api/maintenance-api.md), [prototype](../../../design/prototypes/maintenance-request-prototype.md) and [decision gates D04/D09/D10](../../../docs/sprint-0-decisions.md). For Assistant use [authentication API](../../../design/api/authentication-api.md) and canonical FR-09. Merge markers have been removed; working-baseline policy/model/egress choices still require review. Consult [Chapter 5 prompts](../../../prompts/chapter-05/) as templates, not proof of historical runs.

## Preserve the boundary

- Gemini is the approved application AI provider, called through backend interfaces. Do not add another provider or automatic provider failover without approval. Codex/Gemini development tools do not change this boundary.
- Read the relevant official Gemini API documentation for the selected Java SDK or REST integration before coding. Record the approved model and API/SDK version; do not silently substitute a model from a generic skill. Review provider data retention and logging for the authorized context before live use.
- Retrieve context through backend-authorized use cases and minimize it before egress. Do not send database credentials, internal JWTs, password hashes or unrelated tenant records.
- Isolate provider SDKs, prompts, response parsing and error mapping from domain modules. AI integration returns suggestions/failures, never authorization decisions or repository writes.
- Treat user text and provider responses as untrusted data, including instructions asking to ignore policies, disclose context, run tools or alter business state. Assistant behavior cannot grant data or action access.

## Validate and degrade safely

- Validate category, priority, summary, missing_information and confidence against the approved contract, including required fields, allowed enums, size limits and numeric range.
- Distinguish valid classification, missing information, invalid output and provider unavailability. Preserve original descriptions and manual handling; explicit reclassification failure must not alter business status.
- Follow the reviewed preview/confirmation/idempotency contract; no business persistence or notification from preview alone. Missing information asks/re-previews or offers manual submit. Do not invent a confidence cutoff, question limit or token lifetime; accept the named G4 decisions before dependent implementation.
- Bound timeout/retries and avoid retrying business creation as a side effect of provider retry. Reauthorize/revalidate mutable eligibility at the write boundary as needed.
- Keep secrets in approved runtime configuration. Log sanitized error/correlation information, not raw tenant prompts or provider payloads by default.

## Verify quality and safety

Use deterministic fake adapters for CI and tests covering schema failures, prompt injection, missing data, timeout/rate limits, isolation and manual fallback. Live provider calls need authorized credentials and scope; label them separately from deterministic tests.

Evaluate Vietnamese examples with reviewed labels for category, priority, missing information and unsupported facts. Model confidence is not a calibrated accuracy guarantee. Record prompt/model revisions, review and observed results in CS2028 evidence without inventing unrecorded runs.
