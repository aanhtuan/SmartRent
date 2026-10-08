# SmartRent – Entity Relationship Diagram

> Sprint 0 revision: see the [decision baseline](../../docs/sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

## Logical ERD

```mermaid
erDiagram
  USERS {
    uuid id PK
    varchar email UK
    user_role role
    boolean is_active
    uuid provisioned_by_user_id FK
  }
  TENANT_PROFILES {
    uuid id PK
    uuid user_id FK, UK
    uuid manager_landlord_id FK
    varchar full_name
    varchar phone_number
  }
  PROPERTIES {
    uuid id PK
    uuid owner_user_id FK
    varchar name
    text address
    property_status status
  }
  ROOMS {
    uuid id PK
    uuid property_id FK
    varchar room_code
    room_status status
  }
  CONTRACTS {
    uuid id PK
    uuid tenant_profile_id FK
    uuid room_id FK
    date start_date
    date end_date
    contract_status status
  }
  PAYMENTS {
    uuid id PK
    uuid contract_id FK
    date billing_period
    numeric amount
    date due_date
    payment_status status
  }
  MAINTENANCE_REQUESTS {
    uuid id PK
    uuid tenant_profile_id FK
    uuid room_id FK
    text original_description
    uuid submission_key
    text submission_digest
    maintenance_category category
    maintenance_priority priority
    text ai_summary
    numeric ai_confidence
    ai_classification_status ai_classification_status
    maintenance_status status
    datetime created_at
    datetime updated_at
  }
  NOTIFICATIONS {
    uuid id PK
    uuid recipient_user_id FK
    notification_type type
    uuid maintenance_request_id FK
    uuid payment_id FK
    uuid contract_id FK
    datetime read_at
    datetime created_at
  }

  USERS ||--o| TENANT_PROFILES : has
  USERS ||--o{ TENANT_PROFILES : manages
  USERS o|--o{ USERS : provisions
  USERS ||--o{ PROPERTIES : owns
  PROPERTIES ||--o{ ROOMS : contains
  TENANT_PROFILES ||--o{ CONTRACTS : signs
  ROOMS ||--o{ CONTRACTS : is_rented_by
  CONTRACTS ||--o{ PAYMENTS : produces
  TENANT_PROFILES ||--o{ MAINTENANCE_REQUESTS : creates
  ROOMS ||--o{ MAINTENANCE_REQUESTS : concerns
  USERS ||--o{ NOTIFICATIONS : receives
  MAINTENANCE_REQUESTS o|--o{ NOTIFICATIONS : source_for
  PAYMENTS o|--o{ NOTIFICATIONS : source_for
  CONTRACTS o|--o{ NOTIFICATIONS : source_for
```

## Cardinality and integrity notes

| Relationship | Cardinality | Constraint / policy |
|---|---|---|
| User – Tenant Profile | `1 : 0..1` | `tenant_profiles.user_id` is UNIQUE and mandatory. Backend ensures role is `TENANT`. |
| User – Property | `1 : 0..*` | `properties.owner_user_id` is mandatory. Backend verifies manager/landlord ownership for managed resources. |
| Property – Room | `1 : 0..*` | Every room has one property; room code is unique within property. |
| Tenant Profile – Contract – Room | `1 : 0..*` on each side | Each contract names one tenant and one room. Active period/status is verified by backend for request authorization. |
| Contract – Payment | `1 : 0..*` | One payment per contract and billing period. |
| Tenant Profile / Room – Maintenance Request | `1 : 0..*` | Every request has one creator tenant and one room; active contract check happens before insert. |
| User – Notification | `1 : 0..*` | One recipient per notification. |
| Event source – Notification | `1 : 0..*` logically | Exactly one of three source FK columns is non-null, enforced by check constraint. |

## AI and workflow boundary

`category`, `priority`, `ai_summary`, `ai_confidence`, `ai_missing_information` (documented in the schema) and `ai_classification_status` belong to `MAINTENANCE_REQUESTS` because they describe the current request. They are optional and only persisted by the backend after AI-result validation. The external AI Provider has no ERD entity, FK, credential or direct link to PostgreSQL.

`MAINTENANCE_REQUESTS.status` defaults to `PENDING` and is controlled by Maintenance business rules. AI metadata never grants authorization and cannot transition a request to `COMPLETED`.
