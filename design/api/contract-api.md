# Contract API

All endpoints require Bearer authentication. Manager/Landlord is scoped to the property containing the contract room. Tenant can only read contracts whose `tenant_profile.user_id` is the caller.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/contracts` | List contracts visible to caller. | Bearer; Manager/Landlord sees managed rooms; Tenant sees own. | Optional `room_id`, `status`, pagination → `200 {items:[{id,tenant_profile_id,room_id,start_date,end_date,status}],page,page_size}`. | UUID/status/page `400`; unauthorized filter target `403`; `401`. |
| `POST /api/contracts` | Create a tenant-room rental contract. | Bearer; Manager/Landlord owning room property. | `{tenant_profile_id,room_id,start_date,end_date,status?}` → `201` contract. | UUID/date required; `start_date <= end_date`; room ownership `403`; duplicate/overlap conflict `409`; `400/401/404`. |
| `GET /api/contracts/{id}` | Get a contract. | Bearer; authorized manager or contract tenant. | Path UUID → `200` contract. | UUID `400`; relation `403`; absent `404`; `401`. |
| `PATCH /api/contracts/{id}` | Update permitted contract dates/status. | Bearer; authorized Manager/Landlord. | `{start_date?,end_date?,status?}` → `200` contract. | Date ordering/status enum; conflict with lifecycle/payments `422` or overlap `409`; ownership `403`; `400/401/404`. |

Changing contract status does not by itself authorize any prior client request. Maintenance creation rechecks the current active contract server-side.
