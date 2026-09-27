# Maintenance Request API

## Resource representation

```json
{
  "id": "uuid",
  "room_id": "uuid",
  "original_description": "Water is leaking from the bathroom pipe.",
  "category": "PLUMBING",
  "priority": "HIGH",
  "ai_summary": "Bathroom pipe leak.",
  "ai_confidence": 0.92,
  "ai_missing_information": [],
  "ai_classification_status": "CLASSIFIED",
  "status": "PENDING",
  "created_at": "2026-09-27T10:00:00Z",
  "updated_at": "2026-09-27T10:00:00Z"
}
```

All endpoints require Bearer authentication. Tenant scope is own request plus active room contract; Manager/Landlord scope is request room under owned property. AI is never an authenticated API caller.

| Method / URL | Purpose | Authentication / authorization | Request → response | Validation / errors / statuses |
|---|---|---|---|---|
| `GET /api/maintenance-requests` | List visible requests. | Bearer; Tenant sees own; Manager/Landlord sees managed rooms. | Optional `status`, `room_id`, `priority`, pagination → `200 {items:[MaintenanceRequest],page,page_size}`. | Enum/UUID/page `400`; cross-scope filter `403`; `401`. |
| `POST /api/maintenance-requests` | Create request, optionally run initial backend-controlled classification. | Bearer; Tenant only; backend verifies active tenant-room contract. | `{room_id,original_description,run_classification?}` → `201 MaintenanceRequest`. | Room UUID/description nonblank; `run_classification` boolean; inactive contract `403` or `422`; duplicate policy `409`; `400/401/404`. New status is always `PENDING`. If AI fails, still `201` with `UNAVAILABLE`/`INVALID` classification state. |
| `GET /api/maintenance-requests/{id}` | Get request detail including original description and trusted AI metadata. | Bearer; owner Tenant or Manager/Landlord of property. | Path UUID → `200 MaintenanceRequest`. | UUID `400`; ownership `403`; absent `404`; `401`. |
| `PATCH /api/maintenance-requests/{id}/status` | Execute authorized business status transition. | Bearer; Manager/Landlord of property only. | `{status:"PROCESSING"}` → `200 MaintenanceRequest`. | Required enum; only permitted domain transitions; invalid transition `422 INVALID_STATE`; Tenant/AI provider `403`; `400/401/404`. Commit emits notification after success. |
| `POST /api/maintenance-requests/{id}/classify` | Request/retry classification through AI Adapter. | Bearer; owner Tenant or property Manager/Landlord. | Optional `{additional_information:"Leak is under bathroom sink."}` → `200` request with validated AI fields. | Additional information nonblank if present; request scope `403`; `400/401/404`; provider error `502` when explicit rerun cannot complete. Existing request/status remains unchanged on failure. |

## Classification result behavior

- Valid, sufficient result: backend persists allowed category/priority, summary, confidence and `CLASSIFIED` metadata; `status` remains unchanged.
- Valid missing-information result: response includes `ai_classification_status: "NEEDS_INFORMATION"` and `ai_missing_information`; no AI-supplied state transition occurs.
- Timeout/invalid result: existing persisted request remains `PENDING`; API returns `502 AI_PROVIDER_ERROR` for explicit classify. Initial creation still returns `201` with fallback state so manual handling is not blocked.

The endpoint does not expose provider credential, prompt, raw response or a database write route. Backend validates schema, enum, confidence range and business policy before persistence.
