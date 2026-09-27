# 3.3 Requirement Analysis – SmartRent

## 1. Functional Requirement Analysis

| ID | Requirement | Actor | Priority | Input | Output |
|---|---|---|---|---|---|
| FR-01 | Authentication | User | High | Email, password | Session |
| FR-02 | Room management | Landlord | High | Room data | Room record |
| FR-03 | Tenant management | Landlord | High | Tenant data | Tenant record |
| FR-04 | Contract management | Landlord | High | Contract data | Contract record |
| FR-05 | Rent tracking | Landlord/Tenant | High | Payment data | Payment status |
| FR-06 | Submit maintenance request | Tenant | High | Description, image | Request |
| FR-07 | Process maintenance request | Landlord | High | Request ID, status | Updated request |
| FR-08 | Send notifications | System | Medium | Event | Notification |
| FR-09 | AI chat | User | High | Natural language | AI response |
| FR-10 | AI-based request classification | System/AI | High | Request text | Category, priority, summary |

## 2. Maintenance Request Flow
```text
Tenant
  ↓
Enter incident details
  ↓
SmartRent Backend
  ↓
AI Classification
  ↓
Category + Priority + Summary
  ↓
Persist to database
  ↓
Landlord receives notification
  ↓
Processing
  ↓
Completed
```

## 3. Request States
```text
PENDING → PROCESSING → COMPLETED
                    ↘ CANCELLED
```

## 4. Business Rules
- Only the tenant assigned to a room may create requests related to that room.
- Tenants can view only their own requests.
- Landlords can manage only properties under their management.
- New requests have the `PENDING` status.
- AI must not autonomously change a request status to `COMPLETED`.
- AI-generated data must be validated before executing critical business operations.

## 5. Edge Cases
- The request description is too short.
- The tenant provides insufficient information.
- AI cannot determine a category.
- The AI service does not respond.
- The user submits a duplicate request.
- The room is no longer under the landlord's management.
- The tenant no longer has an active contract.

## 6. Non-functional Analysis
### Security
Enforce role-based authorization and validate permissions in the backend.

### Performance
Common queries require an appropriate data structure; AI requests can be processed asynchronously when needed.

### Reliability
If AI fails, users can still submit requests manually.

### Usability
The interface prioritizes simple interactions, clear statuses, and understandable notifications.
