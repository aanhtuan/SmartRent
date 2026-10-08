# SmartRent — Sprint 0 baseline and decisions

## Status and authority

Date: 2026-10-09. Source revision: `35ce3aa1a7a13a03a255ef9a41311f1eaae48d64` plus existing local agent configuration.

The user authorized documentation remediation and an end-to-end roadmap. The architecture/stack below are approved. New product-policy details in this document are a **working baseline (WB), requiring Product Owner review before the dependent domain task starts**. Broad permission to edit documents is not evidence of individual product-policy sign-off. No application implementation or test execution is implied.

For the normalized documentation, use this decision register, source-qualified requirements and the resource API/schema together. This register explains deliberate changes to earlier artifacts; it does not override future human decisions. A proposed policy must not become a test oracle for implementation before its gate is accepted. Foundation tasks can proceed without accepting the domain policies.

## Approved constraints

React + TypeScript + Vite + Tailwind CSS; Java 21 + Spring Boot 3.x + Spring Security + JWT; PostgreSQL + Spring Data JPA/Hibernate + Flyway; Gemini API through backend AI Adapter; JUnit 5 + Mockito + Testcontainers + Vitest + Playwright; Docker Compose + GitHub Actions.

Keep Modular Monolith + Layered Architecture + REST API + PostgreSQL + AI Integration Boundary. One backend deployable; no microservices, other backend stack, direct frontend provider calls or automatic provider failover.

## Decisions and review gates

| ID | Baseline | Status / gate |
|---|---|---|
| D01 | Canonical FR-01–FR-10 follow Requirement Analysis. FR-06 submits, FR-07 processes, FR-08 notifies, FR-09 Assistant, FR-10 classification. Preserve legacy PRD mapping below. | Documentation normalization; review mapping before task traceability is frozen. |
| D02 | Separate Property and Room responsibilities; Property owns properties, Room owns rooms; room ownership derives through property. TenantProfile links User to Contract/Request. AI classification is embedded request metadata; no separate AI table/history table. | WB; G2 model review before domain migrations. |
| D03 | MVP one Tenant user/profile belongs to one managing landlord. Trusted provisioning assigns `users.provisioned_by_user_id`; `tenant_profiles.manager_landlord_id` must equal that assigned landlord. Tenant cannot be claimed by another landlord using a known UUID. No ownership transfer or simultaneous multi-landlord profile in MVP. | WB; G2 must accept this explicit MVP limitation or replace it with an approved relationship model. |
| D04 | AI preview is read-only. User confirmation creates `PENDING`; only commit triggers notification. AI failure offers an explicit manual submit action. Missing-info preview asks questions without persisting; manual bypass remains available. | WB; G4 UX/API review. |
| D05 | Business dates use Asia/Ho_Chi_Minh; timestamps use UTC. Effective tenancy requires ACTIVE contract, start_date <= today <= end_date, and active property/room. Occupancy derives from effective contracts; INACTIVE is administrative. Clients cannot force OCCUPIED/AVAILABLE contrary to tenancy. Future contracts do not grant present access. | WB; G2 lifecycle review. |
| D06 | Single-tenant room MVP. Inclusive rental dates; next contract starts after previous end date. ACTIVE contractual reservations cannot overlap for the same room, including future periods. Expiry/termination must release dates only through approved lifecycle rules. | WB; G2 accepts interval/termination policy before migration. |
| D07 | Manager creates monthly billing manually, amount in VND, no automatic rent calculation/proration. `billing_period` is first of month; `due_date` explicit; amount nonnegative, whole VND. Tenant reads own records. Manager records PAID manually; this is not banking confirmation. PAID is terminal and amount immutable in MVP; corrections require a future approved flow. OVERDUE derives from unpaid + today > due_date. | WB; G3 billing review. |
| D08 | No public registration/refresh/logout API is added. Dev/test provisioning is idempotent and environment-restricted, with synthetic data and supplied credentials. Inactive users are denied. MVP browser token lives in memory; reload/expiry requires login. No browser persistent token storage; CORS allowlist; CSRF decision follows actual bearer-only flow. JWT signing algorithm, issuer/audience and expiry must be selected at G1. | Existing-account scope preserved; security settings require G1 review. |
| D09 | Gemini only. Validate category, priority, nonblank bounded summary, string-array missing_information and confidence in [0,1]. Missing-info output includes confidence. No numeric confidence cutoff for MVP; confidence alone grants no authority. Use deterministic fake adapters in CI; pin model/API/SDK and review data egress before live usage. | WB output policy; model/cost/data approval at G4. |
| D10 | In-app notification after commit; no rollback of business state on delivery failure. In-process event alone is best-effort across crashes, not durable delivery. No full status timeline is promised; show current state/audit timestamps. | WB; G4 explicitly accepts delivery limitation or schedules durability design. |
| D11 | WF-07 = Missing Information; WF-08 = AI Unavailable. | Documentation normalization. |
| D12 | Preserve real historical review context; replace blanket Pass claims with current audit status. Prompt templates are design aids, not proof of past execution. | Evidence rule; applies now. |

## Legacy requirement mapping

| Legacy PRD ID / feature | Canonical ID |
|---|---|
| FR-01–FR-05 | Same IDs |
| FR-06 Maintenance Request | FR-06 Submit + FR-07 Process |
| FR-07 Notification | FR-08 |
| FR-08 AI Assistant | FR-09 |
| FR-09 AI Classification | FR-10 |

## Lifecycle and access matrix (WB)

- Property: owner-scoped management; INACTIVE rejects new contracts/requests. Deactivation with current/future ACTIVE reservations or open requests is 422.
- Room: one Property; no hard deletion of history. INACTIVE rejects new occupancy/requests. Soft deletion conflicts with current/future ACTIVE reservations/open maintenance. OCCUPIED/AVAILABLE are calculated from effective tenancy; stored status, if retained as a projection, is not authorization evidence.
- Contract: creator owns both room property and tenant management scope. ACTIVE -> EXPIRED when date passes, ACTIVE -> TERMINATED through authorized action. No reactivation or date mutation of terminal contracts. Termination shortens the reserved end date to the accepted termination date (not before start); future cancellation policy requires explicit G2 review. No deletion of history.
- Tenant Profile: manager lists/reads/updates only assigned profiles; Tenant reads own profile and updates own permitted contacts. user_id/manager fields immutable through public PATCH. Provisioning assignment is server-owned.
- Tenant historical contract/payment/request reads remain available to that Tenant after contract expiry; an effective contract is required for new requests, not for reading own history.
- Maintenance: PENDING -> PROCESSING -> COMPLETED; PROCESSING -> CANCELLED by managing landlord with reason handled by the approved task contract. Terminal state has no transition. Tenant/AI cannot PATCH status. Cancellation fields must be specified at G4; no audit detail may be claimed without storage.
- Cross-owner object reads return 404; forbidden operations on known caller-visible resources/roles return 403; malformed input 400; business lifecycle violations 422; duplicate/overlap/stale-preview conflicts 409. Collections are always scoped before filtering/pagination.

## Preview integrity and repeated submission (WB)

`POST /api/maintenance-requests/preview` authorizes and calls Gemini without creating a business request or notification. It returns preview state, validated suggestion/questions, `preview_token` and `expires_at`. A signed, short-lived token binds actor, room, exact input digest, validated result/state and expiration. Token contents are not an authorization grant. Preview lifetime and signing-key rotation are configuration decisions for G4, not hardcoded product promises.

`POST /api/maintenance-requests` is explicit confirmation. It rechecks current identity/tenancy and verifies token binding/expiry before mapping metadata. No database transaction remains open during Gemini calls. Editing input requires a new preview. Missing-info tokens cannot be confirmed as CLASSIFIED; user supplies details or submits manually without a token. No token means manual creation, no provider call, NOT_REQUESTED classification. UNAVAILABLE/INVALID preview token can confirm manual fallback without trusted suggestion fields.

`submission_key` (UUID) is unique per tenant profile. Same key + same canonical input returns the existing request (200), with no second notification; first creation returns 201. Reuse with different input returns 409. Preview-token renewal does not change the business-input identity; implementation must define the canonical digest at G4. Store a server-computed digest, never trust one supplied by the client. Preserve original description; reclassification cannot change status or original input.

## Decisions still needing execution-time selection

G1: compatible pinned dependency versions, Maven Wrapper, JWT configuration and actual CORS origins. G2: accept/replace D02–D06, especially one-landlord profile scope and future termination. G3: accept/replace D07. G4: accept D04/D09/D10, preview/duplicate/cancellation details, model/version, evaluation criteria and live data/cost scope. All are explicit entry gates in the [roadmap](project-roadmap.md), not hidden assumptions.

## Change and evidence policy

Record reviewer, date, accepted/rejected/modified decision and linked task when a gate is reviewed. No reviewer/date is fabricated here. Keep the original artifact history in Git; do not describe working-baseline changes as historically approved. See [readiness](implementation-readiness.md), [backlog](chapter-06-ai-programming/implementation-backlog.md) and [AI evidence](ai-evidence/README.md).
