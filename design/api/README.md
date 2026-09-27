# SmartRent REST API Design Artifacts

Đây là REST API contract design cho Chapter 5 – phần 5.5, không phải implementation code.

| File | Resources |
|---|---|
| [authentication-api.md](authentication-api.md) | Authentication, current User, Tenant Profile và AI Assistant. |
| [property-api.md](property-api.md) | Properties. |
| [room-api.md](room-api.md) | Rooms. |
| [contract-api.md](contract-api.md) | Contracts. |
| [payment-api.md](payment-api.md) | Payments. |
| [maintenance-api.md](maintenance-api.md) | Maintenance Requests và AI classification. |
| [notification-api.md](notification-api.md) | Notifications. |

Common error envelope and architecture/AI guardrails are defined in [Chapter 5.5 API Design](../../docs/chapter-05-software-architecture/05-api-design.md). All protected endpoints authorize at backend; the AI provider has no direct API or database access.
