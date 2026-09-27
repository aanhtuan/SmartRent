# Payment API

All endpoints require Bearer authentication. Manager/Landlord operates only on payments for contracts in managed properties; Tenant can view payment records for own contracts. No banking integration or payment-confirmation endpoint is included because it is out of MVP scope.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/payments` | List payment status visible to caller. | Bearer; manager scope or own tenant contracts. | Optional `contract_id`, `status`, pagination → `200 {items:[{id,contract_id,billing_period,amount,status}],page,page_size}`. | UUID/status/page `400`; unauthorized scope `403`; `401`. |
| `POST /api/payments` | Create rent payment/billing record. | Bearer; Manager/Landlord owning contract room. | `{contract_id,billing_period,amount,status?}` → `201` payment. | UUID/date/amount >= 0; status enum; period duplicate `409`; ownership `403`; `400/401/404`. |
| `GET /api/payments/{id}` | Get payment status. | Bearer; authorized manager or contract tenant. | Path UUID → `200` payment. | UUID `400`; relation `403`; absent `404`; `401`. |
| `PATCH /api/payments/{id}` | Update payment status/allowed billing metadata. | Bearer; authorized Manager/Landlord. | `{status?,amount?}` → `200` payment. | At least one allowed field; amount/status validation `400`; lifecycle conflict `422`; ownership `403`; `401/404`. |

AI Assistant may answer a caller about these records only through backend-authorized context; it cannot use this API or confirm transactions.
