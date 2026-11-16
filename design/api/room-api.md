# Room API

> Sprint 0 revision: see the [decision baseline](../../docs/sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

All endpoints require Bearer authentication. Manager/Landlord access is limited to rooms under owned properties; Tenant may read only a room associated with an active own contract.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/properties/{propertyId}/rooms` | List rooms in a property. | Bearer; owning Manager/Landlord. | Path UUID + pagination → `200 {items:[{id,room_code,status}],page,page_size}`. | UUID/page `400`; out-of-scope `404`; property `404`; `401`. |
| `POST /api/properties/{propertyId}/rooms` | Add room to property. | Bearer; owning Manager/Landlord. | `{room_code}` → `201 {id,property_id,room_code,status}`. | Nonblank code/status enum; duplicate `(property_id,room_code)` `409`; out-of-scope `404`; `400/401/404`. |
| `GET /api/rooms/{id}` | Get room detail. | Bearer; owning Manager/Landlord or entitled Tenant. | Path UUID → `200 {id,property_id,room_code,status}`. | UUID `400`; out-of-scope `404`; absent `404`; `401`. |
| `PATCH /api/rooms/{id}` | Update room code/status. | Bearer; owning Manager/Landlord. | `{room_code?,status?}` → `200` room. | Nonempty field/enum; duplicate code `409`; invalid lifecycle `422`; out-of-scope `404`; `400/401/404`. |
| `DELETE /api/rooms/{id}` | Remove a room from active management without deleting its history. | Bearer; owning Manager/Landlord. | No body → `204`; implementation maps removal to `status: INACTIVE`. | UUID `400`; current/future ACTIVE reservation/open maintenance conflict `422`; out-of-scope `404`; absent `404`; `401`. |

The REST `DELETE` action intentionally performs a soft deactivation (`status: INACTIVE`), not a database hard delete. This meets room-management deletion while honoring PostgreSQL referential integrity and Maintenance/Contract history.

## Occupancy and lifecycle (WB D05/D06)

Response status is INACTIVE when administratively deactivated; otherwise OCCUPIED exactly when an ACTIVE contract covers today in the business timezone, else AVAILABLE. A stored occupancy projection cannot be used as proof of tenancy. Client PATCH cannot set OCCUPIED or force AVAILABLE while occupied; status PATCH is administrative deactivation/reactivation subject to the same checks. New room defaults AVAILABLE. Deactivation rejects current/future ACTIVE reservations and open maintenance (422), not only today's occupancy. Tenant reads room only during effective own tenancy. Contracts and Room communicate through public use cases and lock/recheck lifecycle writes consistently.
