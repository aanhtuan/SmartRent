# 5.5 API Design – SmartRent

> Sprint 0 revision: see the [decision baseline](../sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

## 1. Scope

SmartRent exposes a JSON REST API under `/api`; no path version is currently specified. This is a design contract only: no controller, migration or implementation code is created in Chapter 5. The API follows the Modular Monolith boundary: Frontend → REST API → authenticated/authorized business module → Repository → PostgreSQL. The AI path is only Backend → AI Integration → Provider → validate output → Maintenance business logic.

## 2. Resource map

| Resource | Artifact | Owner module |
|---|---|---|
| Authentication, current User, Tenant Profile, AI Assistant | [authentication-api.md](../../design/api/authentication-api.md) | Identity & Access / Tenant / AI Assistant |
| Properties | [property-api.md](../../design/api/property-api.md) | Property |
| Rooms | [room-api.md](../../design/api/room-api.md) | Room |
| Contracts | [contract-api.md](../../design/api/contract-api.md) | Contract |
| Payments | [payment-api.md](../../design/api/payment-api.md) | Payment |
| Maintenance Requests + AI classification | [maintenance-api.md](../../design/api/maintenance-api.md) | Maintenance / AI Integration |
| Notifications | [notification-api.md](../../design/api/notification-api.md) | Notification |

`Users` is intentionally limited to `GET /api/users/me`: Chapter 3 assumes users have valid accounts and defines no registration or generic user-administration feature. Tenant management is represented by protected Tenant Profile endpoints, as required by FR-03. The same artifact documents the existing FR-09 AI Assistant endpoint; it uses backend-filtered context and is not a direct provider endpoint.

## 3. Common API conventions

- **Media type:** `application/json`; field names use `snake_case` to align with the logical PostgreSQL schema.
- **Authentication:** protected endpoints require `Authorization: Bearer <access-token>`. Invalid/missing token returns `401`.
- **Authorization:** backend checks role **and** resource ownership/relationship for every protected request. Client IDs, UI visibility and AI output never grant permission.
- **Identifiers/times:** resource IDs are UUID strings; API timestamps are ISO-8601 UTC strings.
- **Lists:** accept optional `page` (default `1`, minimum `1`) and `page_size` (default `20`, maximum `100`), returning `{ "items": [], "page": 1, "page_size": 20 }`.
- **Mutation behavior:** server validates body/query/path values before calling a use case. Status changes and notifications occur through module business rules/after-commit events.

## 4. Standard error response

Every error response uses this envelope; `details` is optional and contains no sensitive internal data.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description is required.",
    "details": [
      { "field": "original_description", "reason": "must not be blank" }
    ]
  }
}
```

| HTTP | Error code | Meaning |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Malformed JSON, invalid UUID/query/field, unsupported enum or invalid range. |
| 401 | `UNAUTHENTICATED` | Missing, expired or invalid access token. |
| 403 | `FORBIDDEN` | Authenticated caller lacks required role or permission on a visible resource; concealed out-of-scope objects return 404. |
| 404 | `NOT_FOUND` | Resource absent or intentionally not exposed to an unauthorized caller. |
| 409 | `CONFLICT` | Unique/overlap constraint, duplicate billing period, stale preview or submission-key input conflict. |
| 422 | `INVALID_STATE` | Valid request shape but business rule/state transition or present-tenancy eligibility is not permitted. |
| 429 | `RATE_LIMITED` | Request limit exceeded, particularly login/AI classification. |
| 502 | `AI_PROVIDER_ERROR` | Provider unavailable/invalid response when classification is explicitly requested. |
| 500 | `INTERNAL_ERROR` | Unexpected server failure; details are not leaked. |

## 5. Maintenance and AI policy

`POST /api/maintenance-requests/preview` authorizes Tenant + room + effective contract, attempts Gemini classification, and returns a validated preview/token without creating a request or notification. `POST /api/maintenance-requests` is the user's explicit confirmation/manual submission; it reauthorizes, validates token/input binding when supplied and creates `PENDING` exactly once per submission key. Provider failure is shown before the user chooses manual confirmation; it never silently creates a request.

`POST /api/maintenance-requests/{id}/classify` re-runs classification on an existing authorized request. It updates validated AI metadata only, never original description or workflow status. On provider error return 502 and leave existing request unchanged. See the resource contract and D04/D09 for missing-info/fallback semantics.

Only authorized Manager/Landlord can call the status PATCH. Allowed status transition is controlled by Maintenance Service (`PENDING → PROCESSING → COMPLETED`, and `PROCESSING → CANCELLED` where policy allows); the AI provider cannot invoke it.

## 6. Traceability

| Source | API consequence |
|---|---|
| Chapter 3 FR-01–FR-10, US-01–US-09 | Endpoints cover authentication, rental data, payments, maintenance, notification and AI support only. |
| Chapter 4 User Flow / Prototype | Create `PENDING`, show original description, missing-information response, and manual fallback. |
| Chapter 5.1–5.2 | REST over Modular Monolith, backend authorization and AI Adapter/validator—not microservices/direct provider access. |
| Chapter 5.3 UML | API resource ownership follows modules and Maintenance sequence. |
| Chapter 5.4 Database Design | Payload fields/enums/FKs map to logical schema; API cannot bypass referential/business validation. |
