# Final Review – Chapter 5 Software Architecture

## Review Summary

Chapter 5 đã được review đối chiếu với Chapter 3 requirements, Chapter 4 product design, các architecture/UML/database/API/pattern artifacts và Bài thực hành 5. Kết quả: kiến trúc **Modular Monolith + Layered Architecture + REST API + PostgreSQL + AI Integration Boundary** nhất quán với MVP.

Maintenance Request là luồng kiểm tra trọng tâm và nhất quán: Tenant → Frontend → REST API → backend authentication/authorization → Maintenance Service → AI Integration/Provider (nếu dùng) → validate result → PostgreSQL → post-commit Notification. Request mới luôn `PENDING`; chỉ Manager/Landlord được backend authorize mới transition `PENDING → PROCESSING → COMPLETED`. AI là nguồn gợi ý không tin cậy trước validation và không sở hữu workflow.

Chapter 3 và Chapter 4 được giữ nguyên trong review này.

## Review results

| Check | Result | Evidence |
|---|---|---|
| Architecture khớp requirements | Pass | Module coverage/traceability cho FR-01–FR-10 trong [5.1](01-architecture-design.md). |
| Architecture khớp Product Design | Pass | Maintenance main, missing-information và AI-unavailable flow được giữ trong [5.1](01-architecture-design.md). |
| UML khớp Architecture | Pass | Component/sequence models thể hiện Modular Monolith, layers và AI validation boundary. |
| Database khớp UML | Pass after fix | Entity/cardinality và AI missing-information metadata được đồng bộ giữa UML ERD và schema. |
| API khớp Database | Pass after fix | API payload/resource scope khớp schema; AI Assistant coverage đáp ứng FR-09. |
| Design Patterns khớp Architecture | Pass | Repository/Service/Adapter giữ layer boundary; Strategy/Factory là conditional, không tạo service mới. |
| AI boundary rõ ràng | Pass | Provider không có direct DB/auth/status-transition path; output qua validator. |
| Authorization thuộc Backend | Pass | REST/use case policy kiểm tra role + ownership/active contract server-side. |
| AI direct database access | Pass | Prohibited trong architecture, UML, database và API design. |
| AI failure fallback | Pass | Persist original request `PENDING` để manual handling. |
| Maintenance flow | Pass | Flow có authorization, validation, persistence và notification-after-commit. |
| `PENDING → PROCESSING → COMPLETED` | Pass | Status do Maintenance Service/domain policy sở hữu; `CANCELLED` chỉ theo policy hiện có. |
| Scope mới không có requirement | Pass after fix | Loại endpoint logout không được nêu; các future option được ghi rõ là conditional/non-MVP. |
| Nội dung Chapter 6 làm quá sớm | Pass | Không có application code, migration, controller, repository implementation hoặc integration thực thi. |
| Naming và relative paths | Pass | File naming theo phần/artifact; tất cả Markdown relative links đã được kiểm tra resolve thành công. |

## Issues Found

| ID | Severity | Finding | Impact |
|---|---|---|---|
| R-01 | Medium | 5.1/5.2 đề cập “status history” như dữ liệu hiện có, trong khi 5.4 không thiết kế status-history table cho MVP. | Mâu thuẫn giữa Architecture/Patterns và Database Design. |
| R-02 | Low | UML ERD không hiển thị `ai_missing_information`, dù UML class, database schema và API đều dùng field này. | ER overview chưa phản ánh đầy đủ missing-information flow. |
| R-03 | Medium | API artifacts chưa mô tả endpoint AI Assistant của FR-09, đồng thời có `logout` endpoint không được requirements hiện tại nêu. | Thiếu traceability FR-09 và có scope expansion không cần thiết. |
| R-04 | Low | `prompts/chapter-05/` không tồn tại. | Thiếu nơi lưu prompt provenance riêng; không chặn tính nhất quán của final design vì Bài thực hành 5 có inline prompt templates. |

## Fixes Applied

| Issue | Fix applied within Chapter 5 |
|---|---|
| R-01 | Sửa [5.1](01-architecture-design.md) và [5.2](02-architecture-patterns.md): MVP chỉ giữ status hiện tại/audit timestamps; detailed status history là future extension khi có requirement audit. |
| R-02 | Sửa [UML data model overview](../../design/uml/data-model-overview.md) để hiển thị `ai_missing_information` trên `MAINTENANCE_REQUEST`. |
| R-03 | Sửa API resource map/README và [Authentication API](../../design/api/authentication-api.md): thêm `POST /api/ai-assistant/messages` theo FR-09, backend-filtered/authorized/read-only; loại `POST /api/auth/logout` ngoài requirements. Cập nhật [Bài thực hành 5](../../demo/chapter-05/README.md) để evidence API phản ánh FR-09. |

Không sửa tài liệu Chapter 3 hoặc Chapter 4, không tạo feature mới và không thêm implementation code.

## Remaining Issues

- **R-04 remains non-blocking:** chưa có `prompts/chapter-05/`. Inline prompt templates trong [Bài thực hành 5](../../demo/chapter-05/README.md) là evidence hiện tại. Nếu quy trình môn học yêu cầu prompt files versioned, có thể tạo chúng ở một task documentation riêng; không cần để bắt đầu Chapter 6.
- Detailed status-history/audit table, attachments, raw AI-result versioning, durable notification outbox, nhiều AI provider/channel là future extensions đã ghi rõ điều kiện; chúng không thuộc MVP Chapter 5.
- Không còn consistency blocker trong Chapter 5 sau các fixes trên.

## Chapter 5 Completion Checklist

| Item | Status | Evidence |
|---|---|---|
| 5.1 Architecture Design | Complete | [01-architecture-design.md](01-architecture-design.md), [architecture artifact](../../design/architecture/smartrent-architecture.md) |
| 5.2 Architecture Patterns | Complete | [02-architecture-patterns.md](02-architecture-patterns.md), [decision artifact](../../design/architecture/architecture-pattern-decisions.md) |
| 5.3 System Modeling & UML | Complete | [03-system-modeling-uml.md](03-system-modeling-uml.md), [UML README](../../design/uml/README.md) |
| 5.4 Database Design | Complete | [04-database-design.md](04-database-design.md), [database README](../../design/database/README.md) |
| 5.5 API Design | Complete | [05-api-design.md](05-api-design.md), [API README](../../design/api/README.md) |
| 5.6 Design Patterns | Complete | [06-design-patterns.md](06-design-patterns.md), [pattern decisions](../../design/patterns/pattern-decisions.md) |
| Bài thực hành 5 | Complete | [demo/chapter-05/README.md](../../demo/chapter-05/README.md) |
| Relative-link validation | Pass | All local Markdown relative links in reviewed scope resolve. |
| Naming validation | Pass | Numbered Chapter 5 docs and directory-specific artifact names are consistent. |
| Git commit | Not created | Required by task. |

## Transition to Chapter 6

Chapter 6 có thể sử dụng Chapter 5 làm baseline, nhưng cần giữ ranh giới sau trong mọi implementation:

1. Implement theo Modular Monolith/layer direction: Controller → Service → Repository → PostgreSQL.
2. Enforce authorization in backend for every protected use case and resource relationship.
3. Integrate AI only through AI Adapter; validate structured output before write/business logic.
4. Preserve manual fallback: AI failure/invalid output vẫn tạo/lưu Maintenance Request `PENDING` với original description.
5. Do not let AI query PostgreSQL directly, authorize actors, transition critical Maintenance state, complete a request or confirm financial transactions.
6. Use schema/API/UML as design contracts; any change to MVP entity, endpoint, status flow or pattern should first update Chapter 5 design and receive human review.

No Chapter 6 implementation has been added by this review.
