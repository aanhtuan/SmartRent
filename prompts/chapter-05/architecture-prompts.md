# SmartRent Chapter 5 – Architecture Prompts

> Current-use context: read the [Sprint 0 decision baseline](../../docs/sprint-0-decisions.md) and relevant resource contract first. Canonical FR IDs follow Requirement Analysis; new business defaults require their review gate. These are reusable templates, not evidence of historical model runs. Preview never persists a business request; explicit confirmation/manual submit reauthorizes before save.

## Purpose

Bộ prompt hỗ trợ phân tích và thiết kế kiến trúc phần mềm SmartRent, làm rõ boundary giữa các thành phần và đánh giá quyết định kiến trúc dựa trên yêu cầu thực tế. Đây là tài liệu thiết kế, không yêu cầu sinh code implementation.

## Context

SmartRent là hệ thống quản lý nhà cho thuê tích hợp AI hỗ trợ vận hành. Kiến trúc hiện tại được xác định là **Modular Monolith + Layered Architecture + REST API + PostgreSQL + AI Integration Boundary**. Backend sở hữu authentication/authorization, business validation, transaction và workflow. AI provider chỉ được gọi qua backend adapter, không có quyền truy cập database hoặc tự thực hiện business action. Khi AI lỗi, Maintenance Request vẫn có thể được lưu ở trạng thái `PENDING` để xử lý thủ công.

Khi sử dụng, cung cấp nội dung liên quan từ Chapter 3 (PRD, requirements, user stories, feature specifications), Chapter 4 (user flow, wireframe, prototype, design review) và artefact Chapter 5 hiện có. Nếu thiếu thông tin, yêu cầu AI nêu rõ câu hỏi/giả định thay vì tự tạo yêu cầu.

## Prompt(s)

### 1. Phân tích kiến trúc hiện tại

```text
Bạn là Software Architect phụ trách review kiến trúc SmartRent.

Dựa trên các tài liệu Chapter 3, Chapter 4 và Chapter 5 được cung cấp, hãy phân tích kiến trúc hiện tại của SmartRent theo các góc nhìn:
- architectural drivers và quality attributes;
- modules, layers và trách nhiệm của từng boundary;
- luồng dữ liệu Frontend → REST API → backend modules → PostgreSQL;
- AI Integration Boundary và luồng dữ liệu đi/đến AI provider;
- authentication, authorization, business validation và notification;
- các điểm coupling, rủi ro, giả định hoặc mâu thuẫn giữa tài liệu.

Context kiến trúc đã chốt: Modular Monolith, Layered Architecture, REST API, PostgreSQL và AI Integration Boundary. Không đề xuất chuyển hệ thống hiện tại thành Microservices. Chỉ nêu hướng tách module thành service như một khả năng tương lai nếu có bằng chứng cụ thể và không biến nó thành quyết định hiện tại.

Với mỗi nhận định, dẫn nguồn bằng tên artefact/requirement nếu có. Phân biệt rõ fact, assumption và recommendation. Không viết code.
```

### 2. Xác định architectural style và quyết định

```text
Bạn là kiến trúc sư phần mềm. Hãy xác định architectural style phù hợp cho SmartRent dựa trên context và yêu cầu đính kèm.

Context SmartRent: sản phẩm quản lý nhà cho thuê ở giai đoạn MVP; các nghiệp vụ Room, Tenant, Contract, Payment, Maintenance và Notification có quan hệ dữ liệu/workflow; backend cần kiểm soát quyền và trạng thái; PostgreSQL là nguồn dữ liệu authoritative; AI provider là dependency ngoài qua một boundary riêng.

Đánh giá riêng vai trò của:
1. Modular Monolith (deployment/domain organization).
2. Layered Architecture (tổ chức trách nhiệm bên trong backend).
3. REST API (contract giữa frontend và backend).
4. PostgreSQL (persistence và transaction boundary).
5. AI Integration Boundary (cô lập provider và kiểm soát dữ liệu/output).

Đưa ra architecture decision hiện tại, lý do, lựa chọn đã cân nhắc, trade-offs, rủi ro và điều kiện có thể xem xét lại quyết định trong tương lai. Giữ nguyên kiến trúc Modular Monolith; không đưa ra Microservices như kiến trúc đích hiện tại. Không suy diễn nhu cầu chưa có trong requirements.
```

### 3. Thiết kế SmartRent architecture và boundary

```text
Bạn là Software Architect. Hãy thiết kế mô hình kiến trúc logic cho SmartRent từ requirements và workflow được cung cấp.

Kiến trúc bắt buộc: một backend deployable theo Modular Monolith, tổ chức theo Layered Architecture, cung cấp REST API, dùng PostgreSQL và tích hợp AI qua AI Integration Boundary. Không thiết kế Microservices.

Hãy xác định:
- Frontend: phạm vi UI, dữ liệu gửi/nhận và điều frontend không được tự quyết định;
- REST API/Controller: trách nhiệm HTTP, input boundary và response;
- Identity & Access: authentication context, role và authorization policy;
- domain modules cần thiết theo requirements, module owner và interface/event giữa module;
- Application Service, Domain Rules/Policy và Repository/Data Access;
- PostgreSQL: authoritative data, transaction và data ownership;
- AI Integration Module/Adapter: input tối thiểu, provider call, timeout, parse/validate output;
- Notification Module: thời điểm tạo notification và quan hệ với transaction nghiệp vụ.

Trình bày component/responsibility table, dependency direction, một sơ đồ Mermaid component/flow và các boundary không được vượt qua. Không để controller truy cập database trực tiếp; không để AI/frontend quyết định authorization, business state hoặc ghi database. Nêu rõ giả định và phần cần xác nhận; không viết code.
```

### 4. Thiết kế AI integration và fallback

```text
Bạn là kiến trúc sư phụ trách tích hợp AI an toàn cho SmartRent. Hãy thiết kế luồng AI Classification của Maintenance Request theo requirements và Maintenance flow đính kèm.

Luồng bắt buộc: Tenant → Frontend → Maintenance API → Authentication/Authorization → Maintenance Service → AI Integration Adapter → AI Provider → parse và validate AI result → backend business logic → PostgreSQL → Notification.

Thiết kế phải mô tả:
- dữ liệu tối thiểu được phép gửi tới provider và dữ liệu tuyệt đối không gửi;
- input/output contract, category/priority/confidence/missing_information nếu được quy định;
- timeout, retry có giới hạn, lỗi mạng/provider, response sai schema, confidence/enum không hợp lệ;
- xử lý khi AI cần thêm thông tin và khi AI unavailable;
- fallback bảo toàn original description, cho phép lưu request `PENDING` và chuyển landlord sang xử lý thủ công;
- thời điểm commit database và phát notification sau commit;
- logging/audit an toàn, tránh lộ token, secret hoặc PII không cần thiết.

AI output luôn là untrusted suggestion cho đến khi backend validate. AI không có database credential, không xác thực/ủy quyền, không tự đổi trạng thái `PENDING → PROCESSING → COMPLETED` và không được bypass business validation. Nêu các nhánh success/missing-information/failure; không viết code hoặc giả định provider cụ thể nếu tài liệu không chỉ định.
```

### 5. Review security boundary và architecture trade-offs

```text
Bạn là Security Architect đang review thiết kế SmartRent đính kèm. Hãy lập threat/boundary review cho các luồng Frontend–REST API, backend modules–PostgreSQL và backend–AI provider.

Với từng boundary, xác định: tài sản cần bảo vệ, actor/trust level, dữ liệu đi qua, kiểm soát cần có, failure mode và bằng chứng cần kiểm thử. Tập trung vào token/session, RBAC và ownership, ID do client gửi, tenant data isolation, least-privilege database access, PII gửi tới AI, prompt/provider response không đáng tin cậy, rate limit, audit/logging và notification sau commit.

Sau đó đánh giá trade-offs của lựa chọn Modular Monolith + Layered Architecture + REST + PostgreSQL + AI Adapter về complexity, maintainability, scalability, deployment, data consistency, latency, privacy và vận hành MVP. Nêu cả lợi ích lẫn chi phí/rủi ro; không khẳng định lựa chọn là tốt nhất trong mọi bối cảnh.

Không đề xuất Microservices làm kiến trúc hiện tại. Ưu tiên rủi ro có thể kiểm chứng, gắn với luồng/requirement cụ thể; phân biệt finding với giả định và nêu biện pháp giảm thiểu. Không viết code.
```

### 6. Bài thực hành 5 – Demo minh họa kiến trúc

```text
Bạn là giảng viên hướng dẫn bài thực hành Chapter 5 cho SmartRent. Tạo một demo phân tích xuyên suốt Maintenance Request bằng tài liệu Chapter 3, Chapter 4 và architecture Chapter 5 được cung cấp.

Demo cần lần lượt minh họa:
1. Tenant gửi maintenance request từ Frontend.
2. REST API xác thực request; backend kiểm tra authorization/ownership và business validation.
3. Maintenance Service gọi AI Integration Boundary với input tối thiểu.
4. AI Provider trả kết quả; backend validate schema và business constraints.
5. Backend lưu request vào PostgreSQL; notification được tạo sau khi commit.
6. Nhánh missing information và nhánh AI unavailable/invalid output; request vẫn có đường xử lý thủ công với trạng thái `PENDING` khi phù hợp.

Với mỗi bước, chỉ rõ component/module sở hữu trách nhiệm, dữ liệu vào/ra, quyết định nào thuộc backend, failure nào có thể xảy ra và artefact nào minh họa bước đó (architecture/component/sequence/ERD/API). Kết thúc bằng các trade-offs và câu hỏi review cho người học.

Giữ đúng Modular Monolith + Layered Architecture + REST + PostgreSQL + AI Integration Boundary. Không viết code, không biến AI thành actor có quyền nghiệp vụ, không tự bổ sung requirements/entity/endpoint không có nguồn. Đánh dấu rõ mọi giả định.
```

## Expected Output

- Architecture overview có sơ đồ Mermaid và bảng module/boundary/trách nhiệm.
- Quyết định kiến trúc có rationale, alternatives, trade-offs, risks và assumptions.
- Luồng AI success/fallback/security rõ ràng, bao gồm ownership của backend.
- Với bài thực hành: walkthrough theo bước, liên kết architecture với artefact Chapter 5 và câu hỏi review.
- Không sinh code implementation; không thay kiến trúc hiện tại bằng Microservices.

## Human Review Notes

- Đối chiếu mọi driver và quyết định với PRD, requirements, user stories và flow Chapter 3–4.
- Xác nhận frontend chỉ hỗ trợ UX; quyền, ownership, validation và state transition đều được kiểm tra server-side.
- Xác nhận provider chỉ nhận dữ liệu tối thiểu; AI không truy cập PostgreSQL và output được validate trước khi dùng.
- Kiểm tra fallback không làm mất original description và request vẫn có thể được xử lý thủ công.
- Không chấp nhận giả định về tải, SLA, provider hoặc compliance như thể đó là yêu cầu đã được xác nhận.
