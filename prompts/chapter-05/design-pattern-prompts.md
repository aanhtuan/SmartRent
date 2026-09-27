# SmartRent Chapter 5 – Design Pattern Prompts

## Purpose

Bộ prompt đánh giá có chọn lọc Repository Pattern, Service Layer, Adapter Pattern, Strategy Pattern và Factory Pattern trong các use case SmartRent. Mục tiêu là giải quyết vấn đề thiết kế thực, không tăng số lượng pattern được áp dụng.

## Context

SmartRent dùng Modular Monolith + Layered Architecture + REST API + PostgreSQL và AI Integration Boundary. Backend sở hữu authorization, business validation, transaction và Maintenance lifecycle. AI provider được cô lập qua adapter; output phải được validate; failure phải có fallback thủ công phù hợp. Chỉ áp dụng pattern khi có vấn đề cụ thể, abstraction mang lại lợi ích tương xứng và phù hợp với convention hiện có.

## Prompt(s)

### Prompt đánh giá từng pattern

Sao chép prompt dưới đây, thay `[PATTERN]` bằng một trong: Repository Pattern, Service Layer, Adapter Pattern, Strategy Pattern, Factory Pattern. Có thể chạy riêng cho từng pattern để dễ review.

```text
Bạn là Software Architect đang đánh giá việc dùng [PATTERN] trong SmartRent. Dựa trên requirements, architecture, API, database và Maintenance flow được cung cấp, hãy phân tích pattern này trong đúng context hiện tại, không trình bày lý thuyết chung chung.

Với [PATTERN], bắt buộc trả lời:
1. Problem: vấn đề cụ thể nào trong SmartRent đang tồn tại hoặc có khả năng phát sinh? Dẫn use case/artefact làm bằng chứng.
2. Intent: pattern giải quyết vấn đề đó bằng nguyên tắc gì?
3. Structure: các role/interface/collaborator cần thiết và dependency direction; minh họa ở mức khái niệm, không viết implementation code.
4. SmartRent use case: áp dụng hoặc không áp dụng vào ví dụ thực tế (Maintenance, PostgreSQL access, AI provider integration hoặc variation được requirements xác nhận). Nêu vị trí ownership trong Modular Monolith/Layered Architecture.
5. Benefits: testability, coupling, maintainability, security hoặc extensibility nào được cải thiện và vì sao?
6. Trade-offs: abstraction/boilerplate, indirection, complexity, performance hoặc nguy cơ che giấu domain behavior.
7. Necessity: pattern có thực sự cần thiết ở MVP không? Có giải pháp đơn giản hơn đáp ứng đủ không? Nêu tiêu chí quyết định.
8. Recommendation: adopt / do not adopt / defer, phạm vi áp dụng và dấu hiệu cần xem xét lại.

Ràng buộc SmartRent: controller không truy cập PostgreSQL trực tiếp; business authorization/validation và status transition thuộc backend; AI provider chỉ được gọi qua AI Integration Boundary, không có database access/quyền nghiệp vụ; notification theo business event sau commit. Không áp dụng pattern chỉ để tăng số lượng pattern. Không đề xuất tạo interface/factory/strategy nếu hiện chỉ có một implementation và không có variation requirement. Phân biệt fact, assumption và recommendation; nêu câu hỏi còn thiếu; không viết code.
```

### Prompt so sánh và chọn pattern cho một use case

```text
Hãy đánh giá các pattern Repository Pattern, Service Layer, Adapter Pattern, Strategy Pattern và Factory Pattern cho use case SmartRent sau: [mô tả use case cụ thể, ví dụ phân loại Maintenance Request hoặc truy vấn danh sách request].

Với từng pattern, nêu ngắn gọn problem/intent, structure, SmartRent fit, benefits, trade-offs và có thực sự cần hay không. Sau đó đề xuất tổ hợp tối thiểu giải quyết use case; giải thích pattern nào nên dùng, không dùng hoặc trì hoãn. Không cố gắng đưa cả năm pattern vào thiết kế.

Giữ boundary hiện tại: Modular Monolith + Layered Architecture + PostgreSQL + AI Integration Boundary. Backend xác thực quyền và business rules; output AI được validate; provider không truy cập DB. Gắn recommendation với requirements và complexity ở MVP. Không viết code và không tạo abstraction không có nhu cầu cụ thể.
```

## Expected Output

- Với mỗi pattern: problem, intent, structure, SmartRent use case, benefits, trade-offs và necessity/recommendation.
- Khuyến nghị theo từng pattern là adopt, do not adopt hoặc defer, có rationale và phạm vi rõ.
- Tổ hợp đề xuất tối thiểu, không áp dụng pattern theo quota.
- Đánh dấu variation requirement, assumption và điều kiện xem xét lại.

## Human Review Notes

- Kiểm tra pattern giải quyết vấn đề đã có trong SmartRent chứ không chỉ khớp định nghĩa sách giáo khoa.
- Repository không làm rò business rules khỏi domain; Service Layer không trở thành “god service”.
- Adapter giữ SDK/provider detail ở AI boundary; Strategy/Factory chỉ hợp lý khi có variation/creation complexity thực sự.
- So sánh lợi ích với indirection/boilerplate trong MVP; chấp nhận kết luận “không cần pattern này”.
- Xác minh authorization, transaction, validate AI result và ownership vẫn nằm đúng boundary sau khi áp dụng.