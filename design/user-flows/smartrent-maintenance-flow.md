# SmartRent Maintenance User Flow

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
