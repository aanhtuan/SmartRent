# SmartRent Chapter 5 – UML Prompts

> Current-use context: read the [Sprint 0 decision baseline](../../docs/sprint-0-decisions.md) and relevant resource contract first. Canonical FR IDs follow Requirement Analysis; new business defaults require their review gate. These are reusable templates, not evidence of historical model runs. Preview never persists a business request; explicit confirmation/manual submit reauthorizes before save.

## Purpose

Bộ prompt tạo Use Case Model, Component Model, Class Model, Sequence Diagram và ERD/Data Model cho SmartRent, bảo đảm các mô hình thống nhất với yêu cầu và workflow hiện có.

## Context

Sử dụng các artefact Chapter 3 (PRD, requirements, user stories, feature specification), Chapter 4 (user flow, wireframe, prototype, review) và Chapter 5 architecture/API/database làm nguồn. SmartRent dùng Modular Monolith, Layered Architecture, REST API, PostgreSQL và AI Integration Boundary. Mô hình hóa phần mềm ở mức thiết kế, không sinh implementation code. Không tự thêm actor, feature, module, class hoặc entity nếu không được yêu cầu hay traceable tới requirement.

Maintenance Request flow cần nhất quán:

```text
Tenant → Frontend → Maintenance API → Authorization → Maintenance Service
→ AI Integration → AI Provider → Validate AI Result → Database → Notification
```

## Prompt(s)

### 1. Use Case Model

```text
Bạn là Business/System Analyst. Từ Chapter 3 và Chapter 4 được cung cấp, hãy tạo Use Case Model cho SmartRent, ưu tiên Maintenance Request có AI Classification.

Xác định actors chỉ từ requirements; mô tả system boundary, use case, actor–use case relationships, include/extend khi thực sự cần, preconditions, main success flow và alternative/exception flows. Bao gồm tạo request, xem request và các hành động xử lý/trạng thái mà actor được phép thực hiện theo tài liệu.

Thể hiện riêng các nhánh AI yêu cầu bổ sung thông tin và AI unavailable/invalid; manual fallback vẫn khả dụng. Backend mới là nơi thực thi authentication, authorization, ownership và business validation. AI Provider là external dependency, không phải actor có quyền quyết định business state.

Xuất Mermaid use-case nếu cú pháp phù hợp; nếu không, dùng PlantUML hoặc bảng actor–use case. Thêm mô tả textual để diagram không mơ hồ. Với mỗi use case, ghi requirement/source. Không tự thêm chức năng và không viết code implementation.
```

### 2. Component Model

```text
Bạn là Software Architect. Hãy tạo Component Model cho SmartRent nhất quán với architecture Chapter 5.

Model phải thể hiện Frontend, REST API/Controller, Identity & Access/Authorization, Maintenance module (Application Service và Domain Rules), AI Integration Adapter, external AI Provider, Repository/Data Access, PostgreSQL và Notification module; chỉ thêm component khác nếu artefact cung cấp yêu cầu rõ ràng.

Với mỗi component, nêu responsibility, provided/required interfaces, dependency direction và dữ liệu/command/event đi qua. Bảo đảm luồng Maintenance: Tenant → Frontend → Maintenance API → Authorization → Maintenance Service → AI Integration → AI Provider → validate result trong backend → Database → Notification sau commit.

Ràng buộc: Modular Monolith là một backend deployable; layer/module boundary hiển thị riêng, không biến module thành microservice. Frontend không truy cập DB; AI Provider không có DB credential, không gọi internal write API và không thực hiện authorization/state transition. Xuất Mermaid component/flow diagram và bảng trách nhiệm. Ghi assumption/open question; không viết code.
```

### 3. Class Model

```text
Bạn là domain modeler. Dựa trên requirements và architecture của SmartRent, hãy tạo Class Model ở mức khái niệm cho Maintenance Request flow.

Chỉ đưa class/entity/value object/service/interface có trách nhiệm được hỗ trợ bởi source. Thể hiện thuộc tính cốt lõi, operation ở mức domain/use case, association, multiplicity/cardinality và ownership. Phân biệt domain entity với DTO, repository interface, application service và AI provider adapter; không mô hình hóa mọi database column thành method/class.

Bao gồm các khái niệm liên quan trực tiếp như User/Tenant, Room, Contract nếu cần cho authorization, MaintenanceRequest, AI classification result/value metadata, Maintenance Service, AI Integration interface/adapter, Repository và Notification. Không thêm entity chỉ để làm diagram phong phú; ghi phần nào là concept, phần nào ánh xạ sang database.

Thể hiện rằng Maintenance Service/backend xác thực quyền và transition; AI result là dữ liệu không đáng tin cho tới khi validate, không được tự đổi status. Xuất Mermaid class diagram (hoặc PlantUML nếu cần), giải thích multiplicity và ghi rõ assumption. Đối chiếu vocabulary với Chapter 3–5; không viết implementation code.
```

### 4. Sequence Diagram – Maintenance Request

```text
Bạn là Software Architect. Tạo Sequence Diagram chi tiết cho Maintenance Request flow SmartRent dựa trên user flow và API/architecture design được cung cấp.

Participants cần thể hiện rõ: Tenant, Frontend, Maintenance API/Controller, Authentication/Authorization, Maintenance Service, AI Integration Adapter, AI Provider, AI Result Validator, PostgreSQL/Repository và Notification Module. Giữ thứ tự chính:
Tenant → Frontend → Maintenance API → Authorization → Maintenance Service → AI Integration → AI Provider → Validate AI Result → Database → Notification.

Diagram phải tách read-only preview khỏi explicit confirmation: input/auth/tenancy -> Gemini minimal context -> validated preview/token (no business write/event) -> user confirm/manual choice -> reauthorize/token binding/key deduplication -> PENDING commit -> notification. Missing-info preview asks/retries without saving; provider failure offers manual confirmation. Model must not imply preview auto-creates a request.

Thêm alt/opt branches cho: classification hợp lệ; thiếu thông tin; timeout/provider unavailable; response sai schema/validation. Khi AI lỗi, không tin output, giữ original description và cho phép request `PENDING` được lưu/manual handling theo requirements. Notification không được gửi như thể transaction đã thành công trước commit. Không cho AI bỏ qua authorization/business validation hoặc tự chuyển `PENDING → PROCESSING → COMPLETED`.

Xuất Mermaid sequence diagram, sau đó giải thích mỗi nhánh và chỉ ra source requirement. Không tự thêm synchronous/asynchronous behavior nếu tài liệu chưa quyết định; ghi assumption/open question. Không viết code.
```

### 5. ERD / Data Model

```text
Bạn là Data Modeler. Hãy tạo ERD logical cho SmartRent dựa trên Chapter 3, API design và architecture được cung cấp.

Các entity chính đã xác định: User, TenantProfile, Property, Room, Contract, Payment, MaintenanceRequest, Notification. Chỉ thêm entity nếu requirement được trích dẫn thực sự yêu cầu; nếu nghi ngờ (ví dụ lịch sử trạng thái/audit), trình bày như lựa chọn cần xác nhận thay vì tự đưa vào ERD chính.

Với mỗi relationship, nêu tên, cardinality/optionality, foreign-key direction và requirement/source. Ưu tiên làm rõ Tenant–Room–Contract authorization và MaintenanceRequest–Room/creator–Notification. Tách AI-generated metadata khỏi quyền/trạng thái authoritative; không mô hình AI Provider như chủ thể truy cập dữ liệu.

Xuất Mermaid ER diagram và bảng relationship. Nêu những cardinality hoặc ownership chưa thể xác định từ tài liệu là open questions. Không tự suy ra cascade delete hay lịch sử lưu trữ; không viết DDL/code.
```

## Expected Output

- Mỗi diagram có mục tiêu, system boundary/participants và giải thích textual ngắn.
- Sequence diagram giữ đúng thứ tự authorization → service → AI → validate → database → notification, cùng nhánh lỗi/fallback.
- Component/Class/ERD phản ánh cùng module ownership, vocabulary, actor, entity và status lifecycle.
- Mermaid hoặc PlantUML hợp lệ; assumptions/open questions được đánh dấu thay vì trình bày thành fact.

## Human Review Notes

- Đối chiếu use case/actor với scope Chapter 3; đối chiếu UI/state với Chapter 4.
- Đối chiếu component và sequence với Modular Monolith + Layered Architecture; không gắn nhãn module là service triển khai độc lập.
- Kiểm tra authorization trước mọi thao tác dữ liệu/AI có protected data; mọi AI result phải validate ở backend.
- Kiểm tra cardinality/relationship với database design; không để ERD tự phát sinh entity ngoài requirements.
- Render diagram để phát hiện lỗi cú pháp, crossing/participant thiếu hoặc message order sai.
