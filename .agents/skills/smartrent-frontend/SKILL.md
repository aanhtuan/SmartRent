---
name: smartrent-frontend
description: Implement or review SmartRent React screens and typed REST interactions against approved UX contracts.
---

# SmartRent frontend

Use for SmartRent React UI and API interaction tasks. Read [root rules](../../../AGENTS.md) and [agent workflow](../../../docs/agent-workflow.md).

## Select the journey

Read the relevant [Chapter 3 story](../../../docs/chapter-03-requirement-analysis/04-user-stories.md), [Chapter 4 design](../../../docs/chapter-04-product-design/), detailed [wireframe](../../../design/wireframes/maintenance-request-wireframe.md), [prototype](../../../design/prototypes/maintenance-request-prototype.md), and resource-specific [API contract](../../../design/api/).

Use canonical WF-07 Missing Information and WF-08 AI Unavailable. Read the [decision baseline](../../../docs/sprint-0-decisions.md) and [Maintenance API](../../../design/api/maintenance-api.md): preview does not persist, explicit confirm/manual submit does. G4 must accept this working-baseline lifecycle before implementation. “Request received/PENDING” appears only after successful create, not after preview failure.

## Build the interaction

- Use React, TypeScript, Vite and Tailwind CSS. Organize by feature with shared typed REST infrastructure; preserve existing conventions when application code exists.
- Handle loading, empty, validation, access-denied and service-failure states. Accessible labels, keyboard operation and understandable status text belong to the task's interaction.
- Preserve original description and distinguish AI suggestions, missing-information prompts and manual fallback. Reflect server-owned business state rather than deriving it from model output.
- Prevent accidental repeat submissions in the UI; do not claim this guarantees server-side idempotency. Cache data by authenticated scope and clear sensitive cached state on logout/account changes.
- UI role checks improve navigation only; backend authorization remains mandatory. Do not expose provider keys, call providers directly or select JWT storage/refresh behavior without the approved security design.
- Do not introduce final visual requirements, attachments, detailed status history or actions absent from the approved task.

## Verify the journey

Use TypeScript/lint checks defined by the project, Vitest for user-visible component/API behavior, and Playwright for affected end-to-end journeys. Include failed requests, manual fallback and unauthorized access where relevant.

Mock responses must match approved contracts. Clearly separate mocked UI verification from integration with a running backend; report browser evidence only when actually collected.
