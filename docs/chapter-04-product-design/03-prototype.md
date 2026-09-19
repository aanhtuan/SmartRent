# 4.3 Prototype – SmartRent

## Mục tiêu
Mô phỏng interaction và state transition của Maintenance Request; chưa triển khai backend thật.

## Main Scenario
```text
Dashboard
  ↓
Maintenance Requests
  ↓
Create Request
  ↓
Enter Description
  ↓
AI Classification
  ↓
Review AI Result
  ↓
Request Detail
  ↓
Landlord Processing
  ↓
Completed
```

## Alternative Scenarios

### Missing Information
```text
AI Classification
      ↓
Insufficient Information
      ↓
Request Additional Information
      ↓
Tenant Provides Information
      ↓
AI Classification
```

### AI Unavailable
```text
Submit Request
      ↓
AI Unavailable
      ↓
Save Request Without Classification
      ↓
PENDING
      ↓
Manual Landlord Handling
```

## Prototype Interactions
| From | Action | To |
|---|---|---|
| Dashboard | Click Maintenance | Request List |
| Request List | Click Create | Create Request |
| Create Request | Submit | AI Classification |
| AI Classification | Missing info | More Information |
| More Information | Submit | AI Classification |
| AI Classification | Confirm | Request Detail |
| Landlord Dashboard | Open request | Request Detail |
| Request Detail | Start processing | PROCESSING |
| Request Detail | Complete task | COMPLETED |

## AI Result States

### Successful
```text
Category: PLUMBING
Priority: HIGH
Summary: Water leak in bathroom pipe.
Missing Information: []
Confidence: 0.92
```

### Insufficient Information
```text
Category: OTHER
Priority: MEDIUM
Summary: Insufficient information.
Missing Information:
- location
- symptom
Confidence: 0.35
```

## Acceptance Criteria
- User can reach the maintenance form from dashboard.
- User can submit an issue description.
- Prototype shows AI classification.
- Prototype shows missing-information state.
- Prototype shows AI-unavailable fallback.
- User can review request detail.
- Landlord can move the request through the designed status flow.
- Original description remains visible.
- AI is presented as assistance, not an uncontrolled business actor.

## Limitations
Prototype does not implement real authentication, database persistence, AI API integration, real-time notifications or payment processing. These belong to later chapters.
