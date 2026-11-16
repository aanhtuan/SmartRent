# SmartRent Chapter 5 – Architecture Pattern Prompts

> Current-use context: read the [Sprint 0 decision baseline](../../docs/sprint-0-decisions.md) and relevant resource contract first. Canonical FR IDs follow Requirement Analysis; new business defaults require their review gate. These are reusable templates, not evidence of historical model runs. Preview never persists a business request; explicit confirmation/manual submit reauthorizes before save.

## Purpose

Bộ prompt dùng để so sánh Layered Architecture, Modular Monolith và Microservices, sau đó đưa ra architecture decision phù hợp với giai đoạn và yêu cầu thực tế của SmartRent.

## Context

SmartRent hiện dùng **Modular Monolith + Layered Architecture + REST API + PostgreSQL + AI Integration Boundary**. Đây là một backend deployable có module domain rõ ràng. Room, Tenant, Contract, Payment, Maintenance và Notification có dữ liệu/workflow liên quan; backend giữ authorization, business validation, transaction và trạng thái. AI provider nằm sau adapter, không có database access hay quyền nghiệp vụ. Microservices chỉ có thể được cân nhắc như hướng tương lai khi có bằng chứng về nhu cầu độc lập.

## Prompt(s)

### 1. So sánh ba architecture pattern

```text
Bạn là Software Architect. Hãy so sánh Layered Architecture, Modular Monolith và Microservices cho SmartRent dựa trên các tài liệu requirements, architecture và workflow được cung cấp.

Phân tích riêng từng lựa chọn, không coi chúng là ba khái niệm cùng một trục: Layered Architecture tổ chức trách nhiệm trong code; Modular Monolith tổ chức domain trong một deployable; Microservices chia domain thành nhiều deployable qua network.

Với mỗi lựa chọn, đánh giá:
- fit với domain và giai đoạn MVP;
- complexity phát triển và vận hành;
- maintainability, module/service ownership và coupling;
- scalability (scale toàn ứng dụng hay scale độc lập);
- deployment, release, rollback và local development;
- transaction/data consistency giữa Room, Tenant, Contract, Maintenance, Payment, Notification;
- ảnh hưởng đến authentication/authorization và ownership check;
- ảnh hưởng đến AI timeout/fallback `PENDING` và notification sau commit;
- trade-offs, rủi ro và năng lực/hạ tầng cần có.

Kết thúc bằng architecture decision hiện tại cho SmartRent, rationale, lựa chọn bị từ chối và điều kiện đo lường cụ thể có thể khiến quyết định được xem xét lại. Quyết định hiện tại phải giữ Modular Monolith + Layered Architecture; không khuyến nghị chuyển thành Microservices. Không viết code và không dùng nhận định chung chung như “microservices scale tốt hơn” nếu không phân tích chi phí/context.
```

### 2. Đánh giá Layered Architecture trong SmartRent

```text
Hãy đánh giá Layered Architecture cho backend SmartRent theo mô hình:
REST Controller → Application Service/Use Case → Domain Rules/Authorization Policy → Repository/Transaction → PostgreSQL.

Phân tích problem cần giải quyết, trách nhiệm/dependency direction của từng layer, cách áp dụng vào tạo/cập nhật Maintenance Request, lợi ích, chi phí và dấu hiệu triển khai sai (controller phình to, service chứa mọi logic, domain phụ thuộc HTTP/AI SDK, layer hình thức không có giá trị).

Chỉ ra cách AI Adapter được gọi mà không để controller gọi provider trực tiếp, và cách output quay về backend để validate. Đánh giá complexity, maintainability, testability, scalability và deployment implications. Kết luận phần nào thực sự cần thiết cho SmartRent MVP và phần nào không nên abstraction hóa quá mức. Căn cứ vào artefact/requirements được cung cấp; không viết code.
```

### 3. Đánh giá Modular Monolith trong SmartRent

```text
Hãy đánh giá Modular Monolith cho SmartRent như một backend deployable, chia module theo domain và dùng PostgreSQL chung có ownership/transaction được kiểm soát.

Xác định module boundary phù hợp với requirements (Identity & Access, Room, Tenant, Contract, Payment, Maintenance, Notification, AI Integration nếu được tài liệu hỗ trợ); quyền sở hữu use case/data; cách module giao tiếp qua interface hoặc domain event; và các dependency không nên có.

Phân tích problem, intent, structure, SmartRent use case, benefits, trade-offs, complexity, maintainability, scalability và deployment. Tập trung vào Maintenance tạo request, AI fallback và notification sau commit. Đưa ra guardrails để tránh shared database/module coupling và circular dependency trong khi không tạo distributed-system complexity.

Kết luận Modular Monolith có phù hợp hiện tại không, vì sao, rủi ro nào cần theo dõi và bằng chứng nào mới biện minh cho việc tách một module thành service sau này. Không đề xuất Microservices như kiến trúc hiện tại; không viết code.
```

### 4. Đánh giá Microservices như một lựa chọn đối chiếu

```text
Hãy phân tích Microservices như một lựa chọn đối chiếu cho SmartRent, không giả định rằng hệ thống cần chuyển đổi.

Mô tả các thay đổi cần thiết nếu tách domain thành deployable độc lập: service/data ownership, API/event contracts, service authentication, distributed tracing, CI/CD, versioning, retry/idempotency, partial failure và consistency (saga/outbox khi cần). Đánh giá cụ thể tác động lên authorization/ownership, workflow Maintenance, AI fallback `PENDING`, PostgreSQL transaction và notification sau commit.

So sánh benefits với complexity, maintainability ở MVP, scalability thực tế, deployment/rollback, chi phí vận hành và năng lực team/platform. Nêu điều kiện có thể đo lường để cân nhắc trong tương lai (ví dụ workload/availability khác biệt, team ownership độc lập, release cadence hoặc bottleneck đã đo được), đồng thời chỉ rõ các điều kiện hiện chưa có bằng chứng.

Kết luận rõ: Microservices có được chọn cho SmartRent hiện tại hay không và vì sao. Không viết code, không biến kịch bản tương lai thành quyết định đã duyệt.
```

### 5. Architecture decision record dựa trên context

```text
Từ các phân tích Layered Architecture, Modular Monolith và Microservices ở trên, hãy viết một Architecture Decision Record ngắn cho SmartRent.

ADR phải có: Title/Status/Context, Decision, Options Considered, rationale, consequences (positive/negative), complexity, maintainability, scalability, deployment impact, security/data consistency implications, risks/mitigations và review triggers.

Decision hiện tại: Modular Monolith + Layered Architecture + REST API + PostgreSQL + AI Integration Boundary. Nêu Layered Architecture và Modular Monolith giải quyết hai mối quan tâm khác nhau và có thể kết hợp. Nêu rõ Microservices chưa phù hợp cho MVP; chỉ có thể review lại khi có evidence và readiness cụ thể.

Liên kết rationale với requirements SmartRent: dữ liệu nghiệp vụ liên quan chặt, backend authorization, Maintenance lifecycle, notification sau commit và AI fallback. Không thêm quality target hoặc operational capability chưa được cung cấp; ghi thành câu hỏi mở nếu thiếu. Không viết code.
```

## Expected Output

- So sánh theo tiêu chí và theo context SmartRent, có fact/assumption rõ ràng.
- Đánh giá đủ ưu/nhược điểm, complexity, maintainability, scalability, deployment và trade-offs.
- Phân biệt Layered Architecture với lựa chọn tổ chức/deployment Modular Monolith hay Microservices.
- Architecture decision hiện tại bảo toàn Modular Monolith; điều kiện xem xét lại được nêu cụ thể.

## Human Review Notes

- Kiểm tra lựa chọn được đánh giá trên cùng một bộ tiêu chí nhưng không đánh đồng các khái niệm khác cấp độ.
- Xác minh luận điểm về scale, team size, traffic, availability và deployment có bằng chứng; không chấp nhận dự đoán như fact.
- Đảm bảo transaction/authorization/fallback/notification của Maintenance được phân tích xuyên suốt.
- Đảm bảo kết quả không âm thầm đổi quyết định hiện tại sang Microservices.
