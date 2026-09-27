# Notification API

Notification records are created internally by the Notification Module after committed Maintenance/Payment/Contract events. There is deliberately no public create endpoint: a client cannot forge a notification or use notification state to alter a business resource.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/notifications` | List current user’s notifications. | Bearer; recipient is always token user. | Optional `unread=true|false`, pagination → `200 {items:[{id,type,message,read_at,created_at,source}],page,page_size}`. | Boolean/page validation `400`; `401`. |
| `GET /api/notifications/{id}` | Get a notification. | Bearer; recipient only. | Path UUID → `200 {id,type,message,read_at,created_at,source}`. | UUID `400`; other recipient `403`; absent `404`; `401`. |
| `PATCH /api/notifications/{id}` | Mark own notification as read. | Bearer; recipient only. | `{read:true}` → `200` notification with `read_at`. | `read` must be true; malformed `400`; recipient `403`; absent `404`; `401`. |

`source` is a read-only safe reference to the linked maintenance request, payment or contract. Accessing that source later remains subject to its own authorization policy.
