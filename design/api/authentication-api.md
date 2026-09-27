# Authentication, User and Tenant Profile API

All response/error conventions are defined in the [API Design](../../docs/chapter-05-software-architecture/05-api-design.md).

## Authentication and current user

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `POST /api/auth/login` | Authenticate an existing account. | Public; rate limited. | `{email,password}` → `200 {access_token,token_type:"Bearer",user:{id,email,role}}`. | Email/password required; invalid credentials `401 UNAUTHENTICATED`; malformed `400`; rate limit `429`. |
| `POST /api/auth/logout` | End current session/token per chosen session strategy. | Bearer; caller only. | No body → `204`. | Invalid token `401`; no resource body. |
| `GET /api/users/me` | Return current user identity/context. | Bearer; caller only. | No body → `200 {id,email,role,is_active}`. | `401` invalid token; inactive user is rejected by auth policy. |

No registration endpoint is specified because valid accounts are an explicit Chapter 3 assumption. Password hashes are never returned.

## Tenant Profile management

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/tenant-profiles` | List tenant profiles for management. | Bearer; Manager/Landlord only. | Pagination query → `200 {items:[{id,user_id,full_name,phone_number}],page,page_size}`. | Page bounds `400`; role `403`; `401`. |
| `POST /api/tenant-profiles` | Create profile for an existing Tenant user. | Bearer; Manager/Landlord only. | `{user_id,full_name,phone_number?}` → `201 {id,user_id,full_name,phone_number}`. | UUID/name required; target user must have `TENANT` role; duplicate profile `409`; role `403`; `400/401`. |
| `GET /api/tenant-profiles/{id}` | Get tenant profile. | Bearer; Manager/Landlord, or the profile’s Tenant. | Path UUID → `200 {id,user_id,full_name,phone_number}`. | Bad UUID `400`; ownership/role `403`; absent `404`; `401`. |
| `PATCH /api/tenant-profiles/{id}` | Update tenant contact/profile fields. | Bearer; Manager/Landlord, or profile owner for own allowed contact fields. | `{full_name?,phone_number?}` → `200` updated profile. | At least one allowed field; name format `400`; ownership field changes forbidden `403`; absent `404`; `401`. |

`user_id` is immutable after profile creation. The backend does not expose credentials or let client input change a user role through this API.
