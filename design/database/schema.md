# SmartRent – PostgreSQL Logical Schema

## Scope and conventions

- Type là PostgreSQL logical type; tài liệu này không là DDL/migration.
- Mọi `id` sử dụng `uuid`, được backend/database tạo bằng UUID strategy phù hợp.
- Timestamps dùng `timestamptz`; `created_at` default `CURRENT_TIMESTAMP`, `updated_at` được application/transaction layer cập nhật khi record thay đổi.
- `*_status`, `role`, category và priority là PostgreSQL enum hoặc `text` kèm `CHECK` tương đương; lựa chọn implementation sẽ do migration chapter sau quyết định.
- FK có index riêng trừ khi đã là prefix của unique/composite index. `RESTRICT` ngăn xóa data đã có lịch sử; deactivation/status được ưu tiên cho lifecycle nghiệp vụ.

## Controlled values

| Value set | Allowed values | Default where used |
|---|---|---|
| `user_role` | `LANDLORD`, `TENANT` | Required; no database default. |
| `property_status` | `ACTIVE`, `INACTIVE` | `ACTIVE` |
| `room_status` | `AVAILABLE`, `OCCUPIED`, `INACTIVE` | `AVAILABLE` |
| `contract_status` | `ACTIVE`, `EXPIRED`, `TERMINATED` | `ACTIVE` |
| `payment_status` | `PENDING`, `PAID`, `OVERDUE` | `PENDING` |
| `maintenance_status` | `PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED` | `PENDING` |
| `maintenance_category` | `ELECTRICITY`, `PLUMBING`, `INTERNET`, `AIR_CONDITIONER`, `FURNITURE`, `CLEANING`, `OTHER` | Nullable |
| `maintenance_priority` | `LOW`, `MEDIUM`, `HIGH` | Nullable |
| `ai_classification_status` | `NOT_REQUESTED`, `CLASSIFIED`, `NEEDS_INFORMATION`, `UNAVAILABLE`, `INVALID` | `NOT_REQUESTED` |
| `notification_type` | `MAINTENANCE_CREATED`, `MAINTENANCE_UPDATED`, `PAYMENT_REMINDER`, `CONTRACT_EVENT` | Required |

## 1. `users`

**Purpose:** Identity cho authentication, role và recipient thông báo. Không lưu password plaintext.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `email` | `varchar(320)` | No | UNIQUE; normalized by application | — |
| `password_hash` | `text` | No | Password hash only | — |
| `role` | `user_role` | No | Allowed role set | — |
| `is_active` | `boolean` | No | — | `true` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |
| `updated_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Indexes: unique `users_email_uq (email)` supports login and identity uniqueness.

## 2. `tenant_profiles`

**Purpose:** Tenant-specific profile, one-to-zero/one with User. Profile can exist only for a `TENANT` role through backend validation.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `user_id` | `uuid` | No | FK → `users.id`, UNIQUE, `ON DELETE RESTRICT` | — |
| `full_name` | `varchar(200)` | No | — | — |
| `phone_number` | `varchar(30)` | Yes | — | `NULL` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |
| `updated_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Indexes: unique `tenant_profiles_user_id_uq (user_id)`.

## 3. `properties`

**Purpose:** Rental property owned/managed by a Landlord User; parent scope for rooms.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `owner_user_id` | `uuid` | No | FK → `users.id`, `ON DELETE RESTRICT` | — |
| `name` | `varchar(200)` | No | — | — |
| `address` | `text` | No | — | — |
| `status` | `property_status` | No | Allowed status set | `ACTIVE` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |
| `updated_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Indexes: `properties_owner_user_id_idx (owner_user_id)` supports managed-property authorization/listing.

## 4. `rooms`

**Purpose:** Individually managed rental room within a property.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `property_id` | `uuid` | No | FK → `properties.id`, `ON DELETE RESTRICT` | — |
| `room_code` | `varchar(80)` | No | UNIQUE with `property_id` | — |
| `status` | `room_status` | No | Allowed status set | `AVAILABLE` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |
| `updated_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Indexes: unique `rooms_property_room_code_uq (property_id, room_code)`; this also supports property-room join.

## 5. `contracts`

**Purpose:** Time-bounded rental relation between a Tenant Profile and Room, used by backend authorization for Maintenance Request creation.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `tenant_profile_id` | `uuid` | No | FK → `tenant_profiles.id`, `ON DELETE RESTRICT` | — |
| `room_id` | `uuid` | No | FK → `rooms.id`, `ON DELETE RESTRICT` | — |
| `start_date` | `date` | No | `start_date <= end_date` | — |
| `end_date` | `date` | No | `end_date >= start_date` | — |
| `status` | `contract_status` | No | Allowed status set | `ACTIVE` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |
| `updated_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Indexes: `contracts_tenant_status_idx (tenant_profile_id, status)` and `contracts_room_status_idx (room_id, status)` for active-contract authorization and lookup. Preventing overlapping active periods is a business/database constraint to add deliberately in a migration when contract lifecycle rules are finalized; it is not assumed silently here.

## 6. `payments`

**Purpose:** Rent billing/payment status for a Contract and billing period; not a banking transaction ledger.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `contract_id` | `uuid` | No | FK → `contracts.id`, `ON DELETE RESTRICT` | — |
| `billing_period` | `date` | No | UNIQUE with `contract_id`; convention: first day of billing month | — |
| `amount` | `numeric(12,2)` | No | `amount >= 0` | — |
| `status` | `payment_status` | No | Allowed status set | `PENDING` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |
| `updated_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Indexes: unique `payments_contract_period_uq (contract_id, billing_period)`; `payments_contract_status_period_idx (contract_id, status, billing_period)` supports tenant/manager rent-status views.

## 7. `maintenance_requests`

**Purpose:** Authoritative Maintenance Request workflow. AI fields are optional, validated assistance only; original description and lifecycle are never replaced by AI.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `tenant_profile_id` | `uuid` | No | FK → `tenant_profiles.id`, `ON DELETE RESTRICT` | — |
| `room_id` | `uuid` | No | FK → `rooms.id`, `ON DELETE RESTRICT` | — |
| `original_description` | `text` | No | Non-empty after trim is validated by backend | — |
| `category` | `maintenance_category` | Yes | Allowed category set if present | `NULL` |
| `priority` | `maintenance_priority` | Yes | Allowed priority set if present | `NULL` |
| `ai_summary` | `text` | Yes | Length/content validated by backend | `NULL` |
| `ai_confidence` | `numeric(4,3)` | Yes | `0 <= ai_confidence <= 1` when present | `NULL` |
| `ai_missing_information` | `text[]` | No | Structured missing-information output | empty array |
| `ai_classification_status` | `ai_classification_status` | No | Allowed status set | `NOT_REQUESTED` |
| `status` | `maintenance_status` | No | Workflow value; backend owns transition | `PENDING` |
| `updated_by_user_id` | `uuid` | Yes | FK → `users.id`, `ON DELETE RESTRICT` | `NULL` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |
| `updated_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Indexes: `maintenance_tenant_created_idx (tenant_profile_id, created_at DESC)` for tenant tracking; `maintenance_room_status_created_idx (room_id, status, created_at DESC)` for manager worklist; `maintenance_updated_by_idx (updated_by_user_id)` for audit lookup. A partial index on open statuses may be added only after query measurement.

## 8. `notifications`

**Purpose:** In-app notification record for a user after Maintenance, Payment or Contract event. It does not own or change source business state.

| Column | Type | Null | Key / constraint | Default |
|---|---|---:|---|---|
| `id` | `uuid` | No | PK | UUID generated |
| `recipient_user_id` | `uuid` | No | FK → `users.id`, `ON DELETE RESTRICT` | — |
| `type` | `notification_type` | No | Allowed notification type | — |
| `maintenance_request_id` | `uuid` | Yes | FK → `maintenance_requests.id`, `ON DELETE RESTRICT` | `NULL` |
| `payment_id` | `uuid` | Yes | FK → `payments.id`, `ON DELETE RESTRICT` | `NULL` |
| `contract_id` | `uuid` | Yes | FK → `contracts.id`, `ON DELETE RESTRICT` | `NULL` |
| `message` | `text` | No | Message generated by trusted backend template/use case | — |
| `read_at` | `timestamptz` | Yes | — | `NULL` |
| `created_at` | `timestamptz` | No | — | `CURRENT_TIMESTAMP` |

Constraint: a `CHECK` requires exactly one of `maintenance_request_id`, `payment_id`, `contract_id` to be non-null. This preserves referential integrity while supporting all notification sources defined by FR-07.

Indexes: `notifications_recipient_read_created_idx (recipient_user_id, read_at, created_at DESC)` supports unread/recent list; indexes on each non-null source FK support traceability as needed.

## Referential-action summary

| Parent | Child relation | Delete behavior | Rationale |
|---|---|---|---|
| `users` | profile, property, notification, latest request updater | `RESTRICT` | Preserve identity and audit/history references. |
| `properties` | rooms | `RESTRICT` | Avoid orphan room/history. |
| `rooms` | contract, request | `RESTRICT` | A room with history is deactivated, not hard deleted. |
| `tenant_profiles` | contract, request | `RESTRICT` | Preserve tenancy/request traceability. |
| `contracts` | payment, notification | `RESTRICT` | Preserve billing and event traceability. |
| `maintenance_requests` | notification | `RESTRICT` | Preserve request/notification traceability. |

Application authorization must be performed before any status/deactivation change; FK action alone never determines whether an actor may mutate a record.
