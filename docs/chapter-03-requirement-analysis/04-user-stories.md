# 3.4 User Stories & Acceptance Criteria – SmartRent

## US-01 – Authentication
**As a** user, **I want** to log in, **so that** I can access features according to my role.

### Acceptance Criteria
- AC01: When a user enters valid credentials, the system authenticates the user successfully.
- AC02: When credentials are invalid, the system displays an error.
- AC03: The user is redirected to the interface appropriate for their role.

## US-02 – Room Management
**As a** landlord, **I want** to manage rooms, **so that** I can track my rental properties.

### Acceptance Criteria
- AC01: The landlord can add a room.
- AC02: The landlord can edit room information.
- AC03: The landlord can view room status.
- AC04: The system rejects invalid room data.

## US-03 – Tenant Management
**As a** landlord, **I want** to manage tenants, **so that** I know who is renting each room.

### Acceptance Criteria
- AC01: The landlord can add a tenant.
- AC02: The landlord can assign a tenant to a room.
- AC03: The landlord can view tenant information.
- AC04: The landlord can update tenant information.

## US-04 – Rent Tracking
**As a** tenant, **I want** to view my rent status, **so that** I know what I need to pay.

### Acceptance Criteria
- AC01: The system displays the billing period.
- AC02: The system displays the payment amount.
- AC03: The system displays whether the payment has been made.

## US-05 – Submit Maintenance Request
**As a** tenant, **I want** to submit a maintenance request, **so that** the landlord can resolve my problem.

### Acceptance Criteria
- AC01: The tenant can enter an incident description.
- AC02: The tenant can select a category or have AI classify the request.
- AC03: The tenant can attach images if the system supports attachments.
- AC04: After submission, the request has a unique identifier.
- AC05: The initial status is `PENDING`.

## US-06 – Track Request
**As a** tenant, **I want** to track my request status, **so that** I know whether it is being handled.

### Acceptance Criteria
- AC01: The tenant can view a list of their requests.
- AC02: Each request has a status.
- AC03: The status is updated when the landlord processes the request.

## US-07 – AI Assistant
**As a** user, **I want** to ask AI questions, **so that** I can receive quick support.

### Acceptance Criteria
- AC01: The system provides a question input field.
- AC02: AI responds using the SmartRent context.
- AC03: When data is missing, AI does not fabricate information.
- AC04: The system can process Vietnamese-language questions.

## US-08 – AI Request Classification
**As a** landlord, **I want** AI to classify maintenance requests, **so that** I can prioritize work.

### Acceptance Criteria
- AC01: AI receives the request content.
- AC02: AI returns a category.
- AC03: AI returns a priority.
- AC04: AI generates a summary.
- AC05: When uncertain, AI returns a low confidence value or requests additional information.

## US-09 – Notifications
**As a** user, **I want** to receive notifications, **so that** I do not miss important updates.

### Acceptance Criteria
- AC01: The system sends a notification when a request is updated.
- AC02: The system sends notifications for important payment and contract events.
