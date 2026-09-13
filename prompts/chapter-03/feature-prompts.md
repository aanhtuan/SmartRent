# Prompt – Feature Specification

## Prompt
Bạn là Senior Software/Product Analyst.

Hãy viết Feature Specification cho tính năng AI Maintenance Assistant của SmartRent.

Bao gồm:
1. Objective
2. User
3. User flow
4. Input
5. AI processing
6. Output schema
7. Categories
8. Priority levels
9. Error handling
10. Edge cases
11. Acceptance Criteria
12. Security considerations

Kết quả phải đủ cụ thể để developer có thể dùng làm cơ sở thiết kế API và triển khai tính năng.

## Human Review
Người phát triển phải kiểm tra:
- JSON schema có hợp lệ không
- Category và Priority có phù hợp không
- AI có tự suy đoán khi thiếu thông tin không
- Confidence có hợp lý không
- Error/fallback có đảm bảo hệ thống vẫn hoạt động không
- AI có thực hiện hoặc đề xuất thao tác vượt quyền không


Hãy xác định rõ:
- JSON input/output schema
- Validation rules
- Confidence threshold
- Missing information handling
- Fallback khi AI không thể phân loại
- Fallback khi AI service không khả dụng
- Không để AI tự thực hiện các thao tác quan trọng
- Backend phải kiểm soát và xác thực kết quả AI
