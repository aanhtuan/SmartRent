# SmartRent Maintenance User Flow

> Sprint 0 revision: see the [decision baseline](../../docs/sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

## Main Flow
```text
Tenant Login
    ↓
Dashboard
    ↓
Maintenance Requests
    ↓
Create Request
    ↓
Enter Issue
    ↓
Backend Authorization
    ↓
AI Classification
    ↓
Review AI Result
    ↓
Explicit Confirm and Reauthorize
    ↓
Save Request
    ↓
Notify Landlord
    ↓
PENDING
    ↓
PROCESSING
    ↓
COMPLETED
```

## Missing Information
```text
AI Classification
      ↓
Insufficient information
      ↓
Request additional information
      ↓
Tenant provides information
      ↓
AI Classification
```

## AI Unavailable
```text
Create Request
      ↓
AI unavailable
      ↓
User confirms manual submit
      ↓
Save request without classification
      ↓
PENDING
      ↓
Manual Landlord handling
```

## Design Principles
- AI supports classification.
- Backend controls authorization and validation.
- AI does not directly access the database.
- AI does not complete critical business actions.
- Manual operation remains available when AI fails.
