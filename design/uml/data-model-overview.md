# SmartRent — Data Model / Entity Relationship Overview

The [logical database ERD](../database/erd.md) is the shared ER rendering; [schema](../database/schema.md) defines columns, keys and value sets. This overview intentionally does not maintain a competing Mermaid ERD.

| Relationship | Mapping / authorization |
|---|---|
| User -> Property -> Room | properties.owner_user_id -> users.id; rooms.property_id -> properties.id. Room has no direct landlord FK. |
| User -> Tenant Profile | tenant_profiles.user_id unique; WB manager_landlord_id and trusted account provisioning establish pre-contract manager scope. |
| Tenant Profile -> Contract -> Room | contracts.tenant_profile_id and room_id; effective tenancy checks status plus inclusive dates, not client IDs. |
| Contract -> Payment | payments.contract_id; one billing period per contract; manual VND amount and due date under WB D07. |
| Tenant Profile / Room -> Maintenance | tenant_profile_id, room_id; explicit confirmation creates request; submission key/digest protects retries. |
| Maintenance -> AI metadata | Embedded category/priority/summary/confidence/missing-info/state. No independent AI_CLASSIFICATION table. |
| User -> Notification -> event source | Recipient-owned; exactly one Maintenance/Payment/Contract source FK. Best-effort post-commit event delivery until durability is separately accepted. |

Working-baseline additions and gates are in [decisions](../../docs/sprint-0-decisions.md). These are logical models, not executed DDL. AI Provider has no database principal, credentials, FK or direct persistence access. Original description and backend-owned state remain authoritative; historical reads retain caller scope.
