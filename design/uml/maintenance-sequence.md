# SmartRent — Maintenance Request Sequence

Working baseline D04/D09/D10; review at G4. See [API contract](../api/maintenance-api.md).

```mermaid
sequenceDiagram
  actor T as Tenant
  participant F as Frontend
  participant M as Authorized Maintenance API/Service
  participant A as Gemini Adapter + Validator
  participant DB as PostgreSQL
  participant N as Notification
  T->>F: Enter original description and room
  F->>M: POST preview
  M->>M: Authenticate, authorize effective tenancy
  M->>A: Minimal permitted context (no DB transaction held)
  A-->>M: Valid suggestion / missing info / unavailable / invalid
  M-->>F: Bound preview token, state and expiry; no business row/event
  alt missing information
    F-->>T: Ask for details or offer manual submit
    T->>F: Edit and re-preview, or select manual submit
  else sufficient result or provider failure
    F-->>T: Review suggestion or manual fallback
  end
  T->>F: Explicit confirm
  F->>M: POST create with submission key; optional preview token
  M->>M: Reauthorize; verify token/input/expiry if supplied
  M->>DB: Short transaction: key/digest check and create PENDING
  DB-->>M: Commit, or return existing identical submission
  opt newly committed request
    M-->>N: Post-commit event
    N->>DB: Persist recipient notification
  end
  M-->>F: 201 new / 200 identical retry
```

No token means manual create without Gemini call (NOT_REQUESTED). Missing-info preview is not persistence; submit manually without token or provide details. Provider-error preview never creates a request automatically. Reclassification on existing requests validates metadata only; failure returns 502 without changing prior state/result. Business status transitions are separate manager-authorized calls. Tenant history remains visible after expiry, while new create requires current eligibility.

Notification event is best-effort in-process across crashes; no durable outbox/recovery guarantee is claimed. There is no AI -> DB/auth/financial confirmation/completion path.
