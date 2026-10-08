# Maintenance Request API

Working-baseline contract; D04/D09/D10 and preview/idempotency details require G4 review before AI lifecycle implementation. See [decision register](../../docs/sprint-0-decisions.md), [API conventions](../../docs/chapter-05-software-architecture/05-api-design.md) and [roadmap](../../docs/project-roadmap.md).

## Resource and authorization

Request representation: `{id,room_id,original_description,category?,priority?,ai_summary?,ai_confidence?,ai_missing_information,ai_classification_status,status,created_at,updated_at}`. IDs are UUIDs; timestamps UTC; enums follow schema. Preserve original text. AI metadata is validated assistance, never permission/state authority.

All endpoints require Bearer. Tenant creates only with effective own tenancy; Tenant historical list/detail is own creator scope even after contract expiry. Manager reads/processes only rooms under owned property. Reclassification of an existing request uses creator/property scope, does not grant another room's context. Cross-owner objects return 404; wrong role 403; current eligibility/lifecycle failure 422. Scope collection queries before filters/pagination.

| Method / URL | Purpose | Request -> response | Errors / effects |
|---|---|---|---|
| GET `/api/maintenance-requests` | Scoped list | status/room_id/priority + bounded pagination -> 200 `{items,page,page_size}` | Invalid filter 400; cross-scope target 404; no data leakage. |
| POST `/api/maintenance-requests/preview` | Read-only authorized Gemini preview | `{room_id,original_description}` -> 200 `{room_id,original_description,ai_classification_status,classification,preview_token,expires_at}` | Empty/invalid 400; role 403; ineligible tenancy 422; rate limit 429. Provider failure returns preview state UNAVAILABLE/INVALID with `classification:null`, no business row/event. |
| POST `/api/maintenance-requests` | Explicit confirmation/manual create | `{room_id,original_description,submission_key,preview_token?}` -> 201 request; identical retry -> 200 existing request | Token tamper/input mismatch 400; expired preview 409; missing-info token 422; stale tenancy 422; same submission key with changed business input 409. No provider call here. |
| GET `/api/maintenance-requests/{id}` | Scoped detail | UUID -> 200 request | Malformed 400; absent/out-of-scope 404. |
| PATCH `/api/maintenance-requests/{id}/status` | Manager-only transition | `{status}` -> 200 request | Invalid transition 422; Tenant 403; out-of-scope 404. PENDING -> PROCESSING -> COMPLETED; PROCESSING -> CANCELLED per G4 cancellation contract. After-commit event only. |
| POST `/api/maintenance-requests/{id}/classify` | Authorized reclassification | `{additional_information?}` -> 200 request | Invalid field 400; out-of-scope 404; provider invalid/unavailable 502; failure leaves previous metadata/status intact. |

## Preview and validation

`classification` is `{category,priority,summary,missing_information,confidence}` for valid CLASSIFIED/NEEDS_INFORMATION output; validate all required fields, enums, bounds and lengths. Provider-error states contain no trusted suggestion. Missing information shows questions; user edits/re-previews or explicitly submits manually without a token. Confidence is display/review information, not an approved numerical decision threshold.

Token is server-signed and binds actor/room/input digest/validated state/result/expiration. It is not authorization. On confirmation, verify signature/binding/expiry and recheck current tenancy. Editing description invalidates that preview. No token means manual creation with NOT_REQUESTED and no provider call. UNAVAILABLE/INVALID token confirms fallback with null suggestion fields. CLASSIFIED token maps only allowed validated metadata.

`submission_key` is a client-generated UUID; backend stores a canonical business-input digest and enforces uniqueness per tenant profile. Same business input/key returns same request without a second event; different input/key reuse returns 409. Define digest semantics at G4 so token renewal does not cause false conflict. Do not expose internal digest/signing secrets in response.

Initial status is PENDING. Do not hold DB transactions during preview/provider calls. Only successful confirmation commit emits the creation event. An unavailable AI never removes the manual submission path. No automatic retry of business creation as a provider retry side effect.
