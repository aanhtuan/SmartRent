# Authentication, User and Tenant Profile API

> Sprint 0 revision: see the [decision baseline](../../docs/sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

All response/error conventions are defined in the [API Design](../../docs/chapter-05-software-architecture/05-api-design.md).

## Authentication and current user

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `POST /api/auth/login` | Authenticate an existing account. | Public; rate limited. | `{email,password}` → `200 {access_token,token_type:"Bearer",user:{id,email,role}}`. | Email/password required; invalid credentials `401 UNAUTHENTICATED`; malformed `400`; rate limit `429`. |
| `GET /api/users/me` | Return current user identity/context. | Bearer; caller only. | No body → `200 {id,email,role,is_active}`. | `401` invalid token; inactive user is rejected by auth policy. |

No registration endpoint is specified because valid accounts are an explicit Chapter 3 assumption. Password hashes are never returned.

## Tenant Profile management

Working baseline D03: trusted provisioning assigns a Tenant user to one landlord via `provisioned_by_user_id`. Profiles carry matching `manager_landlord_id`, set server-side. Public profile creation must verify this assignment, not merely TENANT role or knowledge of user UUID. No account lookup/provisioning endpoint is added. Lists/details/contact edits are scoped to that landlord or the profile's own Tenant; contract expiry does not remove own historical visibility. Multiple simultaneous landlords/ownership transfers are outside this MVP baseline and require G2 review.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/tenant-profiles` | List tenant profiles for management. | Bearer; Manager/Landlord; assigned profile scope only. | Pagination query → `200 {items:[{id,user_id,full_name,phone_number}],page,page_size}`. | Page bounds `400`; role `403`; `401`. |
| `POST /api/tenant-profiles` | Create profile for an existing Tenant user. | Bearer; Manager/Landlord; assigned profile scope only. | `{user_id,full_name,phone_number?}` → `201 {id,user_id,full_name,phone_number}`. | UUID/name required; target must have TENANT role and trusted provisioning assignment to caller; unrelated user 404; duplicate profile `409`; role `403`; `400/401`. |
| `GET /api/tenant-profiles/{id}` | Get tenant profile. | Bearer; assigned Manager/Landlord, or the profile’s Tenant. | Path UUID → `200 {id,user_id,full_name,phone_number}`. | Bad UUID `400`; role `403`; out-of-scope `404`; absent `404`; `401`. |
| `PATCH /api/tenant-profiles/{id}` | Update tenant contact/profile fields. | Bearer; assigned Manager/Landlord, or profile owner for own allowed contact fields. | `{full_name?,phone_number?}` → `200` updated profile. | At least one allowed field; name format `400`; ownership field changes forbidden `403`; absent `404`; `401`. |

`user_id` and `manager_landlord_id` are immutable after profile creation; neither can be assigned through client PATCH. The backend does not expose credentials or let client input change a user role through this API.

## AI Assistant

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `POST /api/ai-assistant/messages` | Answer a natural-language SmartRent question using only caller-authorized backend context. | Bearer; Tenant or Manager/Landlord. Backend scopes all data retrieval to caller role/ownership before AI Integration is invoked. | `{question}` → `200 {answer,requires_more_information}`. | Nonblank question required; unsupported/unsafe data request `403`; malformed `400`; `401`; provider unavailable `502 AI_PROVIDER_ERROR`. |

The endpoint sends a minimal authorized context through AI Integration and returns an answer or a request for more information. It does not expose provider credentials/raw responses, query PostgreSQL directly from AI, disclose another user’s data, confirm financial transactions, or perform any write operation.
