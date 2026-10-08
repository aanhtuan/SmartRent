# Contract API

> Sprint 0 revision: see the [decision baseline](../../docs/sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

All endpoints require Bearer authentication. Manager/Landlord is scoped to the property containing the contract room. Tenant can only read contracts whose `tenant_profile.user_id` is the caller.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/contracts` | List contracts visible to caller. | Bearer; Manager/Landlord sees managed rooms; Tenant sees own. | Optional `room_id`, `status`, pagination → `200 {items:[{id,tenant_profile_id,room_id,start_date,end_date,status}],page,page_size}`. | UUID/status/page `400`; unauthorized filter target `404`; `401`. |
| `POST /api/contracts` | Create a tenant-room rental contract. | Bearer; Manager/Landlord owning room property. | `{tenant_profile_id,room_id,start_date,end_date,status?}` → `201` contract. | UUID/date required; `start_date <= end_date`; room out-of-scope `404`; duplicate/overlap conflict `409`; `400/401/404`. |
| `GET /api/contracts/{id}` | Get a contract. | Bearer; authorized manager or contract tenant. | Path UUID → `200` contract. | UUID `400`; out-of-scope `404`; absent `404`; `401`. |
| `PATCH /api/contracts/{id}` | Update permitted contract dates/status. | Bearer; authorized Manager/Landlord. | `{start_date?,end_date?,status?}` → `200` contract. | Date ordering/status enum; conflict with lifecycle/payments `422` or overlap `409`; out-of-scope `404`; `400/401/404`. |

Changing contract status does not by itself authorize any prior client request. Maintenance creation rechecks the current active contract server-side.

## Date, scope and concurrency policy (WB D03/D05/D06)

Creator must own room property AND manage the tenant profile. ACTIVE contract is currently effective only when start_date <= business today <= end_date and property/room is active. Tenant can still read own historical contracts. Dates are inclusive; ACTIVE reservations for one room cannot overlap even when future-dated. Adjacent contracts require next start_date > prior end_date. MVP single-tenant room; no shared-room assumption.

ACTIVE -> EXPIRED after end date; ACTIVE -> TERMINATED via accepted termination policy. Terminal contracts cannot reactivate or have dates edited. At G2 review future cancellation/termination semantics before implementing them. To prevent concurrent overlap, serialize create/date/status changes using the same room-level transaction lock and recheck overlaps inside the transaction; select any additional database exclusion constraint at migration design. Test both create and PATCH races on PostgreSQL. API 409 is an invariant outcome, not evidence a database mechanism already exists.
