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
| D08 | No public registration/refresh/logout API is added. Dev/test provisioning is idempotent and environment-restricted, with synthetic data and supplied credentials. Inactive users are denied. MVP browser token lives in memory; reload/expiry requires login. No browser persistent token storage; CORS allowlist; CSRF decision follows actual bearer-only flow. JWT backend settings are approved in the G1 decision below. | Backend G1 approved 2026-10-25; implementation/verification and frontend remain separate. |
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

G1 backend policy is approved below (2026-10-25); actual implementation/verification and any future CORS origin values remain explicit configuration work. G2: accept/replace D02–D06, especially one-landlord profile scope and future termination. G3: accept/replace D07. G4: accept D04/D09/D10, preview/duplicate/cancellation details, model/version, evaluation criteria and live data/cost scope. All are explicit entry gates in the [roadmap](project-roadmap.md), not hidden assumptions.

## Change and evidence policy

Record reviewer, date, accepted/rejected/modified decision and linked task when a gate is reviewed. No reviewer/date is fabricated here. Keep the original artifact history in Git; do not describe working-baseline changes as historically approved. See [readiness](implementation-readiness.md), [backlog](chapter-06-ai-programming/implementation-backlog.md) and [AI evidence](ai-evidence/README.md).

## C6-03 foundation choices approved for execution — 2026-10-09

The user approved the C6-03 plan in the current chat with “duyệt”, including:

- PostgreSQL 17.11 official Bookworm image pinned by digest; Boot 3.5.16-managed JPA/Hibernate/JDBC/Flyway/Testcontainers versions.
- Login identity email treated as case-insensitive, stored trimmed/lowercase, with a canonical CHECK and UNIQUE constraint. No provider-specific dot/plus alias rules.
- Backend-generated UUID; role stored as text with LANDLORD/TENANT CHECK and string enum mapping; UTC timestamp mapping and application-managed updated_at.
- Separate bootstrap, migration and runtime DB roles; localhost-only port, named volume, required distinct local secrets; no runtime DDL or hard deletion of users.
- Separate checksum-verified local JDK 21 toolchain; keep system Java unchanged.

These choices are limited to C6-03 and do not accept D03 or other G2–G4 working-baseline policies. V1 contains identity only; provisioning fields require a later approved forward migration. C6-03 approval does not authorize Git publication or deployment.


## G1 backend security and identity — PO APPROVED 2026-10-25

Reviewer: Product Owner (the user, explicit decision in the current conversation).
Scope: B01/C6-04 and B02/C6-05 backend policy. Execution now starts with B01 only.
This does not approve G2, G3, G4, frontend or publication/deployment.

| Decision | Approved policy |
|---|---|
| Provisioning / environment | Explicit dev/test-only and enable flag, disabled by default. Exactly two synthetic LANDLORD and two synthetic TENANT slots under `.test`; credentials supplied externally, no usable defaults. Profiles outside dev/test cannot run provisioning. |
| Idempotency / atomicity | One application transaction; preserve existing IDs, credentials, roles and active status. A matching existing account is not updated or rehashed. Credential/role conflict aborts the batch; never reset or claim an existing account. No landlord assignment/D03 fields. |
| Password hashing | Versioned Argon2id through Spring PasswordEncoder. Retain the reviewed starting parameters: 16-byte salt, 32-byte hash, 19 MiB memory, 2 iterations, parallelism 1. Benchmark and report actual measurements; do not silently retune or log passwords/hashes. |
| JWT | RS256 with externally configured RSA signing keys >=2048 bits. `iss=urn:smartrent:backend`, `aud=smartrent-api`, UUID subject, iat/nbf/exp/jti validation, 30-second maximum clock skew. **Access-token TTL is 30 minutes**, superseding the draft 15 minutes. No implicit key generation or client-driven issuer discovery. |
| Verified account | Recheck DB active/role on protected requests; a signed token cannot grant access to an inactive account. |
| Authentication boundary | Stateless bearer header only; no public registration, refresh or logout endpoints, cookie/basic/form authentication. |
| CORS / CSRF | Explicit origin allowlists, no wildcard/credentialed CORS. Backend-first default has no cross-origin allowlist until actual origins are configured. Verify bearer-only/no ambient credentials before disabling CSRF for REST in B02. |
| Login abuse | Retain the reviewed bounded per-process proposal: 5 failures/15 minutes per IP+normalized email; 30 attempts/15 minutes/IP. Injectable clock, bounded entries/TTL, Retry-After; do not trust forwarding headers without a trusted proxy. No distributed-limit claim. |
| Errors | Same safe 401 UNAUTHENTICATED for unknown email, wrong password and inactive account; malformed 400, rate-limited 429 with Retry-After, approved error envelope. No credentials/hash/token/internal-error disclosure. |
| Database / delivery | Preserve runtime/migration role separation and V1 history/data. No volume deletion. No commit, push, merge or deploy without separate authorization. |

Approval is policy authority, not proof that JWT/authentication or any gate has
been implemented. B01 does not introduce B02 endpoints, JWT configuration, CORS,
CSRF changes or login rate limiting. The original Phase 0 proposals and the PO's
TTL amendment are distinguished; no later business policy is implicitly accepted.

## PO workflow amendment — 2026-10-25

The PO explicitly authorizes continuous backend-first B02–B15 implementation using
existing approved decisions and documented working baselines, then B16/B17 full
stabilization. Routine increment approvals/review pauses are removed. This supersedes
earlier per-increment hold instructions for this mission; it does not rewrite the
historical status of individual G2/G3/G4 sign-offs. Material policy/security conflicts
still require a decision. No frontend, Git publication, deployment, destructive data
operation, real PII/provider egress or live evaluation authorization is inferred.

The implementation follows the concrete section-3 working baseline in the backend
plan: one-manager tenant assignment; inclusive room reservations and business clock;
manual whole-VND monthly billing; maintenance cancellation reason; five-minute signed
preview and scoped idempotency retry; best-effort post-commit notifications including
PAYMENT_UPDATED; bounded input/provider limits and Gemini 3.8 Flash / v1beta route.
These are documented implementation assumptions under the new PO instruction, not
claims of historical approval or measured live AI accuracy. See [completion evidence](ai-evidence/backend-completion.md).

## Local Git commit authorization — 2026-10-25

The PO explicitly authorized local commits for the existing backend implementation
on `feature/backend-completion`, including dependency-driven consolidation of the
proposed 18 groups. Preserve Phase 0/B01, all 177 candidate paths, immutable V1,
forward V2–V9 and local PostgreSQL data. Run Java 21 Maven verify on final HEAD.
This does not authorize new features, push, opening a PR, merge or deployment.
See the [execution record](ai-evidence/backend-delivery-preparation.md#local-commit-execution--2026-10-25).
