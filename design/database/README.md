# SmartRent Database Design Artifacts

Các artifact mô tả logical PostgreSQL design cho Chapter 5 – phần 5.4. Chúng không phải migration, SQL DDL hoặc implementation code.

| File | Nội dung |
|---|---|
| [schema.md](schema.md) | Bảng, cột, type, key, constraint, default và index. |
| [erd.md](erd.md) | Mermaid ER diagram, cardinality và integrity notes. |

Nguồn ràng buộc là Chapter 3 requirements, Chapter 4 Maintenance flow, Chapter 5.1 architecture, Chapter 5.2 pattern decision và Chapter 5.3 UML. PostgreSQL chỉ được truy cập qua backend Repository/Transaction layer; AI Provider không có direct database access.
