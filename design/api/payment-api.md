# Payment API

> Sprint 0 revision: see the [decision baseline](../../docs/sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

All endpoints require Bearer authentication. Manager/Landlord operates only on payments for contracts in managed properties; Tenant can view payment records for own contracts. No banking integration or payment-confirmation endpoint is included because it is out of MVP scope.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/payments` | List payment status visible to caller. | Bearer; manager scope or own tenant contracts. | Optional `contract_id`, `status`, pagination → `200 {items:[{id,contract_id,billing_period,amount,status}],page,page_size}`. | UUID/status/page `400`; unauthorized scope `404`; `401`. |
| `POST /api/payments` | Create rent payment/billing record. | Bearer; Manager/Landlord owning contract room. | `{contract_id,billing_period,due_date,amount}` → `201` payment. | UUID/date/amount >= 0; status enum; period duplicate `409`; out-of-scope `404`; `400/401/404`. |
| `GET /api/payments/{id}` | Get payment status. | Bearer; authorized manager or contract tenant. | Path UUID → `200` payment. | UUID `400`; out-of-scope `404`; absent `404`; `401`. |
| `PATCH /api/payments/{id}` | Update payment status/allowed billing metadata. | Bearer; authorized Manager/Landlord. | `{status?,amount?,due_date?}` → `200` payment. | At least one allowed field; amount/status validation `400`; lifecycle conflict `422`; out-of-scope `404`; `401/404`. |

AI Assistant may answer a caller about these records only through backend-authorized context; it cannot use this API or confirm transactions.

## Billing policy (WB D07)

Amounts are manually entered monthly billing values, whole VND and >= 0; no contract-derived rent/proration or banking verification is implemented by this contract. billing_period is the first day of its month; due_date is required and must not precede billing_period. Initial state is PENDING, or computed OVERDUE if already past due. PAID is an authorized manager's manual record and terminal in this MVP: amount/due_date cannot be edited after PAID (422); reversal/correction requires a separately accepted flow. For unpaid rows OVERDUE is computed using today > due_date in Asia/Ho_Chi_Minh, otherwise PENDING; client cannot force PENDING/OVERDUE contrary to the clock. PATCH accepts status PAID only when transitioning an unpaid record. Tenant may read own history after contract expiry. Currency/due-date/terminal-state rules require G3 acceptance before implementation.
