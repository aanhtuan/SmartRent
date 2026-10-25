# SmartRent Backend Completion — Implementation Plan

Ngày audit: 25/10/2026. Base: `5ee6e8fa3d747bf2404539e73bbbe8cd9d9a617f`.
Branch Phase 0: `codex/backend-phase0-audit`.

**Mục tiêu:** hoàn thành phần backend FR-01–FR-10 theo từng increment nhỏ,
không triển khai frontend và không coi foundation là backend hoàn chỉnh.

**Kiến trúc:** một Modular Monolith; mỗi module có API, application, domain và
persistence. PostgreSQL authoritative; Gemini chỉ qua AI Integration Boundary.
Transaction nằm tại application use case; domain không import HTTP/JPA/provider SDK.

**Stack:** Java 21, Spring Boot 3.5.16, Spring Security, JWT, Spring Data JPA,
Hibernate, PostgreSQL 17, Flyway, JUnit 5, Mockito, Testcontainers, Docker Compose,
GitHub Actions. Spring Boot BOM quản lý version tương thích; dependency mới được
xác minh và pin khi thêm, không tự nâng major framework.

**Spec:** [Chapter 6 backlog](implementation-backlog.md), [quyết định Sprint 0](../sprint-0-decisions.md),
[FR](../chapter-03-requirement-analysis/03-requirement-analysis.md),
[US/AC](../chapter-03-requirement-analysis/04-user-stories.md),
[feature specification](../chapter-03-requirement-analysis/05-feature-specification.md),
[API](../../design/api/README.md), [schema](../../design/database/schema.md),
[architecture](../chapter-05-software-architecture/01-architecture-design.md).

Theo AGENTS và agent-workflow, kế hoạch được thực hiện tuần tự trong phiên hiện tại.
Không cài Superpowers, tự tạo thêm agent hoặc tự commit theo ví dụ của writing-plans.
G1 trong phần 3 đã được PO duyệt ngày 25/10/2026, với JWT TTL **30 phút**. G2/G3/G4 vẫn là **đề xuất chờ PO duyệt**, không phải chính sách đã chốt.

## 1. Baseline đã xác minh

- C6-01: MERGED, PR #9. C6-03: MERGED, PR #10, commit `5ee6e8f`.
- Trước Phase 0: working tree sạch trên main; remote main khớp base.
- Code executable: bootstrap, default-deny HTTP, status-only health, identity JPA,
  cấu hình database, V1 users và test. Các package module khác chủ yếu là package-info.
- Chỉ có V1; chưa có provisioning, JWT, controller nghiệp vụ hoặc Gemini Adapter.
- Audit thống kê 33 method/path nghiệp vụ trong bảy resource API artifacts;
  thêm GET health là operational endpoint hiện có.
- Baseline `verify` ngày 25/10: 22 tests, 0 failures/errors/skipped, BUILD SUCCESS.
- PostgreSQL Compose local đang dừng. Không start/reset/sửa dữ liệu để audit;
  Testcontainers dùng database riêng. Không suy diễn health local từ test result.
- C6-02/frontend và các phần UI của C6-05–16 được **DEFERRED trong đợt backend-first**.
  Task gốc vẫn giữ nguyên; hoàn thành backend không đồng nghĩa hoàn thành toàn task có UI.

## 2. Kết quả audit và ảnh hưởng

| ID | Sự thật và nguồn tại base | Ảnh hưởng / xử lý |
|---|---|---|
| A01 | README:7,48–50,167,280; roadmap:5,56,66; backlog:5,32 còn ghi C6-03 local/pending. Git và PR #10 xác nhận MERGED. | Đồng bộ trạng thái và thêm delivery evidence; giữ lịch sử kiểm thử trước merge. |
| A02 | sprint-0-decisions:21–30,64 ghi D02–D10 là WB, chưa được PO duyệt riêng. | Không dùng chúng làm test oracle cho code phụ thuộc trước khi chốt. |
| A03 | backlog:53 yêu cầu C6-01–04 cho C6-05, bao gồm frontend C6-02; roadmap G1 cũng bao gồm frontend. | Tách backend acceptance track; không bắt backend chờ UI, không tuyên bố full G1 đã đạt. |
| A04 | authentication-api:11 có 429 nhưng chưa quy định JWT, khóa, TTL, giới hạn login. FoundationSecurityConfiguration:21–34 hiện deny-all/403 và giữ CSRF. | Chốt G1, sau đó thay boundary có chủ đích; cập nhật test /api từ 403 tạm thời sang 401 envelope. Không mở rộng actuator. |
| A05 | authentication-api:18–29 và schema:39,53 cần provisioning assignment để bảo vệ profile trước hợp đồng. V1 chưa có field đó. | G2 duyệt D03 rồi thêm forward migration, trusted assignment; không nhận manager/owner từ client. |
| A06 | contract-api:18–20 chưa chốt hủy hợp đồng tương lai/kết thúc sớm. | Chốt G2 trước create/PATCH/lifecycle/concurrency tests. |
| A07 | payment-api:18 và schema:114–115 yêu cầu whole VND, terminal PAID; billing scope theo thời gian hợp đồng chưa đủ chi tiết. | Chốt G3; BigDecimal không rounding âm thầm; unique theo contract/month; tests ngày/tiền/concurrency. |
| A08 | maintenance-api:17 và sprint-0-decisions:52 yêu cầu cancellation policy/reason; schema chưa có cancellation_reason, PATCH chỉ có status. | Xin duyệt thêm field tối thiểu cho cancellation, không tự dựng full status-history. |
| A09 | maintenance-api:24–26 chưa pin TTL/key rotation/digest; retry khi hợp đồng/token hết hạn chưa chốt thứ tự kiểm tra. | Chốt G4, cập nhật API contract tương ứng trước implementation. |
| A10 | notification-api:5 tạo notification sau committed events; D10:30 chỉ hứa best-effort. | Listener transaction riêng, không rollback business commit; test rollback/failure; không tuyên bố durable delivery. |
| A11 | US-05:43 cho phép chọn category thủ công; maintenance create DTO không có category/priority. | Xin chốt MVP manual = unclassified như API hiện tại; nếu cần manual category phải đổi contract trước. |
| A12 | feature F-01 và API chưa pin mọi giới hạn độ dài; D09 chưa pin model/data egress/eval. | G4 chọn model/limits/rubric; fake CI tách biệt live; không có credential hoặc live request trong Phase 0. |
| A13 | IdentityDatabaseTests:64–72 giả định latest Flyway =1 và users có đúng 7 columns; HTTP tests giả định API deny-all/403. | Khi B02/B03/B05 đổi contract/schema đã duyệt, cập nhật assertion hiện hành và giữ test riêng V1->latest/data preservation; không xóa security/migration coverage để làm xanh suite. |

Đây là các khoảng trống quyết định và trạng thái, không phải bằng chứng đã có bug
nghiệp vụ trong module chưa triển khai. Các tài liệu kiến trúc cũ đôi khi minh họa
Service gọi ContractRepository; khi thực thi vẫn theo AGENTS: gọi public use case,
không import internal repository module khác. Wording fallback cũ phải được đọc
cùng confirmation boundary: provider failure không tự tạo request.

## 3. Các gói quyết định cần Product Owner duyệt

### G1 — identity, seed và bảo mật API (APPROVED backend, 2026-10-25)

1. Dev/test provisioning: explicit profile `dev`/`test` **và** enable flag mặc định
   false; từ chối khi có profile khác như production. Bốn email synthetic dưới
   miền `.test`, hai LANDLORD/hai TENANT; password bắt buộc từ environment/file
   bí mật, không có default dùng được. Một transaction; chạy lại không đổi password,
   role hoặc active flag. Existing identity khác role/password phải báo conflict,
   không chiếm hoặc reset account. Chưa gán landlord cho Tenant ở C6-04.
2. Đề xuất Argon2id qua Spring PasswordEncoder, salt 16 bytes, hash 32 bytes,
   memory 19 MiB, iterations 2, parallelism 1; versioned encoding. Pin dependency
   crypto cần thiết khi triển khai; không hash SHA-256 thuần, không log credentials.
   Chi phí hash cần đo trên máy thực; không có claim chống timing attack tuyệt đối.
3. JWT RS256, RSA >=2048 bit; khóa đọc từ file ngoài Git, không tạo key mặc định
   ngầm khi restart. `iss=urn:smartrent:backend`, `aud=smartrent-api`, `sub=UUID`,
   `iat/nbf/exp/jti`; TTL **30 phút** theo PO, clock skew tối đa 30 giây. Decoder dùng public key
   cấu hình sẵn, không discovery theo issuer do client gửi. DB active/role được
   kiểm tra lại mỗi protected request; token không tự cấp quyền khi account inactive.
4. Bearer header only, stateless, không cookie auth/basic/form/registration/refresh/
   logout endpoint. CORS mặc định không có cross-origin allowlist; origin tương lai
   chỉ thêm bằng cấu hình explicit, không wildcard/credentials. Tắt CSRF cho REST
   bearer-only sau khi test chứng minh không dùng ambient browser credentials.
5. Login: cùng 401 UNAUTHENTICATED cho sai password/email không tồn tại/inactive;
   400 malformed, 429 RATE_LIMITED kèm Retry-After. Đề xuất chặn sau 5 thất bại/15
   phút theo cặp IP + email chuẩn hóa, và tối đa 30 attempts/15 phút/IP. Dùng đồng
   hồ injectable, entry TTL/capacity bounded, không tin X-Forwarded-For khi chưa có
   trusted proxy. Đây là limiter theo process; chưa hứa chống abuse nhiều replica.

G1 backend policy đã được PO duyệt để triển khai B01/B02; TTL 30 phút thay đề xuất 15 phút. Chỉ B01 được bắt đầu trong lượt hiện tại; B02 chưa triển khai. Full G1 còn implementation/verification và frontend. Xem decision register để biết approval thực tế; G2/G3/G4 không được duyệt qua quyết định này.

### G2 — D02/D03/D05/D06: ownership, occupancy và hợp đồng

1. Giữ Property owner -> Room; một Tenant profile thuộc một landlord trong MVP.
   Assignment phải do trusted dev/test/operational provisioning, không endpoint
   tự nhận Tenant UUID. `users.provisioned_by_user_id` và profile manager immutable
   qua public API. Không chuyển owner, không thêm ADMIN role.
2. Business clock Asia/Ho_Chi_Minh; timestamps UTC. Room administratively active
   mới có AVAILABLE/OCCUPIED suy ra từ ACTIVE contract bao phủ hôm nay. Không tin
   stored occupancy hoặc client PATCH OCCUPIED. Giữ schema status projection nhưng
   response/filter/authorization tính lại theo cùng một clock.
3. Single-tenant mỗi phòng; ngày inclusive, next.start > previous.end. Không tự
   thêm quy tắc một Tenant chỉ được thuê một phòng vì spec không quy định.
4. Room-level lock chung cho contract create/date/status, room/property deactivation
   và maintenance eligibility/create. Property deactivation khóa các room theo UUID
   ổn định rồi recheck; room create và property deactivation cùng khóa property
   trước room để không thêm phòng vào property vừa inactive. Foreign keys/unique/check vẫn bắt buộc; chưa cần extension
   btree_gist vì lock + recheck bảo vệ mọi write path được expose. Test hai transaction
   đồng thời trên PostgreSQL, kể cả PATCH, deactivation và rollback.
5. Đề xuất kết thúc hợp đồng đang hiệu lực: status TERMINATED, end_date là ngày kết
   thúc được chọn trong [start_date, today] và không sau end_date cũ. Không sửa bills
   đã có. Hủy hợp đồng chưa bắt đầu: TERMINATED nhưng giữ ngày gốc để không tạo
   khoảng ngày đảo; reservation không còn ACTIVE. Cả hai terminal, không reactivate.
   Đây là bổ sung cần sửa contract text sau duyệt, không coi là chính sách đã có.
6. EXPIRED có thể suy ra từ end_date trước today, không phụ thuộc scheduler để
   authorize/filter. Date/status mutation của terminal/effectively expired bị chặn.
   Contract/payment/request history vẫn thuộc Tenant creator sau expiry; room detail
   riêng chỉ đọc khi còn effective tenancy. Inactive property/room chặn tạo mới.

### G3 — D07: billing/payment

1. Giữ manual monthly whole VND >=0; BigDecimal; numeric(12,2) theo schema, không
   tự derive rent từ contract, không prorate/bank integration. Reject fractional
   input trước ORM, không round; DB CHECK bảo vệ giá trị đã lưu là số nguyên.
2. Period là ngày đầu tháng, due_date >= billing_period, unique(contract, period).
   Đề xuất period phải giao với khoảng ngày contract (kể cả partial month); cho
   phép lập bill lịch sử sau expiry, không lập ngoài thời hạn contract. Kết thúc
   hợp đồng không tự sửa/xóa bill có sẵn; không tạo bill mới cho hợp đồng đã hủy
   trước ngày bắt đầu. Mọi điều chỉnh tài chính ngoài MVP.
3. OVERDUE được derive khi unpaid và today > due_date; client chỉ chuyển unpaid
   sang PAID. PAID không sửa amount/due_date và không đảo trạng thái. PATCH PAID
   lặp trên record đã PAID trả 422 theo contract hiện tại, không giả banking receipt.

### G4 — D04/D09/D10: maintenance, notification và AI

1. Manual create không token => NOT_REQUESTED, category/priority/AI metadata null;
   giữ mô tả gốc. Không thêm attachment hay full timeline. Đề xuất chốt phần chọn
   category thủ công của US-05 là deferred, thay vì tự thêm DTO trái API hiện tại.
2. PENDING -> PROCESSING -> COMPLETED hoặc PROCESSING -> CANCELLED. Đề xuất
   PATCH thêm `cancellation_reason` bắt buộc 1–500 ký tự khi CANCELLED, lưu cùng
   latest actor/time; field ngoài CANCELLED bị từ chối. Không tạo history entity.
3. Preview ký HS256 bằng key riêng >=256 bit, khác JWT key, `kid` để rotation;
   TTL 5 phút. Payload bind actor, room, SHA-256 digest, state/result và expiry.
   Digest versioned canonical JSON gồm room UUID chuẩn hóa + **exact original
   description** UTF-8; không trim/normalize âm thầm; không chứa preview token,
   AI output hoặc expiry để renewal không tạo business input khác.
4. Idempotency: unique tenant profile/submission_key. Đề xuất sau authentication
   kiểm tra existing key trong own scope trước: cùng digest trả record cũ 200,
   khác digest 409; không thêm event. Vì đây là đọc own history, retry existing
   vẫn 200 khi tenancy/preview đã hết hạn. Chỉ nhánh tạo mới bắt buộc current tenancy,
   preview integrity/expiry/state; expired token 409, NEEDS_INFORMATION token 422.
   Cần cập nhật contract để ghi rõ ngoại lệ retry existing này sau khi được duyệt.
5. Notification MVP: in-app, best-effort sau commit; listener transaction riêng;
   business rollback không có notification, delivery failure không đảo business.
   Events cụ thể: maintenance created/changed -> landlord/tenant tương ứng;
   contract created/changed -> tenant; bill created -> tenant PAYMENT_REMINDER;
   bill changed/paid -> tenant PAYMENT_UPDATED (enum bổ sung cần duyệt). Không
   tự thêm daily reminder/expiry scheduler hay outbox/durable retry.
6. Technical input limits đề xuất: description 1–5000, question 1–2000,
   additional_information 0–2000, AI summary 1–1000 ký tự; tối đa 5 missing-information
   items, mỗi item 1–200. Validate cả backend; confidence finite [0,1], không cutoff.
   Name 1–200, room code 1–80 trim/case-sensitive, address 1–2000, phone <=30.
   Không cắt chuỗi âm thầm; field không nằm DTO allowlist bị từ chối.
7. Gemini only; đề xuất model `gemini-3.8-flash` theo catalog chính thức được đọc
   ngày audit, **chưa chọn/triển khai**. Pin exact model/API route tại B12 sau duyệt;
   không dùng alias `latest` hoặc tự đổi model khi unavailable. Dùng backend REST
   adapter với structured output; không cần provider SDK trong domain.
8. Timeout tổng 10 giây, connect 2 giây; mặc định không tự retry trong request,
   bounded body và concurrency. Preview lỗi -> INVALID/UNAVAILABLE, không business
   row; explicit reclassification lỗi -> 502, metadata/status cũ nguyên vẹn. Mỗi
   user tối đa 5 provider requests/phút, cùng limiter hạn chế theo process như G1.
9. Fake provider trong CI; live mặc định disabled. Chỉ synthetic/redacted context,
   không email/phone/address/password/JWT. Live model/quota/billing/retention và
   lượng request phải được duyệt riêng; không gửi PII thật vào free tier. Assistant
   không tool/DB access/write; empty context hỏi thêm, không bịa số tiền/trạng thái.
10. Đề xuất eval synthetic tiếng Việt: 20 ca đủ thông tin, 5 thiếu thông tin,
    5 adversarial. PO review nhãn/rubric trước live; tối thiểu 18/20 category và
    priority đúng, 5/5 missing-info phù hợp, 0 leak/unauthorized action trên toàn bộ.
    Đây là release criterion đề xuất, không accuracy đã đo hoặc confidence cutoff.

Đề xuất có thể được PO sửa/duyệt từng gói. Gói chưa được duyệt chỉ chặn increment
phụ thuộc. Không có timeout nào tự biến sự im lặng thành approval.

## 4. Module boundaries và file map dự kiến

Prefix Java main: `backend/src/main/java/com/smartrent/`; test:
`backend/src/test/java/com/smartrent/`. Tên dưới đây là file dự kiến, chưa tồn tại.

- `identity/domain/Account.java`, `AccountRepository.java`: identity không có JPA/HTTP;
  `identity/persistence/JpaAccountAdapter.java` ánh xạ UserRecord hiện có, không tạo
  entity users thứ hai. `identity/application/CurrentActor.java` là caller verified.
- `shared/api/ApiError.java`, `ApiExceptionHandler.java`, `PageResponse.java` dùng
  đúng snake_case/envelope/page 1/20/max100; shared không chứa business repository.
- Mỗi module có `api/*Controller.java`, DTO request/response, `application/*Service.java`,
  `domain/*` rules + repository port, `persistence/*Record.java`, `Jpa*Adapter.java`.
- Public query/use-case trả immutable DTO, không entity/repository. Domain chỉ JDK;
  không @Entity/@Transactional trong domain. Application sở hữu @Transactional.
- Tránh cycle bằng consumer-owned policy/query ports và infrastructure wiring
  qua public module facades. Ví dụ ContractService chỉ dùng RoomAccessService;
  RoomManagementService dùng một RoomLifecycleGuard port, adapter ngoài services
  gọi public ContractQueries/MaintenanceQueries. Read facades không phụ thuộc ngược
  vào management services. Không dùng @Lazy hoặc import repository module khác.
- Assistant lấy snapshot qua public authorized Contract/Payment/Maintenance queries.
  Query scope được enforce trước pagination/filter/AI context, không lọc toàn bộ
  records trong memory. Stable sort created_at/id để phân trang xác định.

## 5. Roadmap theo phụ thuộc và acceptance criteria

Mỗi Bxx là backend slice của C6 tương ứng. G1/G2/G3/G4 dưới đây là **backend policy
approval**, không làm toàn bộ course gate/UI gate tự hoàn tất.

| Increment / nguồn | File/module và interface đầu ra | Phụ thuộc | AC normal / denied / failure; test dự kiến |
|---|---|---|---|
| B01 / C6-04, FR-01, D08 | identity application `DevAccountProvisioner.java`; domain account port; adapter dùng UserRecord; dev config, runbook | C6-03 + G1 seed/hash | Tạo đúng 2 LANDLORD/2 TENANT; hash matches; rerun không reset; conflict rollback cả batch; disabled/non-dev/missing config không ghi DB. `identity/DevAccountProvisioningTests.java` trên PostgreSQL. |
| B02 / C6-05 backend, US-01 | AuthController, UserController; LoginService, JwtConfiguration; shared error/validation; CurrentActor; limiter | B01 + G1 JWT/CORS/rate | Login/me đúng DTO; wrong/inactive/expired/tampered/wrong issuer/audience/algorithm 401; wrong role 403; 429/Retry-After; no cookie/hash; malicious owner/role field bị từ chối; unknown errors safe. `AuthenticationApiTests.java`, `JwtValidationTests.java`, `LoginRateLimitTests.java`, `ApiErrorContractTests.java`. |
| B03 / C6-06 backend, FR-02 | property controller/service/domain/adapter; public PropertyAccess | B02 + G2 D02/D05 | CRUD contract (không hard DELETE), owner từ actor; tenant/landlord khác denied, scoped lists; invalid name/status 400; inactive conflict 422; rollback. `property/PropertyApiTests.java`. |
| B04 / C6-06 backend, US-02 | room controller/service/adapter; RoomAccessService/RoomLifecycleGuard | B03 | Unique(property,room_code); same code ở property khác hợp lệ; DELETE soft INACTIVE; owner/filter denial; occupied/future/open-maintenance deactivate 422 khi các module tương ứng có code; optimistic/concurrent safety. `room/RoomApiTests.java`, sau B07/B10 bổ sung cross-module race. Không hứa guard placeholder đã chứng minh nghiệp vụ tương lai. |
| B05 / C6-07 backend, FR-03 | tenant controller/service/domain/adapter; trusted assignment utility; public TenantAccess | B04 + G2 D03 | Assigned landlord onboarding trước contract; tenant own contact/history; không claim known unrelated user UUID; no public owner/user/role mutation; duplicate profile 409, conflict rollback. `tenant/TenantIsolationTests.java`. |
| B06 / C6-08 backend, FR-04/US-10 | ContractController create/list/get; ContractService/ContractQueries; date/domain policies | B05 + G2 D06 | Dates inclusive, required ownership hai phía, inactive resource 422, overlap/current/future 409; expired/future không cấp tenancy; own historical reads. `contract/ContractCreationTests.java`. |
| B07 / C6-08 backend | ContractController PATCH; lifecycle/reservation lock, complete RoomLifecycleGuard | B06 | Terminate/future cancellation/expiry theo G2; terminal denied; parallel create/create, create/PATCH và PATCH/PATCH chỉ một interval hợp lệ commit; deactivate/create race giữ invariant; rollback nhả lock. `ContractConcurrencyTests.java`, `RentalLifecycleRaceTests.java`. |
| B08 / C6-09 backend, FR-05/US-04 | payment controller/service/domain/adapter; public authorized PaymentQueries | B07 + G3 | Whole VND/month/due date; unique period kể cả concurrent requests; owner/tenant history scope; derived overdue theo clock; PAID immutable; fraction/overflow/date errors safe, rollback. `payment/BillingApiTests.java`, `BillingConcurrencyTests.java`. |
| B09 / C6-10 backend, FR-06 | maintenance manual create/list/get; submission repository/digest; current-tenancy guard | B07 + G4 manual/digest/retry | Manual NOT_REQUESTED/PENDING; exact original; same key/input 201 rồi 200, khác input 409; concurrent duplicate một row; ownership/expiry denial; không provider call; rollback không row/event. `maintenance/ManualSubmissionTests.java`, `SubmissionConcurrencyTests.java`. |
| B10 / C6-10 backend, FR-07/US-06 | status PATCH; MaintenanceQueries; cancellation field mapping | B09 + G4 cancellation | Chỉ landlord quản lý transition đúng chuỗi; tenant 403/owner khác404; cancellation reason; terminal422; history creator sau expiry; concurrent transitions không lost update; không dựng timeline table. `MaintenanceLifecycleTests.java`. |
| B11 / C6-11 backend, FR-08/US-09 | notification controller/service/repository, after-commit listener/templates | B08/B10 + G4 D10/events | Recipient-scoped list/detail/mark read; no public create; exactly one source FK; business rollback không notify; listener failure không rollback source; duplicate create retry không second event. `notification/NotificationIntegrationTests.java`. |
| B12 / C6-12 backend, FR-10/F-01 | aiintegration/application/ClassificationProvider.java; adapter RestGeminiAdapter; output validator; fake test adapter | B09 + G4 schema/model/limits | Structured fields/types/enums/finite confidence; missing-info; bounded HTTP timeout/body; invalid JSON/refusal/blocked/429/5xx safe; no DB in adapter, no unauthorized context; tests local fake HTTP, không live provider. `aiintegration/GeminiAdapterContractTests.java`, `ClassificationValidationTests.java`. |
| B13 / C6-13 backend, FR-06/10 | preview endpoint, PreviewTokenCodec; confirm metadata mapping trong create | B11/B12 + G4 tokens | Preview no business row/event; explicit confirm ký/bind/TTL/re-authorize; changed text/actor/room tamper denied; key renewal idempotent; missing info/manual fallback; provider I/O ngoài transaction; tenancy đổi giữa preview/confirm ->422. `PreviewConfirmationTests.java`, `PreviewTokenTests.java`. |
| B14 / C6-13 backend, US-08 | existing request classify endpoint, metadata update use case | B13 | Owner/creator scope; additional info bounded; original/status không đổi; provider fail/invalid không ghi metadata cũ; optimistic compare/re-authorize khi commit tránh stale result overwrite. `ReclassificationTests.java`. |
| B15 / C6-14 backend, FR-09/F-02 | assistant API/use case + authorized context ports; Gemini read-only answer adapter | B08/B10/B12/B13 | Câu hỏi tiếng Việt dùng own context; missing context asks more; no DB tools/write/PII egress; cross-tenant IDs/filters không leak; injection không cấp quyền; invalid/provider failure safe502. `assistant/AssistantIsolationTests.java`, reviewed Vietnamese eval fixtures. Fake PASS không phải live quality PASS. |
| B16 / C6-15 backend | architecture/dependency checks, security/transaction/regression suite | B03–B15 | Tất cả 33 endpoint contract có normal/denied/failure; role+ownership trên list/filter/read/write; all race/rollback/idempotency; module boundary no cycles/internal repo imports; dependency findings báo thực. `BackendJourneyTests.java`, `ArchitectureBoundaryTests.java`. Chỉ refactor lỗi chứng minh được. |
| B17 / C6-16 backend | backend README/runbook, API examples/coverage, safe synthetic demo script, CS2028 evidence | B16 | Clean ephemeral DB setup + upgrade từ V1; login -> resources -> bill -> manual/AI maintenance -> notify -> Assistant; failures documented; one-command test và backend HTTP journey reproducible; no UI/Playwright claim, no destructive cleanup; hosted CI cho final SHA cần publication approval. |

### Migrations dự kiến (chỉ khi gate tương ứng đã duyệt)

V1 bất biến. Số tiếp theo được kiểm tra lại trước mỗi increment, không tạo migration
rỗng/đặt trước tất cả files. Mỗi migration thuộc một schema evolution nhỏ:

- V2 properties (B03); V3 rooms (B04).
- V4 tenant assignment + profiles (B05); không backfill owner tùy tiện cho users có sẵn.
- V5 contracts (B06); V6 payments (B08).
- V7 maintenance requests, idempotency và cancellation fields (B09/B10).
- V8 notifications, source CHECK/FK và grants (B11).

Nếu B10 được triển khai sau khi V7 đã áp dụng mà cần field mới, thêm migration
tiếp theo, **không sửa V7**; renumber các migration chưa tạo sau đó. Không dùng clean,
baseline-on-migrate hoặc ddl-auto update. Grant chỉ table-specific SELECT/INSERT/
UPDATE cần thiết; runtime không sở hữu DDL/history. Kiểm tra upgrade chứa users/data cũ.

Khi thêm migration đầu tiên sau V1, tách assertion của V1 lịch sử khỏi latest-schema
tests: test V1 target trên database ephemeral, giữ V1 checksum rồi migrate latest
và xác nhận synthetic users vẫn tồn tại. Sau B05 users có thêm cột đã duyệt nên
không giữ assertion "đúng 7 columns" cho latest schema. B02 thay expectation API
401/error envelope trong tests có chủ đích; non-health actuator vẫn bị chặn.

Submission race dùng unique constraint + atomic insert/conflict/digest comparison
hoặc rollback rồi đọc bằng transaction mới; không catch unique exception rồi tiếp
tục query trong một PostgreSQL transaction đã bị abort.

## 6. Vòng thực hiện của mỗi increment

- [x] Phase 0: xác minh base/status; đọc requirements/contracts; kiểm tra baseline.
- [x] Sửa trạng thái delivery C6-03, không thay migration hay database local.
- [x] PO duyệt G1 backend ngày 25/10/2026; JWT TTL 30 phút, chỉ bắt đầu B01.
- [ ] PO duyệt G2/G3/G4 trước increment phụ thuộc.
- [ ] Specify: FR/US/API/schema + normal/denied/failure AC; cập nhật contract nếu gói
      đã duyệt thay payload/policy. Không tự coi toàn bộ bảng đề xuất là approved.
- [ ] Plan: branch `feat/<task-slug>` hoặc `fix/<task-slug>` và file/interface/test scope nhỏ; giữ dirty work.
      Chưa commit Phase 0 thì tiếp tục giữ diff ở branch hiện tại hoặc tách worktree
      an toàn; không switch/drop/stash mù để bắt đầu increment khác.
- [ ] Viết focused failing tests cho hành vi mới; chứng minh fail đúng lý do.
- [ ] Implement domain/use case/persistence/API; fixture fake, không live Gemini.
- [ ] Chạy focused tests rồi `./mvnw --batch-mode --no-transfer-progress verify`
      từ backend với Java21/Docker; không gọi cached report là run mới.
- [ ] Review diff/secrets/architecture/migration compatibility và rollback/race cases;
      sửa findings và chạy lại affected checks. Không tuyên bố independent review.
- [ ] Update docs + CS2028 evidence: Context -> Prompt -> Output -> Review ->
      Refinement -> Result; trạng thái backend và UI riêng biệt.
- [ ] Báo files/results/limitations/dependencies. Commit/push/PR/merge/deploy chỉ
      khi được cho phép; branch protection không thay. Không mega-commit backend.

## 7. Rủi ro và release gates

1. Scope leakage qua UUID/filter/pagination/AI context: test hai landlord/hai tenant,
   cả onboarding chưa có contract và own history sau expiry.
2. Race giữa booking/deactivation/request và lost update: PostgreSQL concurrent
   transactions + consistent lock ordering; không chỉ mock hoặc H2.
3. Token renewal/retry/expiry: injected clock, stale/bound/tampered tokens, cùng key
   khác input; no duplicate row/event; expired account luôn bị từ chối.
4. Provider injection/output drift/failure: schema + limits + authorized snapshots,
   no tools; report semantic hallucination/quality qua reviewed eval, không hứa
   tuyệt đối dựa trên JSON schema hoặc fake providers.
5. Flyway/grants/data retention: kiểm tra hash V1, upgrade trên copy/test DB chứa
   synthetic dữ liệu cũ; không reset volume hiện có; backup/restore production là
   hoạt động riêng chưa được kiểm chứng/phê duyệt ở đợt này.

Backend chỉ COMPLETE khi B01–B17 có code và acceptance evidence; PostgreSQL tests,
negative isolation, concurrency, rollback, API contracts và appropriate AI tests
đạt; current CI đúng final SHA đạt; docs/runbook/demo khớp code. Live Gemini nếu
chưa được duyệt/chạy luôn NOT RUN, không suy ra quality từ fake. Frontend vẫn
DEFERRED, full-stack/G1–G5 course completion không được suy ra từ backend completion.

## 8. Nguồn kỹ thuật chính thức đã tham khảo

- [Spring Security 6.5 JWT](https://docs.spring.io/spring-security/reference/6.5/servlet/oauth2/resource-server/jwt.html): Resource Server/JOSE và validator, không tự chuyển lên Security 7.
- [Spring Security password storage](https://docs.spring.io/spring-security/reference/6.5/features/authentication/password-storage.html): PasswordEncoder/adaptive hashes; tham số ở G1 là đề xuất của task.
- [Gemini models](https://ai.google.dev/gemini-api/docs/models) và [model đề xuất](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash): pin khi triển khai, không alias latest.
- [Structured output](https://ai.google.dev/gemini-api/docs/structured-output): schema không thay application validation/semantic review.
- [Gemini data terms](https://ai.google.dev/gemini-api/terms): cần chốt data tier/egress trước live; không suy diễn privacy từ việc có API key.

Không có provider request, secret generation hoặc thay Cloud settings trong Phase 0.

## 9. B01 local implementation checkpoint — 2026-10-25

B01/C6-04 đang IN_REVIEW trên `feat/c6-04-dev-account-provisioning`, base giữ
`5ee6e8f`. Phase 0/G1 đã được review local và lưu snapshot trước khi sửa backend;
chưa commit vì người dùng không cho phép. Provisioning opt-in, Argon2id versioned,
transaction/idempotency và PostgreSQL concurrency đã triển khai. `verify` thực chạy
54 tests, 0 failures/errors/skipped; 22 tests cũ còn pass. Xem [bằng chứng B01](../ai-evidence/c6-04-dev-account-provisioning.md).

Đây không phải completion của B02, full G1 hoặc toàn backend. JWT TTL 30 phút mới
là policy được duyệt, chưa có code JWT. G2/G3/G4 vẫn chờ PO; không đổi V1 hay volume.
Hosted CI, human review và delivery chưa chạy. Không commit/push/merge/deploy.
