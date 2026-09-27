# 3.2 Product Requirements Document (PRD) – SmartRent

## 1. Product Overview
SmartRent is an AI-integrated rental property management system that supports landlords, property managers, and tenants in daily operational activities.

## 2. Product Goals
- Centrally manage rental property data.
- Simplify management operations.
- Provide transparent maintenance request statuses.
- Improve the tenant experience.
- Apply AI to repetitive tasks and tasks that require information classification.

## 3. User Roles

| Role | Primary Permissions |
|---|---|
| Admin/Landlord | Manage all data |
| Tenant | View personal data and submit requests |
| AI Assistant | Provide answers and analysis using authorized data |

## 4. Functional Requirements

### FR-01 – Authentication
Users can log in and are authorized according to their roles.

### FR-02 – Room Management
Landlords can add, edit, delete, and view room status.

### FR-03 – Tenant Management
Landlords manage tenant information and assigned rooms.

### FR-04 – Contract Management
Store and retrieve contract information.

### FR-05 – Rent Management
Track rent and payment status.

### FR-06 – Maintenance Request
Tenants create maintenance requests; landlords view, update, and complete them.

### FR-07 – Notification
The system sends notifications related to payments, contracts, and request processing.

### FR-08 – AI Assistant
Users can ask questions in natural language.

### FR-09 – AI Request Classification
AI classifies maintenance requests and recommends priority levels.

## 5. Non-functional Requirements
- Protect user information.
- Enforce data-access authorization.
- Provide an easy-to-use interface.
- Provide clearly structured APIs.
- Support scalability.
- Provide a handling mechanism for cases where AI has insufficient information.
- Prevent AI from autonomously performing critical actions unless explicitly authorized by the system.

## 6. AI Requirements
The AI Assistant must:
- Understand natural Vietnamese-language questions.
- Respond using the SmartRent context.
- Not fabricate data when the system does not provide the information.
- Ask users for additional information when necessary.

AI Classification must:
- Receive request content.
- Determine a category.
- Determine a priority.
- Generate a summary.
- Return structured results.

## 7. MVP Scope
### In Scope
Room, tenant, contract, rent, maintenance request, notification, and AI management.

### Out of Scope
- Live banking integration.
- Professional accounting system.
- Automated legal document recognition.
- IoT-based control of in-room devices.

## 8. Assumptions
- Users have valid accounts.
- Room and tenant data are stored in the database.
- AI accesses only the data authorized by the backend.
