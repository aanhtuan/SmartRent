# Property API

> Sprint 0 revision: see the [decision baseline](../../docs/sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

All property endpoints require Bearer authentication and belong to the Property module. A Manager/Landlord may access only properties where `owner_user_id` equals the authenticated user; Tenant has no property CRUD endpoint in MVP.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/properties` | List caller-managed properties. | Bearer; Manager/Landlord; ownership is implicit scope. | Pagination → `200 {items:[{id,name,address,status}],page,page_size}`. | Page bounds `400`; role `403`; `401`. |
| `POST /api/properties` | Create a managed property. | Bearer; Manager/Landlord. Owner derives from token. | `{name,address,status?}` → `201 {id,name,address,status,created_at}`. | Name/address required; status enum; invalid `400`; role `403`; `401`. |
| `GET /api/properties/{id}` | Get one property. | Bearer; Manager/Landlord owning property. | Path UUID → `200 {id,name,address,status,created_at,updated_at}`. | UUID `400`; not owned/not found `404`; `401`. |
| `PATCH /api/properties/{id}` | Update property details/status. | Bearer; owning Manager/Landlord. | `{name?,address?,status?}` → `200` property. | At least one mutable field; enum/blank validation `400`; inactive/history conflict `422`; out-of-scope `404`; absent `404`; `401`. |

Delete is intentionally omitted: Chapter 5 database design uses deactivation to preserve Room/Contract/Maintenance history.
