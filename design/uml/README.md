# SmartRent UML Artifacts

Các artifact này là mô hình thiết kế cho Chapter 5 – phần 5.3. Chúng không phải code implementation, database migration hay API specification chi tiết.

| File | Model |
|---|---|
| [use-case-model.md](use-case-model.md) | Use case và actor MVP. |
| [component-model.md](component-model.md) | Component/boundary trong Modular Monolith. |
| [class-model.md](class-model.md) | Logical domain class diagram. |
| [maintenance-sequence.md](maintenance-sequence.md) | Sequence tạo Maintenance Request, thiếu thông tin và AI fallback. |
| [data-model-overview.md](data-model-overview.md) | ER overview cho PostgreSQL. |

Nguồn phụ thuộc:

- Chapter 3: functional requirements, user stories và feature specification.
- Chapter 4: Maintenance user flow, wireframe, prototype và AI design review.
- Chapter 5.1: Modular Monolith, layers, REST/PostgreSQL/AI boundaries.
- Chapter 5.2: quyết định pattern và trade-off không dùng microservices cho MVP.

Quy tắc xuyên suốt: Frontend không tự authorize; AI Provider không truy cập database trực tiếp, không quyết định authorization, không đổi critical state và không hoàn tất Maintenance Request.
