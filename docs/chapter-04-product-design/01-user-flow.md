# 4.1 User Flow – SmartRent

## Mục tiêu
Thiết kế User Flow cho Maintenance Request có tích hợp AI Classification, nối tiếp requirements của Chapter 3.

## Actors
- **Tenant:** tạo và theo dõi yêu cầu bảo trì.
- **Landlord/Manager:** tiếp nhận và xử lý yêu cầu.
- **AI Assistant:** hỗ trợ phân loại và tóm tắt.
- **Backend:** authorization, validation, persistence và điều phối workflow.

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
Enter Issue Description
    ↓
Backend Authorization
    ↓
AI Classification
    ├── Enough information → Category + Priority + Summary + Confidence
    └── Missing information → Ask for additional information → AI Classification
    ↓
Backend validates AI output
    ↓
Save Maintenance Request
    ↓
Notify Landlord
    ↓
PENDING → PROCESSING → COMPLETED
```

## AI Unavailable Flow
```text
Create Request
    ↓
AI Classification
    ↓
AI Service Unavailable
    ↓
Save Request Without AI Classification
    ↓
PENDING
    ↓
Manual Landlord Handling
```

## Business Rules
1. Only an authorized Tenant can create a request for the relevant room.
2. Tenant can view their own requests.
3. Landlord can manage requests belonging to assets under their management.
4. New requests start as `PENDING`.
5. AI cannot mark a request as `COMPLETED`.
6. Backend validates important AI output.
7. Manual request creation remains available when AI fails.

## Edge Cases
| Case | Expected behavior |
|---|---|
| Description too short | Ask for more information |
| AI cannot classify | Save request for manual handling |
| AI service unavailable | Save request without classification |
| Duplicate request | Inform user and allow appropriate handling |
| Room no longer managed | Reject according to authorization rules |
| Inactive contract | Prevent unauthorized request creation |
