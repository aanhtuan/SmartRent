# 5.3 System Modeling & UML – SmartRent

## 1. Mục đích và phạm vi

Phần này chuyển các requirements Chapter 3, product design Chapter 4 và Architecture Design/Patterns Chapter 5 thành các UML/model specifications. Các mô hình mô tả thiết kế, không phải implementation code hay API contract chi tiết.

Trọng tâm là Maintenance Request: request do Tenant tạo phải đi qua Frontend, REST API, authorization, Maintenance Service, AI Integration, AI Provider, validate AI result, PostgreSQL và Notification. Mô hình giữ nguyên các guardrail đã được chốt: backend sở hữu authorization và state transition; AI là dependency không đáng tin cậy cho đến khi được validate và không thể hoàn tất request.

## 2. UML artifact index

| Artifact | Mục đích |
|---|---|
| [use-case-model.md](../../design/uml/use-case-model.md) | Actors và use case thuộc MVP. |
| [component-model.md](../../design/uml/component-model.md) | Component/boundary của Modular Monolith. |
| [class-model.md](../../design/uml/class-model.md) | Logical domain classes và ownership. |
| [maintenance-sequence.md](../../design/uml/maintenance-sequence.md) | Main, missing-information và AI-failure sequence. |
| [data-model-overview.md](../../design/uml/data-model-overview.md) | Entity Relationship overview trên PostgreSQL. |

## 3. Modeling conventions

- **Tenant** và **Manager/Landlord** là actors nghiệp vụ. PRD dùng “Admin/Landlord”; trong các mô hình này, Manager/Landlord biểu diễn vai trò quản lý tài sản. Không thêm một Admin actor tách biệt vì requirements hiện tại không định nghĩa use case riêng chỉ dành cho Admin.
- **System** là actor/đối tượng tự động phát notification sau business event, không phải người dùng có quyền nghiệp vụ.
- **AI Provider** là external actor/dependency; không có access đến PostgreSQL hoặc authorization policy.
- `PENDING → PROCESSING → COMPLETED` là workflow do Maintenance Module kiểm soát. `CANCELLED` chỉ là transition tùy policy nêu tại Chapter 3; không được suy diễn thêm rule.
- AI result là metadata hỗ trợ. Category, priority, summary, missing information và confidence chỉ được dùng sau validation ở backend.

## 4. Consistency with architecture

```text
Tenant / Manager-Landlord
  → Frontend
  → REST API Controller
  → Authentication & Authorization Policy
  → Maintenance Application Service / Domain Rules
  → Repository / PostgreSQL

Optional AI path:
Maintenance Service → AI Integration Adapter → AI Provider
                    ← parsed result → Validate AI Result → business logic
```

Notification được tạo từ event sau database transaction thành công. Nếu AI unavailable hoặc output invalid, Maintenance Service vẫn persist request với `PENDING` và mô tả gốc để xử lý thủ công.

## 5. Traceability and dependencies

| UML model | Chapter 3 dependency | Chapter 4 dependency | Chapter 5 dependency |
|---|---|---|---|
| Use Case | FR-01 đến FR-10; US-01 đến US-09 | Actors/screens of maintenance journey | Module responsibilities and REST boundary. |
| Component | FR-01, FR-06 đến FR-10; NFR security/reliability | Backend authorization, AI fallback | 5.1 component/security boundary; 5.2 Modular Monolith + Layered Architecture. |
| Class | Room/tenant/contract/payment/request/notification requirements | Original description, category, priority, status and confidence UI | PostgreSQL authoritative data and module ownership. |
| Sequence | FR-06, FR-07, FR-08, FR-10; AI error handling | Main flow, missing information, AI unavailable and status flow | AI Adapter + output validation + after-commit event. |
| ER overview | FR-02 đến FR-08 | Request detail/status tracking | Repository/transaction layer and PostgreSQL boundary. |

Các artifact không tạo thêm chức năng ngoài phạm vi: không có banking integration, professional accounting, IoT hoặc AI action tự động. Chúng phụ thuộc vào 5.1 để xác định boundary và 5.2 để giữ Modular Monolith thay vì chuyển sang microservices.

## 6. Review checklist

- Mỗi write/read Maintenance Request có actor và authorization kiểm tra ở backend.
- AI Provider chỉ xuất hiện phía sau AI Integration Adapter; không có đường kết nối trực tiếp đến database.
- Main sequence, missing-information và fallback AI đều bảo toàn mô tả gốc và workflow `PENDING`.
- Notification là hậu quả của transaction đã commit, không phải actor thay đổi request status.
- Logical model chỉ chứa entities/value concepts hỗ trợ requirements hiện có.

Xem [README của UML artifacts](../../design/uml/README.md) để điều hướng toàn bộ model.
