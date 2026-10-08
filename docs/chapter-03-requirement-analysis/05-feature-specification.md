# 3.5 Feature Specification – SmartRent

> Sprint 0 revision: see the [decision baseline](../sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

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
  "room_id": "8e8b1b23-7aa8-4bfa-aedb-b64183c797f0"
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
  "missing_information": ["Please clearly describe the equipment experiencing the issue."],
  "confidence": 0.0
}
```

If Gemini is unavailable, preview shows fallback and the user can explicitly confirm manual submission. Preview alone does not save a business request. Missing-info outputs include confidence; example values are not policy thresholds.

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
Open Request Form
    ↓
Authorized AI Preview (no request persistence)
    ↓
User Review / Explicit Confirm (or manual submit)
    ↓
Reauthorize and Save Request
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
