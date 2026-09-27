# 5.4 Database Design – SmartRent

## 1. Mục đích và scope

Thiết kế này mô tả logical PostgreSQL schema cho MVP SmartRent. Nó cụ thể hóa các entity được yêu cầu: User, Tenant Profile, Property, Room, Contract, Payment, Maintenance Request và Notification. Không tạo migration, DDL/SQL implementation hoặc entity mới không có nhu cầu rõ trong requirements.

AI classification được lưu như metadata đã được backend validate trên `maintenance_requests`, thay vì tạo AI database/service riêng. Quyết định này phù hợp Feature F-01 và Architecture 5.1: request vẫn được tạo `PENDING` khi AI unavailable, còn AI không có quyền truy cập PostgreSQL hay đổi business state.

## 2. Database design principles

- **Authoritative source:** PostgreSQL là nguồn dữ liệu nghiệp vụ chính; chỉ Repository/Transaction layer của backend truy cập trực tiếp.
- **Normalized ownership:** thông tin identity, tenant profile, property, room, contract, payment, maintenance và notification có responsibility riêng.
- **Backend-owned authorization:** foreign key hỗ trợ relationship, nhưng role/ownership/active-contract là policy do backend kiểm tra trong use case.
- **Validated AI metadata:** chỉ output qua AI Integration và AI Result Validator mới có thể được application ghi vào các cột AI; output raw của provider không được tin cậy hoặc persist tự do.
- **Minimal MVP:** không thêm chat history, attachment, raw AI payload hay status-history table vì requirements hiện tại chưa bắt buộc. Đó là extension có thể đánh giá sau.

## 3. Entity inventory

| Entity | Table | Lý do cần thiết |
|---|---|---|
| User | `users` | Authentication, identity, role và notification recipient. |
| Tenant Profile | `tenant_profiles` | Tách thông tin tenant khỏi shared identity và liên kết contract/request. |
| Property | `properties` | Landlord/Manager quản lý tài sản; Room cần scope theo property. |
| Room | `rooms` | Quản lý phòng, contract và Maintenance Request. |
| Contract | `contracts` | Liên kết tenant–room theo thời hạn/trạng thái, phục vụ authorization. |
| Payment | `payments` | Theo dõi kỳ tiền thuê, số tiền và payment status. |
| Maintenance Request | `maintenance_requests` | Workflow bảo trì và metadata AI đã validate. |
| Notification | `notifications` | Lưu thông báo request/payment/contract cho user. |

Chi tiết bảng ở [schema.md](../../design/database/schema.md); relationship diagram ở [erd.md](../../design/database/erd.md).

## 4. Relationships and cardinality

```text
User (Manager/Landlord) 1 ── * Property 1 ── * Room
User 1 ── 0..1 Tenant Profile
Tenant Profile 1 ── * Contract * ── 1 Room
Contract 1 ── * Payment
Tenant Profile 1 ── * Maintenance Request * ── 1 Room
User 1 ── * Notification
```

Một `Property` thuộc một owner user và có nhiều `Room`. Một `Tenant Profile` là profile tùy chọn của User role `TENANT` và có thể có lịch sử Contract. Một request luôn thuộc một tenant profile và một room, để scope data theo người tạo và tài sản. Notification có một recipient User và liên kết đến đúng một event source trong ba nguồn MVP: maintenance request, payment hoặc contract.

Cardinality không tự thay thế policy thời gian: contract active của tenant với room được backend xác minh khi tạo request. Database constraint ngăn record mồ côi; backend kiểm tra status/date để không tạo request từ contract inactive.

## 5. Normalization

Schema ở **Third Normal Form (3NF) thực dụng** cho MVP:

- Identity (`users`) tách khỏi dữ liệu tenant-specific (`tenant_profiles`) để Manager/Landlord không phải có tenant columns rỗng và một account role `TENANT` có profile độc lập.
- Property, Room, Contract và Payment không lặp tenant/property/payment details trong request.
- Maintenance Request chỉ giữ snapshot input và metadata workflow/AI của chính nó, không sao chép contract/payment data.
- Notification giữ recipient và reference có foreign key đến event source, thay vì lặp room/tenant/payment details trong các cột.

`original_description`, AI summary/category/priority/confidence được đặt trên `maintenance_requests` vì đây là facts về đúng request đó. Chúng không là duplicate master data. `ai_missing_information` là output structured cần thiết cho missing-information UI flow, không phải entity độc lập.

## 6. Referential integrity

- Mọi relation bắt buộc dùng foreign key `NOT NULL`; những liên kết event source của Notification là nullable riêng lẻ nhưng có check rằng **đúng một** source FK hiện diện.
- Không xóa hard-delete dữ liệu có lịch sử nghiệp vụ: User/Property/Room/Contract liên quan record nên bị `RESTRICT` hoặc được deactivate bằng status theo policy. Điều này giữ traceability và tránh orphan.
- Có unique constraint cho `users.email`, `tenant_profiles.user_id`, `rooms(property_id, room_code)` và `payments(contract_id, billing_period)`.
- Enum/check constraint giới hạn role, room/contract/payment/request status, category, priority và confidence range.
- Backend vẫn kiểm tra tenant ↔ room ↔ active contract và landlord ↔ property ownership. FK không thể tự biểu diễn hoàn toàn điều kiện active theo thời gian.

## 7. Maintenance Request and AI-generated data

`maintenance_requests` bắt buộc có `original_description`, `status`, `created_at`, `updated_at`, creator tenant và room. Các cột `category`, `priority`, `ai_summary`, `ai_confidence` là nullable: null là hợp lệ khi AI unavailable hoặc output invalid. `ai_classification_status` phân biệt `NOT_REQUESTED`, `CLASSIFIED`, `NEEDS_INFORMATION`, `UNAVAILABLE` và `INVALID`; request status vẫn do Maintenance domain sở hữu.

```text
Backend-authorized input
  → AI Integration Adapter → External AI Provider
  → parse + schema/enum/range validation
  → Maintenance Service transaction
  → maintenance_requests AI metadata (only when valid)
```

AI output không được bypass validation bằng cách ghi thẳng database: provider không có database credential/network role; AI Adapter không là repository; application chỉ map result sau validator pass. Database constraints là hàng rào cuối cho enum, nullability, confidence range và status default, nhưng không thay thế semantic/business validation của backend. AI không được ghi `status = COMPLETED`, không quyết định authorization và không tự hoàn tất request.

Khi provider fail/timeout hoặc result invalid, backend lưu mô tả gốc với `status = PENDING`, `ai_classification_status = UNAVAILABLE` hoặc `INVALID`, không lưu recommendation không tin cậy. Điều này đáp ứng fallback của Chapter 4.

## 8. Security considerations

- Cấp database credential chỉ cho backend application/repository với least privilege; không cấp cho Frontend hoặc AI Provider.
- Password hash, không phải password plaintext, được giữ trong `users`; secrets/session token không lưu trong các bảng nghiệp vụ này.
- Authorization luôn server-side: query/result must be scoped bằng tenant user, managed property và relationship dữ liệu; UI/client-supplied IDs không phải proof of ownership.
- PII giới hạn ở identity/profile; logs/observability không ghi password hash, token hoặc raw AI payload không cần thiết.
- Dùng TLS khi kết nối database, encrypted backup/storage theo môi trường deployment và quyền read/write tách theo operational role.
- Sensitive field access (user/profile/contact detail) cần được audit ở application layer khi mức compliance yêu cầu; schema không trao quyền qua AI metadata.

## 9. Ownership and auditability

| Data | Module owner | Audit fields / responsibility |
|---|---|---|
| `users`, `tenant_profiles` | Identity & Access / Tenant | `created_at`, `updated_at`; credential management không lộ hash. |
| `properties`, `rooms` | Room | Timestamps; ownership bởi `owner_user_id`. |
| `contracts` | Contract | Timestamps + lifecycle status; link tenant-room. |
| `payments` | Payment | Timestamps + period/status; immutable event trail có thể bổ sung sau. |
| `maintenance_requests` | Maintenance | Created/updated timestamps, creator, latest updater, original description và validated AI state. |
| `notifications` | Notification | Created/read timestamps và source relation. |

`updated_by_user_id` của Maintenance Request lưu actor gần nhất thay đổi request. Một immutable status-history/audit-event table chưa được thêm vì current requirements chỉ yêu cầu trạng thái hiện tại và timestamps; đây là extension phù hợp nếu cần audit pháp lý hoặc detailed lifecycle history.

## 10. Index strategy

Index được thiết kế theo use case hiện tại, không phải tối ưu hóa sớm:

- Unique indexes hỗ trợ login và data integrity: `users(email)`, `tenant_profiles(user_id)`, `rooms(property_id, room_code)`, `payments(contract_id, billing_period)`.
- Foreign-key indexes hỗ trợ authorization và joins: property owner, room property, contract tenant/room, request tenant/room, notification recipient/source.
- Composite indexes cho danh sách thường dùng: request `(tenant_profile_id, created_at DESC)`, request `(room_id, status, created_at DESC)`, property `(owner_user_id)`, notification `(recipient_user_id, read_at, created_at DESC)`.
- Khi có evidence: partial index các request `PENDING`/`PROCESSING` cho landlord dashboard; index payment `(contract_id, payment_status, billing_period)`.

## 11. Future extensibility

Không thay đổi lựa chọn Modular Monolith. Các extension chỉ nên thêm khi requirement xuất hiện:

- **Attachment:** thêm `maintenance_attachments` nếu ảnh trong US-05 được triển khai; file binary lưu object storage, bảng chỉ lưu metadata/reference.
- **Status history/audit:** thêm append-only `maintenance_status_history` nếu cần truy vết từng transition/actor.
- **AI reclassification:** thêm versioned `maintenance_ai_results` khi cần giữ nhiều lần chạy/provenance; hiện tại metadata mới nhất đủ MVP.
- **Notification delivery:** thêm delivery-attempt/outbox table khi asynchronous/retry cần durable processing.
- **Property manager delegation:** thêm explicit assignment table nếu Manager không còn đồng nhất với Property owner. Hiện requirements chỉ nêu landlord/manager quản lý property, nên `owner_user_id` là tối thiểu.

## 12. Consistency and traceability

| Source | Database design consequence |
|---|---|
| Chapter 3 FR-01–FR-05 | `users`, tenant profile, property/room, contract và payment; role/ownership query ở backend. |
| Chapter 3 FR-06–FR-10, Feature F-01/F-03 | `maintenance_requests`, nullable validated AI metadata, `notifications`, structured status/enums. |
| Chapter 4 User Flow / Prototype | New request `PENDING`, original description, missing information, AI unavailable/manual fallback. |
| Chapter 5.1 | PostgreSQL authoritative store, repository/transaction boundary, AI adapter without direct DB access. |
| Chapter 5.2 | Modular owner per table and no premature microservice/database split. |
| Chapter 5.3 UML | Entity/cardinality terminology aligned with class and ER overview; Property and Tenant Profile refine the required entity scope. |
