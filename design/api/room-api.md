# Room API

All endpoints require Bearer authentication. Manager/Landlord access is limited to rooms under owned properties; Tenant may read only a room associated with an active own contract.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/properties/{propertyId}/rooms` | List rooms in a property. | Bearer; owning Manager/Landlord. | Path UUID + pagination → `200 {items:[{id,room_code,status}],page,page_size}`. | UUID/page `400`; ownership `403`; property `404`; `401`. |
| `POST /api/properties/{propertyId}/rooms` | Add room to property. | Bearer; owning Manager/Landlord. | `{room_code,status?}` → `201 {id,property_id,room_code,status}`. | Nonblank code/status enum; duplicate `(property_id,room_code)` `409`; ownership `403`; `400/401/404`. |
| `GET /api/rooms/{id}` | Get room detail. | Bearer; owning Manager/Landlord or entitled Tenant. | Path UUID → `200 {id,property_id,room_code,status}`. | UUID `400`; relationship `403`; absent `404`; `401`. |
| `PATCH /api/rooms/{id}` | Update room code/status. | Bearer; owning Manager/Landlord. | `{room_code?,status?}` → `200` room. | Nonempty field/enum; duplicate code `409`; invalid lifecycle `422`; ownership `403`; `400/401/404`. |
| `DELETE /api/rooms/{id}` | Remove a room from active management without deleting its history. | Bearer; owning Manager/Landlord. | No body → `204`; implementation maps removal to `status: INACTIVE`. | UUID `400`; active contract/open maintenance conflict `422`; ownership `403`; absent `404`; `401`. |

The REST `DELETE` action intentionally performs a soft deactivation (`status: INACTIVE`), not a database hard delete. This meets room-management deletion while honoring PostgreSQL referential integrity and Maintenance/Contract history.
