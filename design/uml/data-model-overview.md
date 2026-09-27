# SmartRent – Data Model / Entity Relationship Overview

## ER overview

PostgreSQL is the authoritative store. The diagram is a logical relationship model, not a schema migration. AI provider data is never a database principal and is not an entity with direct persistence access.

```mermaid
erDiagram
  USER {
    uuid id PK
    string email
    string role
  }
  ROOM {
    uuid id PK
    uuid manager_landlord_id FK
    string room_code
    string status
  }
  CONTRACT {
    uuid id PK
    uuid tenant_id FK
    uuid room_id FK
    string status
    date start_date
    date end_date
  }
  PAYMENT {
    uuid id PK
    uuid contract_id FK
    string billing_period
    decimal amount
    string payment_status
  }
  MAINTENANCE_REQUEST {
    uuid id PK
    uuid tenant_id FK
    uuid room_id FK
    string original_description
<<<<<<< HEAD
    string_array ai_missing_information
=======
>>>>>>> origin/main
    string status
    datetime created_at
  }
  AI_CLASSIFICATION {
    uuid maintenance_request_id PK, FK
    string category
    string priority
    string summary
    decimal confidence
    string validation_state
  }
  NOTIFICATION {
    uuid id PK
    uuid recipient_user_id FK
    string type
    string message
    datetime created_at
    datetime read_at
  }

  USER ||--o{ ROOM : manages
  USER ||--o{ CONTRACT : is_tenant_on
  ROOM ||--o{ CONTRACT : has
  CONTRACT ||--o{ PAYMENT : has
  USER ||--o{ MAINTENANCE_REQUEST : creates
  ROOM ||--o{ MAINTENANCE_REQUEST : concerns
  MAINTENANCE_REQUEST ||--o| AI_CLASSIFICATION : has_validated_metadata
  USER ||--o{ NOTIFICATION : receives
```

## Data constraints that support the requirements

| Data rule | Reason |
|---|---|
| `MAINTENANCE_REQUEST.tenant_id` and `.room_id` are checked against an active `CONTRACT` in the backend use case. | Enforces tenant/room eligibility before creation; client ID alone is not trusted. |
| New `MAINTENANCE_REQUEST.status` is `PENDING`. | Chapter 3/4 maintenance workflow. |
| `AI_CLASSIFICATION` is zero-or-one per request in this overview and has `validation_state`. | AI metadata is optional and must be validated before it is trusted. |
| Category and priority use allowed sets; confidence is constrained to a valid range. | Supports Feature F-01 structured output. |
| `original_description` remains on the request independently of classification. | Ensures user input remains traceable and visible in request detail. |
| Notification records have an authorized recipient and are created after a committed domain event. | Supports FR-08/US-09 without allowing notification to change state. |

## Boundary note

Only the backend Repository/Transaction layer accesses these entities. The external AI Provider receives minimal permitted input through AI Integration and returns a suggestion to the validator; it cannot query, insert, update or delete PostgreSQL data directly.
