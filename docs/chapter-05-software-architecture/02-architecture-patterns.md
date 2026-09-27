# 5.2 Architecture Patterns – SmartRent

## 1. Mục đích và tiêu chí đánh giá

Tài liệu này phân tích các pattern phù hợp với SmartRent dựa trên phạm vi MVP và thiết kế 5.1. Các driver chính là: quản lý dữ liệu rental có quan hệ chặt chẽ; phân quyền tenant/landlord ở backend; lifecycle Maintenance Request; thông báo theo sự kiện; và AI hỗ trợ có output phải được validate, có fallback khi unavailable.

Các tiêu chí dùng để so sánh là complexity, maintainability, scalability, deployment implications và khả năng giữ các business/security boundary của Chapter 3–4. “Scalable” không đồng nghĩa với “phù hợp hơn”: chi phí vận hành và độ phức tạp phải tương xứng với bằng chứng về nhu cầu thực tế.

## 2. Layered Architecture

### Definition

Layered Architecture tổ chức ứng dụng theo trách nhiệm kỹ thuật. Một request đi qua các lớp theo hướng từ giao diện/API đến application use case, domain rules, rồi data access. Mục tiêu là tách HTTP, nghiệp vụ và persistence để mỗi phần có thể thay đổi/kiểm thử độc lập hơn.

### Structure

```text
Frontend
  → REST Controller / API layer
    → Application Service / Use Case layer
      → Domain Rules / Authorization Policy layer
        → Repository / Transaction layer
          → PostgreSQL
```

Lớp ngoài phụ thuộc vào lớp trong; domain không phụ thuộc vào framework HTTP hay chi tiết provider AI. AI Integration Adapter là infrastructure boundary được application/domain gọi qua interface rõ ràng.

### Cách áp dụng vào SmartRent

- Controller nhận REST request, xác thực format, tạo user context và trả response; không đặt workflow nghiệp vụ hoặc query database trực tiếp ở đây.
- Application service điều phối use case như tạo request, cập nhật status, gọi classification và tạo notification sau commit.
- Domain/policy kiểm tra tenant–room–contract còn hiệu lực, ownership của landlord và transition `PENDING → PROCESSING → COMPLETED`.
- Repository quản lý transaction và truy cập PostgreSQL.
- AI Adapter chỉ được gọi sau authorization; output phải quay lại application/domain để validate trước khi lưu.

### Ưu điểm

- Ranh giới rõ giữa REST/API, business rules và data access; thuận lợi cho unit/integration test.
- Business rules của Maintenance và authorization không bị lặp ở frontend/controller.
- Có thể thay PostgreSQL access strategy hoặc AI provider mà ít ảnh hưởng use case.
- Phù hợp với các module CRUD/workflow MVP và dễ onboarding hơn kiến trúc phân tán.

### Hạn chế

- Nếu chỉ chia thư mục theo layer mà không giữ ownership module, code của nhiều domain có thể bị trộn và tạo “big service layer”.
- Luồng đơn giản có thêm tầng gọi, cần tránh abstraction hình thức không mang giá trị.
- Layered Architecture không tự giải quyết scale độc lập hay boundary theo domain; cần kết hợp Modular Monolith.

### Complexity

**Thấp đến trung bình.** Chi phí ban đầu là thống nhất dependency direction, DTO/validation boundary và quy tắc transaction. Nó thấp hơn vận hành distributed system nhưng đòi hỏi kỷ luật code review để controller không “phình to”.

### Maintainability

**Cao khi áp dụng cùng module ownership.** Thay đổi UI/API không nên tác động trực tiếp repository; thay đổi policy nghiệp vụ được tập trung. Maintainability giảm nếu mọi application service dùng chung model/bảng của mọi domain không kiểm soát.

### Scalability

**Tốt cho scale ứng dụng theo chiều ngang** khi backend stateless; nhưng layer không tự tạo khả năng scale từng domain riêng. PostgreSQL, caching và job worker là các đòn bẩy scale riêng, không phải lý do để bỏ layer.

### Deployment implications

Không yêu cầu nhiều deployable: toàn bộ layers được deploy cùng Modular Monolith. Điều này đơn giản hóa versioning, local development, rollback và transaction. Phải duy trì migration database tương thích với application version.

### Khi nào nên sử dụng

- MVP hoặc sản phẩm có workflow/CRUD rõ, cần bảo mật và business rules tập trung.
- Đội ngũ muốn tăng testability mà chưa có lý do vận hành nhiều service.
- SmartRent hiện tại, nơi authorization và state transition cần được backend kiểm soát thống nhất.

### Khi nào không nên sử dụng

- Không nên dùng như một “nghi thức nhiều lớp” cho script/prototype cực nhỏ không có logic duy trì.
- Không đủ một mình khi một bounded context đã cần release, availability hoặc scaling hoàn toàn độc lập; khi đó giữ layer bên trong service tách ra hoặc chọn boundary phù hợp hơn.

## 3. Modular Monolith

### Definition

Modular Monolith là một ứng dụng/deployable thống nhất, chia thành các module theo domain với interface và ownership rõ ràng. Khác với monolith không cấu trúc, module không được tùy tiện truy cập implementation hay bảng nội bộ của nhau; khác microservices, module vẫn chạy trong cùng process và có thể dùng transaction/database chung có kiểm soát.

### Structure

```text
SmartRent Backend (one deployable)
├── Identity & Access
├── Room
├── Tenant
├── Contract
├── Payment
├── Maintenance
├── Notification
├── AI Assistant
└── AI Integration
    └── Each module: API → Application → Domain → Repository
```

Module giao tiếp qua public application interface hoặc domain event trong process. Ví dụ Maintenance phát `request-created` sau commit; Notification xử lý event để tạo/gửi thông báo. AI Integration là module boundary, không phải một actor có quyền nghiệp vụ.

### Cách áp dụng vào SmartRent

- Maintenance sở hữu request, status history và rule transition; không module nào, kể cả AI, được thay đổi `COMPLETED` thay nó.
- Identity & Access cung cấp identity/policy; mọi module gọi policy để kiểm tra role và resource ownership server-side.
- Room, Tenant, Contract và Payment sở hữu rule/dữ liệu nghiệp vụ tương ứng, cung cấp interface cần thiết cho authorization/workflow.
- Notification phản ứng sau business transaction đã commit; lỗi delivery không rollback request state.
- AI Integration cung cấp provider adapter, timeout/retry bounded và validation contract, nhưng không có direct DB credential hay authorization decision.

### Ưu điểm

- Một deployment và một pipeline giúp phát triển/debug/rollback đơn giản cho MVP.
- Transaction xuyên các dữ liệu liên quan (ví dụ request, status history, notification record) rõ ràng và nhất quán trên PostgreSQL.
- Không có network hop giữa module, giảm latency và failure mode so với microservices.
- Module boundary vẫn tạo nền tảng để cô lập/tách workload sau này khi có dữ liệu tải và ownership ổn định.

### Hạn chế

- Toàn bộ backend thường release cùng nhau; một lỗi resource nghiêm trọng có thể ảnh hưởng toàn process.
- Module có thể bị coupling dần nếu không thực thi public interface, schema ownership và dependency direction.
- Không scale deployment cho riêng Notification/AI Integration ngay lập tức; phải scale application hoặc tách worker/service có chủ đích.

### Complexity

**Trung bình.** Đơn giản hơn microservices về network, service discovery, distributed tracing và data consistency; phức tạp hơn monolith phẳng vì cần định nghĩa module boundary, event/interface và ownership từ đầu.

### Maintainability

**Cao cho SmartRent hiện tại** nếu từng module sở hữu use case, schema/repository và test riêng. Sự rõ ràng này ngăn business logic rental bị dồn vào controller hoặc shared utility. Rủi ro cần quản lý là cross-module query và circular dependency.

### Scalability

**Đủ cho MVP và tăng trưởng ban đầu.** Backend stateless có thể scale ngang; PostgreSQL dùng index, pooling và sau này read replica/cache phù hợp. Workload AI/notification có thể chuyển sang job worker mà không buộc tách toàn bộ domain thành microservices.

### Deployment implications

Một artifact/deployable backend và một schema migration stream. CI/CD, observability, configuration và rollback đơn giản hơn nhiều service. Đây là đánh đổi có chủ đích: release không độc lập theo module, đổi lại chi phí platform thấp và transactional consistency cao.

### Khi nào nên sử dụng

- Domain còn đang hình thành, số module và team chưa lớn, release cadence tương đối đồng bộ.
- Use case liên quan chặt qua Room, Tenant, Contract và Maintenance, cần nhất quán dữ liệu.
- Cần delivery nhanh, vận hành đơn giản và vẫn muốn tránh “big ball of mud”.
- SmartRent ở giai đoạn MVP/current scope.

### Khi nào không nên sử dụng

- Không còn phù hợp nguyên trạng khi một module có tải/availability/compliance cực khác biệt, có owner team độc lập và contract ổn định cần deploy/scale riêng.
- Không nên chọn nếu tổ chức đã phải vận hành nhiều sản phẩm/service độc lập và khả năng platform/distributed observability là nhu cầu đã được chứng minh.

## 4. Microservices

### Definition

Microservices phân chia hệ thống thành nhiều service deploy độc lập, mỗi service sở hữu domain, API và thường cả dữ liệu của mình. Các service giao tiếp qua network bằng synchronous API hoặc asynchronous event/message.

### Structure

```text
Frontend → API Gateway
              ├── Identity Service → identity data
              ├── Maintenance Service → maintenance data
              ├── Payment Service → payment data
              ├── Notification Service → notification data
              └── AI Integration Service → provider adapter
```

Trong mô hình đúng nghĩa, service không truy cập database nội bộ của service khác. Điều này kéo theo API/event contract, distributed tracing, retry/idempotency, service authentication và cơ chế eventual consistency.

### Cách áp dụng vào SmartRent

Nếu SmartRent có bằng chứng cần tách sau này, các ứng viên khả dĩ là Notification delivery hoặc AI Integration workload vì có dependency/latency đặc thù. Tuy nhiên, đó là lựa chọn mở rộng tương lai, **không phải kiến trúc hiện tại**. Maintenance, Room, Tenant, Contract và Payment hiện có workflow/authorization/data relationship gắn chặt, nên tách sớm sẽ làm phức tạp `PENDING` fallback, ownership check và notification-after-commit.

### Ưu điểm

- Service có thể deploy và scale độc lập khi boundary/domain/team đã thật sự độc lập.
- Failure và resource-heavy workload có thể được cô lập tốt hơn về mặt runtime.
- Cho phép công nghệ/lifecycle release khác nhau nếu tổ chức có năng lực vận hành tương ứng.

### Hạn chế

- Tăng mạnh operational complexity: gateway, network security, service identity, discovery/configuration, tracing, monitoring, CI/CD, versioning và incident response.
- Cross-service transaction trở thành eventual consistency/saga/outbox thay vì transaction PostgreSQL đơn giản.
- Network timeout, duplicate event, retry, ordering và partial failure đều phải được thiết kế/kiểm thử.
- Tách database sớm gây reporting/query và authorization ownership phức tạp; developer velocity có thể giảm ở MVP.

### Complexity

**Cao.** Complexity chuyển từ code local sang distributed-system concerns. Việc “chia code thành service” không tự làm domain đơn giản hơn; nó buộc SmartRent xử lý các lỗi mạng và consistency ngoài process.

### Maintainability

**Có thể cao ở quy mô lớn, nhưng thấp hơn khi tách sớm.** Với boundary và team ownership trưởng thành, mỗi service độc lập dễ hiểu. Nhưng ở MVP, nhiều repository/service contract và duplicated infrastructure làm việc thay đổi một flow đi qua nhiều nơi khó hơn.

### Scalability

**Cao về selective scaling**: có thể scale AI hoặc Notification riêng. Nhưng modular monolith cũng scale toàn app trước; microservices chỉ có lợi thực tế khi workload khác biệt, contention hoặc team autonomy đã được đo đạc. Nó không tự làm database hay AI provider có capacity vô hạn.

### Deployment implications

Mỗi service có pipeline, config/secret, migration/database strategy, image/version và rollback riêng. Cần API gateway, service-to-service authentication, centralized logs/metrics/tracing, message broker nếu event-driven và runbook cho failure liên service. Đây là chi phí không phù hợp với MVP SmartRent hiện tại.

### Khi nào nên sử dụng

- Có bounded context ổn định, owner team độc lập và nhu cầu release/scale/availability khác biệt đã được chứng minh bằng số liệu.
- Tổ chức có platform maturity cho security, observability, automation, distributed data và on-call.
- Ví dụ tương lai: AI Integration có lưu lượng/availability riêng biệt hoặc Notification là platform dùng chung cho nhiều sản phẩm.

### Khi nào không nên sử dụng

- Không dùng chỉ vì microservices “hiện đại”, dự đoán scale xa hoặc muốn tách thư mục thành nhiều service.
- Không dùng cho MVP với team nhỏ, domain thay đổi nhanh và transaction/authorization liên domain còn chặt.
- Không dùng khi chưa có hạ tầng vận hành cho observability, versioning, service security và failure recovery.

## 5. Pattern liên quan được dùng có chủ đích

### REST API

REST API là contract giao tiếp giữa Frontend và Modular Monolith. Nó phù hợp UI feature-based, tài nguyên rental và workflow Maintenance. REST không quyết định architecture deployment; nó giữ client tách khỏi implementation module. Authorization vẫn là trách nhiệm backend cho mọi REST endpoint, không nằm ở frontend.

### AI Integration Boundary / Adapter

Adapter cô lập SDK/provider, kiểm soát dữ liệu gửi ra ngoài, timeout/retry và parse output. Contract validation diễn ra trước business logic. Pattern này có maintainability cao khi đổi provider và giảm security risk, nhưng yêu cầu thiết kế schema/observability cho failure. Nó không phải “AI service” và không cấp AI quyền database, authorization hoặc status transition.

### Domain Event sau commit

Notification Module tiêu thụ event sau khi transaction Maintenance/Payment/Contract đã thành công. Pattern này giảm coupling giữa thay đổi business state và delivery notification; khi delivery lỗi, state đã commit không bị đảo. Trong modular monolith, event vẫn in-process; khi scale lên worker/service có thể bổ sung durable outbox/queue mà không đổi người sở hữu domain state.

## 6. So sánh theo bối cảnh SmartRent

| Tiêu chí | Layered Architecture | Modular Monolith | Microservices |
|---|---|---|---|
| Vai trò | Tách trách nhiệm trong code | Tách domain trong một deployable | Tách domain thành deployable độc lập |
| Complexity hiện tại | Thấp–trung bình | Trung bình | Cao |
| Transaction Room/Contract/Maintenance | Rõ qua repository/transaction | Đơn giản trong PostgreSQL chung | Cần distributed consistency/saga/outbox |
| Authorization ownership | Policy tập trung trong domain | Dễ giữ thống nhất trong backend | Phải phối hợp nhiều service/token/context |
| AI fallback `PENDING` | Dễ đặt ở use case | Dễ giữ workflow tập trung | Cần phối hợp service/event/failure mode |
| Selective scaling | Không tự cung cấp | Scale app/worker trước | Scale service độc lập |
| Deployment | Cùng deployment | Một backend deployable | Nhiều pipeline/service/database |
| Phù hợp SmartRent MVP | Có, là cấu trúc nội bộ | Có, là lựa chọn deployment/domain | Chưa phù hợp |

Layered Architecture và Modular Monolith giải quyết hai vấn đề khác nhau nên được kết hợp, không phải chọn một trong hai. Microservices là một lựa chọn deployment/organizational boundary khác, không phải “bước nâng cấp bắt buộc”.

## 7. Architecture Decision

### Decision

SmartRent hiện tại sử dụng:

```text
Modular Monolith
  + Layered Architecture
  + REST API
  + AI Integration Boundary
```

PostgreSQL tiếp tục là authoritative data store. Backend sở hữu authorization, business rules, transaction và Maintenance workflow. AI chỉ là dependency bên ngoài sau adapter: không direct DB access, không quyết định authorization, không thay đổi critical business state, không tự hoàn tất Maintenance Request. Khi AI failure/invalid output, request vẫn được lưu `PENDING` để xử lý thủ công.

### Decision rationale and trade-offs

Quyết định không nói Modular Monolith “tốt nhất” trong mọi bối cảnh. Nó phù hợp **hiện tại** vì SmartRent đang là MVP có domain liên quan chặt và cần delivery/operation đơn giản. Đổi lại, release/scale mặc định là theo toàn backend, nên phải giữ module interface và observability để tránh coupling.

Microservices sẽ đổi lấy selective scaling và release autonomy bằng network/data/operational complexity. Khi chưa có số liệu chứng minh bottleneck, workload độc lập hoặc team ownership tách biệt, chi phí đó lớn hơn lợi ích. Layered Architecture giảm coupling trong code nhưng cần kỷ luật để không biến thành nhiều pass-through layer. REST cung cấp integration đơn giản nhưng AI latency được kiểm soát bằng timeout/fallback, không bằng việc biến toàn hệ thống thành distributed services.

### Re-evaluation triggers

Chỉ đánh giá tách module thành service khi có dữ liệu rõ ràng, ví dụ:

- AI Integration hoặc Notification có tải/availability/SLA khác biệt kéo dài và không thể xử lý bằng worker/scale ngang.
- Một bounded context có owner team độc lập, contract ổn định và nhu cầu release riêng thường xuyên.
- PostgreSQL/application contention được đo đạc và giải pháp index, pooling, cache, job queue không còn đáp ứng.
- Tổ chức đã sẵn sàng với service security, tracing, deployment automation, data consistency và on-call.

Trước các trigger này, ưu tiên cải thiện modular boundary, observability, database performance và asynchronous worker trong kiến trúc hiện tại.

## 8. Traceability

| Source | Pattern decision supported |
|---|---|
| Chapter 3 FR-01 và business rules | Layered policy + Modular Identity & Access giữ authorization ở backend. |
| Chapter 3 FR-02–FR-08 | Modular domain ownership và PostgreSQL transaction cho rental/maintenance/notification. |
| Chapter 3 F-01/F-02 | AI Adapter, structured validation và backend-scoped data access. |
| Chapter 4 User Flow | Backend authorization → AI → validate → save → notify; state `PENDING → PROCESSING → COMPLETED`. |
| Chapter 4 Prototype / AI Review | Missing-information loop, AI failure fallback, original description và AI không có authority. |

## Related artifact

Xem bảng quyết định tóm tắt tại [architecture-pattern-decisions.md](../../design/architecture/architecture-pattern-decisions.md) và sơ đồ boundary tại [smartrent-architecture.md](../../design/architecture/smartrent-architecture.md).
