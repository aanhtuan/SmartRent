# SmartRent Chapter 5 – REST API Prompts

## Purpose

Bộ prompt thiết kế REST API contract cho các domain SmartRent, nhất quán với requirements, authorization backend, PostgreSQL data model và AI Integration Boundary.

## Context

API SmartRent dùng JSON REST dưới `/api`. Kiến trúc là Modular Monolith; backend chịu authentication, role/resource authorization và business validation. Users hiện giới hạn ở `GET /api/users/me` nếu Chapter 3 không yêu cầu thêm endpoint. Các resource cần thiết kế gồm Authentication, Users, Properties, Rooms, Contracts, Payments, Maintenance Requests và Notifications. AI chỉ được gọi qua backend; không expose provider trực tiếp. Maintenance Request có thể được lưu `PENDING` nếu AI unavailable.

## Prompt(s)

### 1. Thiết kế REST API resource catalog

```text
Bạn là API Architect. Dựa trên Chapter 3 requirements, Chapter 4 flows, Chapter 5 architecture/database và API conventions được cung cấp, hãy thiết kế REST API catalog cho:
Authentication, Users, Properties, Rooms, Contracts, Payments, Maintenance Requests và Notifications.

Với từng endpoint, bắt buộc mô tả:
- HTTP method và endpoint;
- purpose/use case và resource-owning module;
- authentication requirement;
- authorization: role, ownership/relationship check ở backend;
- request path/query/body, field types và required/optional;
- response status/body và response fields;
- input/business validation;
- error cases và HTTP status codes.

Dùng JSON, UUID cho resource IDs và ISO-8601 UTC cho timestamps nếu conventions hiện tại xác nhận. Có thể dùng envelope lỗi thống nhất `{ error: { code, message, details? } }`. Thiết kế pagination cho collection nếu phù hợp. Không tạo endpoint/feature không được Chapter 3 yêu cầu. Users chỉ có `GET /api/users/me` trừ khi tài liệu nguồn yêu cầu endpoint khác; không tự giả định user registration/admin APIs.

Mọi endpoint protected phải kiểm tra token và quyền/ownership server-side; client-supplied ID không phải bằng chứng quyền. Trả kết quả dưới dạng bảng endpoint và specification chi tiết; ghi assumptions/open questions. Không viết controller/code.
```

### 2. Đặc tả POST /api/maintenance-requests

```text
Hãy đặc tả endpoint `POST /api/maintenance-requests` cho SmartRent theo Feature Specification, Maintenance flow, API design và database model được cung cấp.

Bắt buộc mô tả đầy đủ: HTTP method, endpoint, purpose, authentication, authorization, request schema/example, response schema/example, validation, error cases và HTTP status codes.

Request phải dùng các trường được source hỗ trợ, ví dụ original description/request text và room ID; không tự thêm field. Backend phải xác thực caller, xác nhận Tenant được phép tạo request cho room/contract tương ứng, kiểm tra dữ liệu và business rule trước khi gọi Maintenance Service/AI. Gửi tới AI chỉ dữ liệu tối thiểu qua AI Integration Boundary; validate output trước khi dùng.

Đặc tả success và fallback: khi AI thành công, trả request ID và trạng thái ban đầu authoritative theo backend (`PENDING`); khi thiếu thông tin, mô tả response/next step đúng với Chapter 4; khi AI unavailable/invalid, không chặn việc tiếp nhận request nếu requirements quy định fallback, giữ original description, lưu request `PENDING` chưa phân loại để landlord xử lý thủ công và thông báo trạng thái AI rõ ràng.

Liệt kê status code hợp lý cho validation/authentication/authorization/not-found/conflict/rate limit/internal error; phân biệt lỗi provider không được dùng để phá vỡ fallback của endpoint tạo request. Nêu error code/body nhất quán. AI không được bypass backend authorization/business validation, không ghi DB trực tiếp, không tự quyết định status/notification. Không viết code implementation.
```

### 3. Đặc tả POST /api/maintenance-requests/{id}/classify

```text
Hãy đặc tả endpoint `POST /api/maintenance-requests/{id}/classify` dùng để yêu cầu backend phân loại lại một Maintenance Request đã tồn tại.

Bắt buộc mô tả: HTTP method, endpoint, purpose, authentication, authorization, path/request schema, response, validation, error cases và HTTP status codes.

Backend phải xác thực token, tải request theo ID, kiểm tra requester là tenant sở hữu request hoặc landlord/manager quản lý property tương ứng theo policy; tránh tiết lộ tài nguyên không được phép. Chỉ sau authorization, Maintenance Service mới gọi AI Integration Adapter với context tối thiểu. Backend parse và validate category, priority, summary, confidence, missing information cùng mọi rule đã được source xác định trước khi cập nhật AI metadata.

Endpoint này không phải provider proxy. AI không nhận internal token, không có direct database access, không thực hiện authorization, không thay original description, không tự sửa `maintenance_requests.status` và không trigger critical business action. Phân biệt response cho success, missing information, invalid provider output/unavailable và request/state không hợp lệ; nêu rõ khi nào trả lỗi provider (ví dụ explicit reclassification) so với create endpoint fallback. Không tự chọn retry/persistence policy nếu source chưa quyết định; ghi open question.

Trả specification có request/response JSON examples, status/error matrix và authorization rules. Dùng HTTP codes nhất quán với API conventions được cung cấp. Không viết code.
```

### 4. Thiết kế Authentication, Users, rental resources và Notifications

```text
Thiết kế chi tiết các REST endpoints SmartRent cho Authentication, Users, Properties, Rooms, Contracts, Payments và Notifications, dựa trên requirements đính kèm.

Với từng endpoint bắt buộc liệt kê HTTP method, endpoint, purpose, authentication, authorization, request, response, validation, error cases và HTTP status codes. Ghi rõ role và resource ownership/relationship được kiểm tra ở backend. Không để frontend UI visibility thay thế authorization.

Ràng buộc:
- Chỉ thêm authentication operation được Chapter 3/API artifacts yêu cầu; không tự thêm registration/refresh/logout nếu chưa có nguồn.
- Users mặc định chỉ expose `GET /api/users/me` nếu scope hiện tại không đòi hỏi user administration.
- Properties/Rooms/Contracts/Payments/Notifications chỉ expose use case có traceability tới requirements.
- Không trả dữ liệu tenant/payment của người khác; không để endpoint notification tiết lộ recipient khác.
- Mutation tuân theo business rules và database relationship; status/payment/contract không được cập nhật bằng mass assignment.

Trình bày endpoint matrix trước, sau đó mô tả payload/error chi tiết. Dùng error envelope/conventions hiện có nếu được cung cấp; nếu chưa có convention, đề xuất một convention và đánh dấu là proposal. Nêu assumptions/open questions và không viết code.
```

## Expected Output

- Endpoint catalog theo resource với đủ method, path, purpose, authentication/authorization, request/response, validation, error cases và HTTP status.
- Request/response examples có thể dùng để review hoặc chuyển thành API specification.
- Create maintenance và explicit classify được đặc tả riêng, có policy fallback/authorization rõ ràng.
- Mọi endpoint, field và hành vi traceable tới requirement; assumptions không bị trình bày như quyết định đã duyệt.

## Human Review Notes

- Đối chiếu từng endpoint với Chapter 3 scope; không thêm registration/admin/CRUD thiếu căn cứ.
- Kiểm tra Tenant–Room–Contract và landlord/property ownership được xác minh server-side cho mỗi resource.
- Xác minh `POST /api/maintenance-requests` vẫn cho phép manual fallback khi AI không khả dụng; `classify` không sửa status.
- Kiểm tra status codes, error envelope, enums và payload thống nhất với API/database/sequence design.
- Đảm bảo không endpoint nào expose AI provider trực tiếp hoặc cho AI bypass authorization/business validation.