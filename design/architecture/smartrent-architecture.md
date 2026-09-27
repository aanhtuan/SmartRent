# SmartRent – Architecture Design Artifact

## Scope and constraints

- Architecture: **Modular Monolith**, **Layered Architecture**, **REST API**, **PostgreSQL**.
- AI đi qua **AI Integration Module / Gateway / Adapter**.
- Không thiết kế microservices cho MVP.
- AI không có direct database access, authorization authority, quyền thay đổi critical business state hay quyền tự hoàn tất Maintenance Request.

## Component and security boundaries

```mermaid
flowchart TB
  subgraph Client[Client boundary]
    T[Tenant UI]
    L[Landlord / Manager UI]
  end

  subgraph App[SmartRent Backend – Modular Monolith]
    API[REST API Controllers]
    IAM[Identity & Access\nAuthentication + authorization policy]
    subgraph Domain[Application and domain modules]
      ROOM[Room]
      TENANT[Tenant]
      CONTRACT[Contract]
      PAYMENT[Payment]
      MNT[Maintenance\nworkflow owner]
      NOTIF[Notification]
      CHAT[AI Assistant]
    end
    DATA[Repository / Transaction layer]
    AIG[AI Integration\nGateway / Provider Adapter]
    VALID[AI output validation]
  end

  DB[(PostgreSQL\nauthoritative data)]
  AI[External AI Provider]
  CH[In-app / delivery channel]

  T -->|HTTPS REST| API
  L -->|HTTPS REST| API
  API --> IAM
  IAM --> Domain
  Domain --> DATA --> DB
  MNT -->|domain event after commit| NOTIF --> CH
  MNT --> AIG
  CHAT --> AIG
  AIG -->|minimal permitted input| AI
  AI --> AIG --> VALID
  VALID -->|validated suggestion only| MNT
  VALID -->|validated answer context| CHAT

  AI -. no DB access .-> DB
  AI -. no authorization .-> IAM
  AI -. no status completion .-> MNT
```

## Layer rule

```text
Frontend → REST Controller → Application Use Case → Domain Rules/Policy
         → Repository/Transaction → PostgreSQL

Only the backend calls AI:
Business module → AI Gateway/Adapter → External AI Provider
               ← validated structured output ←
```

The controller does not query PostgreSQL directly. The AI provider does not join the application trust zone: it receives no database credentials or internal authorization capability, and its output is untrusted until validated by the backend.

## Maintenance request flow

```mermaid
flowchart TD
  A[Tenant submits description and room] --> B[REST API validation]
  B --> C{Backend authorizes\ntenant-room-active contract?}
  C -- No --> D[Reject without creating request]
  C -- Yes --> E[AI Gateway classification attempt]
  E --> F{AI output valid?}
  F -- Yes, enough info --> G[Create request: PENDING\nstore validated AI metadata]
  F -- Missing information --> H[Ask tenant for specified information]
  H --> A
  F -- No / timeout / unavailable --> I[Create request: PENDING\nwithout trusted classification]
  G --> J[Commit PostgreSQL transaction]
  I --> J
  J --> K[Publish request-created event]
  K --> L[Notify landlord / manager]
  L --> M[Authorized landlord starts: PROCESSING]
  M --> N[Authorized landlord confirms work: COMPLETED]
```

`PENDING`, `PROCESSING`, `COMPLETED` and optional `CANCELLED` are controlled by Maintenance domain rules. AI category, priority, summary and confidence are recommendations only. In particular, no AI response can transition an item to `COMPLETED`.

## AI classification contract and fallback

```text
Permitted backend input
  = request text + only necessary authorized context

Expected AI suggestion
  = category + priority + summary + missing_information + confidence

Backend validation
  = schema + allowed enums + field types/limits + confidence range + business rules

Failure (provider/network/timeout/invalid response)
  = save original request as PENDING → notify manual handling
```

The UI must clearly communicate the fallback specified in Chapter 4: request received, classification temporarily unavailable, manual processing continues. Original description is retained and shown in request detail.

## Notification event flow

```mermaid
sequenceDiagram
  participant U as Authorized user
  participant M as Business module
  participant DB as PostgreSQL
  participant N as Notification module
  participant R as Recipient
  U->>M: Create request / change allowed status
  M->>DB: Commit business change
  M-->>N: Domain event after commit
  N->>DB: Store notification
  N-->>R: In-app or configured delivery
```

The notification is a reaction to an already-committed event. Delivery failure is retried/observed independently and does not reverse a completed business transaction.

## Requirement linkage

| Source | Architecture representation |
|---|---|
| Chapter 3 FR-01, role requirements | Identity & Access boundary and server-side ownership checks. |
| Chapter 3 FR-02–FR-05 | Room, Tenant, Contract, Payment modules over PostgreSQL. |
| Chapter 3 FR-06–FR-08 | Maintenance workflow and after-commit Notification Module. |
| Chapter 3 F-01/F-02 | Structured AI Adapter, validation and backend-scoped AI Assistant context. |
| Chapter 4 user flow/review | `PENDING` fallback, original description, missing-information loop and backend-owned status transition. |
