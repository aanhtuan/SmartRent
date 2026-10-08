# SmartRent Chapter 5 – Database Design Prompts

> Current-use context: read the [Sprint 0 decision baseline](../../docs/sprint-0-decisions.md) and relevant resource contract first. Canonical FR IDs follow Requirement Analysis; new business defaults require their review gate. These are reusable templates, not evidence of historical model runs. Preview never persists a business request; explicit confirmation/manual submit reauthorizes before save.

## Purpose

Bộ prompt thiết kế logical/physical PostgreSQL schema SmartRent có thể trace về requirements, gồm entities, fields, relationships, integrity, indexes, normalization, AI metadata và security.

## Context

Các entity chính hiện được xác định: `User`, `TenantProfile`, `Property`, `Room`, `Contract`, `Payment`, `MaintenanceRequest`, `Notification`. Không tự ý thêm entity nếu requirements không yêu cầu. PostgreSQL là authoritative data store; backend/repository sở hữu transaction và database access. External AI provider không có database credential. Maintenance Request lưu được mô tả gốc và chỉ lưu AI metadata sau khi backend validate; lỗi AI không được ngăn manual fallback theo yêu cầu.

## Prompt(s)

### 1. Thiết kế PostgreSQL schema

```text
Bạn là Senior Data Modeler/DBA. Dựa trên Chapter 3 requirements, Chapter 4 workflow và Chapter 5 architecture/API được cung cấp, hãy thiết kế PostgreSQL schema cho SmartRent.

Bắt đầu bằng traceability matrix: requirement → entity/table → column/constraint. Tập trung vào các entity đã chốt: User, TenantProfile, Property, Room, Contract, Payment, MaintenanceRequest, Notification. Không tự ý thêm entity; nếu requirement thật sự cần một bảng bổ sung (ví dụ lưu lịch sử status/audit), trích dẫn nguồn, giải thích lý do và tách thành đề xuất cần duyệt.

Với mỗi bảng, đề xuất:
- columns, PostgreSQL data type, nullable/default và ý nghĩa;
- primary key, foreign keys, unique/check/not-null constraints;
- relationship/cardinality và delete/update behavior có căn cứ;
- indexes theo query/use case thực tế, tránh index dư thừa;
- quy tắc normalization và lý do nếu có denormalization;
- sensitive data classification và access boundary.

Định nghĩa rõ cách biểu diễn role, user–tenant profile, property–room, contract, payment, maintenance request, notification theo source. Nếu tài liệu chưa định nghĩa chính xác cardinality, enum, retention hoặc delete policy, ghi assumption/open question thay vì tự chốt.

Chỉ tạo schema design/DDL minh họa nếu được yêu cầu riêng; mặc định trả logical schema và bảng chi tiết, không tạo migration/code implementation.
```

### 2. Thiết kế MaintenanceRequest và AI-generated fields

```text
Hãy thiết kế phần PostgreSQL data model cho MaintenanceRequest dựa trên Feature Specification, user flow, API và architecture SmartRent đính kèm.

Phân biệt rõ dữ liệu do user/backend sở hữu (original description, room, creator, authoritative status, timestamps) với AI-generated suggestion (category, priority, summary, missing_information, confidence và metadata trạng thái phân loại nếu requirements yêu cầu). Chỉ thêm field có căn cứ; nêu nguồn và semantics. Không dùng AI output làm authorization, trạng thái authoritative hay lệnh thực thi.

Đề xuất data type, nullability, enum/check constraints, độ dài/range, FK/cardinality, indexes cho truy vấn theo tenant/room/owner/status/created time nếu được query pattern hỗ trợ, và cách biểu diễn “chưa phân loại/AI unavailable” mà không làm mất original description. Giải thích normalization và có cần lưu raw provider response hay không; mặc định không lưu dữ liệu thừa/nhạy cảm nếu không có requirement.

Phân tích integrity khi AI thiếu thông tin, trả output invalid hoặc timeout. Request vẫn phải có thể được lưu `PENDING` và xử lý thủ công theo requirement. Ghi assumptions/open questions; không tự thêm bảng/entity ngoài scope nếu không có yêu cầu traceable.
```

### 3. Relationships, constraints và normalization review

```text
Review logical schema SmartRent được cung cấp. Tập trung vào User, TenantProfile, Property, Room, Contract, Payment, MaintenanceRequest và Notification.

Hãy kiểm tra:
- PK/FK và mỗi relationship/cardinality có khớp requirements không;
- constraint bảo vệ invariant (unique, check, not null) nào cần thiết;
- ownership/tenant isolation có thể được query an toàn qua backend hay không;
- contract active và quan hệ tenant–room dùng cho authorization có được biểu diễn đủ không;
- payment/maintenance state có invariant nào cần enforce tại DB và invariant nào thuộc domain service;
- normalization, update/delete anomalies và các field lặp;
- index có khớp query pattern và có nguy cơ trùng/thừa không.

Với từng finding, nêu mức độ, ví dụ dữ liệu lỗi có thể xảy ra, đề xuất sửa schema và nguồn requirement. Không áp constraint hoặc cascade behavior nếu có thể làm mất lịch sử cần giữ mà tài liệu chưa xác nhận. Không thêm entity tùy tiện; tách assumption và câu hỏi cần product/domain owner trả lời. Không viết application code.
```

### 4. Database security và access model

```text
Bạn là Database Security Reviewer. Hãy review thiết kế PostgreSQL SmartRent và luồng access từ architecture được cung cấp.

Đề xuất security controls ở mức thiết kế: application DB role least privilege, schema/table ownership, credential/secret handling, TLS/encryption phù hợp, backup/access control, parameterized query/ORM boundary, audit access cần thiết, data retention và cách xử lý sensitive fields. Phân biệt yêu cầu đã có với recommendation cần xác nhận.

Làm rõ security boundary: chỉ backend data-access layer kết nối PostgreSQL; frontend và AI provider không truy cập database; authorization theo role/ownership luôn được kiểm tra ở backend bằng dữ liệu server-side. Nêu cách giảm nguy cơ IDOR/cross-tenant data exposure ở query/use-case layer và vai trò của constraint/index/RLS nếu phù hợp (không giả định RLS đang dùng).

Đánh giá dữ liệu gửi tới AI và liệu field nào nên hạn chế/loại khỏi provider request. Không đề xuất lưu raw prompt/response hay PII nếu không có mục đích/retention rõ. Kết quả gồm boundary diagram hoặc luồng access, threat/control table, gaps và câu hỏi mở. Không viết code.
```

## Expected Output

- Logical schema có traceability và bảng columns/types/keys/constraints.
- Relationship/cardinality, normalization và index có rationale theo requirements/query patterns.
- AI-generated fields được tách nghĩa khỏi dữ liệu/business state authoritative.
- Security/access model xác nhận chỉ backend được truy cập database.
- Entity/field/retention giả định được đánh dấu; entity mới không tự động nhập vào schema chính.

## Human Review Notes

- Xác nhận mọi entity và field có nguồn requirement; entity bổ sung phải được phê duyệt riêng.
- Kiểm tra FK/cardinality bằng business flow Tenant–Room–Contract và resource ownership.
- Kiểm tra enum/status trùng khớp Feature Specification/API; không để AI metadata tự điều khiển workflow.
- Đánh giá index từ query thực tế, tránh thêm index theo cảm tính; xác minh delete/retention policy với domain owner.
- Kiểm tra PII, quyền database và dữ liệu egress sang AI; provider tuyệt đối không nhận credential/database access.
