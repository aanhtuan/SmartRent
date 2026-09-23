# 3.5 Feature Specification – SmartRent

## Feature F-01: AI Maintenance Assistant

### 1. Objective
Automatically analyze tenant maintenance request content to support classification, prioritization, and summarization.

### 2. User
- Tenant.
- Landlord/property manager.

### 3. Input
```json
{
  "request_text": "The air conditioner in my room is not cooling and is making a loud noise.",
  "room_id": "A101"
}
```

### 4. AI Processing
AI performs the following steps:
1. Read the content.
2. Determine the incident type.
3. Determine the priority level.
4. Summarize the incident.
5. Identify missing information when necessary.

### 5. Output
```json
{
  "category": "AIR_CONDITIONER",
  "priority": "MEDIUM",
  "summary": "The air conditioner in room A101 is not cooling and is making a loud noise.",
  "missing_information": [],
  "confidence": 0.90
}
```

### 6. Category
- ELECTRICITY
- PLUMBING
- INTERNET
- AIR_CONDITIONER
- FURNITURE
- CLEANING
- OTHER

### 7. Priority
- LOW
- MEDIUM
- HIGH

### 8. Error Handling
If AI cannot classify the request:
```json
{
  "category": "OTHER",
  "priority": "MEDIUM",
  "summary": "...",
  "missing_information": ["Please clearly describe the equipment experiencing the issue."]
}
```

If the AI service is unavailable, the system still allows the request to be saved with an unclassified status.

## Feature F-02: AI Assistant

### Objective
Allow users to ask natural-language questions about functions and information they are authorized to access.

### Example
User:
> How much do I still need to pay this month?

AI:
> The system can answer based on the payment data that the backend provides for your account.

### Rules
- AI must not access the database directly outside a controlled backend mechanism.
- Do not disclose other users' data.
- Do not autonomously confirm financial transactions.
- Do not fabricate information when data does not exist.

## Feature F-03: Maintenance Request Management

### Main Flow
```text
Create Request
    ↓
AI Classification
    ↓
Save Request
    ↓
Notify Landlord
    ↓
Processing
    ↓
Completed
```

### Acceptance Criteria
- The request is saved successfully.
- The request has an ID.
- The request has a category/priority or an unclassified status.
- The tenant can view the request.
- The landlord can update the status.
