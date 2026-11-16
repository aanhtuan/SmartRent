# 3.2 Product Requirements Document (PRD) – SmartRent

> Sprint 0 revision: see the [decision baseline](../sprint-0-decisions.md). New ownership/lifecycle/billing/preview policies are working baseline until the named review gate passes; this document is a design artifact, not implemented behavior. Canonical FR IDs follow Requirement Analysis.

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
| Landlord / property manager (`LANDLORD`) | Manage only assigned profiles and owned rental resources; no separate Admin role |
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
Tenants explicitly confirm creation of maintenance requests; processing belongs to FR-07.

### FR-07 – Process Maintenance Request
Authorized landlords process requests belonging to their properties through the allowed state transitions.

### FR-08 – Notification
The system sends notifications related to payments, contracts, and request processing.

### FR-09 – AI Assistant
Users can ask questions in natural language.

### FR-10 – AI Request Classification
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

## Sprint 0 scope clarification

Property is the ownership container for Room management. The normalized MVP working baseline restricts each Tenant profile to one managing landlord and uses trusted account provisioning; multi-landlord tenant management or ownership transfer requires a replacement decision at G2. Monthly billing is manually entered whole VND with due date under D07; no automatic rent/proration or banking confirmation. D04 preview/confirm and D09 AI schema are working baseline pending their named review gates. See the decision register for legacy ID mapping and approved versus proposed status.
