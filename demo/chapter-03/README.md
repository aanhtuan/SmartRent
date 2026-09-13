# Bài thực hành 3 – Demo AI trong Phân tích Yêu cầu & Sản phẩm

## 1. Mục tiêu

Minh họa việc sử dụng Prompt AI trong các hoạt động của Chapter 3 và cách kết quả từ AI được người phát triển kiểm tra, điều chỉnh trước khi đưa vào tài liệu SmartRent.

## 2. Quy trình Demo

Mỗi demo được thực hiện theo quy trình:

```text
Context
   ↓
Prompt
   ↓
AI Output
   ↓
Human Review
   ↓
Refinement
   ↓
Final Result
```

## 3. Demo 1 – Product Discovery

Sử dụng:

`../../prompts/chapter-03/product-discovery-prompts.md`

### Input chính

> Phân tích Product Discovery cho SmartRent.

### Kết quả cần minh họa

- Target users
- Pain points
- Product opportunities
- AI opportunities
- MVP features

### Human Review

Kiểm tra kết quả có phù hợp với phạm vi đồ án SmartRent hay không, loại bỏ các chức năng quá lớn và xác định MVP có tính khả thi.

## 4. Demo 2 – PRD

Sử dụng:

`../../prompts/chapter-03/prd-prompts.md`

### Kết quả cần minh họa

- Product overview
- Product goals
- Target users
- User roles
- Functional requirements
- Non-functional requirements
- AI requirements
- MVP scope
- Out of scope
- Assumptions

### Human Review

Kiểm tra từng requirement, đặc biệt là ID, phạm vi chức năng và khả năng chuyển tiếp sang Requirement Analysis, User Story và Feature Specification.

## 5. Demo 3 – Requirement Analysis

Sử dụng:

`../../prompts/chapter-03/requirement-prompts.md`

### Kết quả cần minh họa

- Requirement ID
- Actor
- Priority
- Input / Processing / Output
- Business rules
- Edge cases
- Security considerations
- Preconditions / Postconditions
- Acceptance criteria

### Human Review

Đối chiếu kết quả với PRD và chỉnh sửa các requirement chưa rõ actor, input, output, điều kiện xử lý hoặc quy tắc nghiệp vụ.

Đặc biệt kiểm tra chức năng gửi yêu cầu sửa chữa và AI phân loại yêu cầu.

## 6. Demo 4 – User Story

### Prompt mẫu

> Từ chức năng gửi yêu cầu sửa chữa của SmartRent, hãy tạo User Story và Acceptance Criteria theo Agile.

### Kết quả cần minh họa

- User Story
- Actor / role
- User goal
- Acceptance Criteria
- Các trường hợp hợp lệ và không hợp lệ

### Human Review

Kiểm tra User Story có phản ánh đúng requirement hay không và Acceptance Criteria có thể kiểm thử được hay không.

## 7. Demo 5 – Feature Specification

Sử dụng:

`../../prompts/chapter-03/feature-prompts.md`

### Kết quả cần minh họa

- Objective
- User
- User flow
- Input
- AI processing
- Output schema
- Categories
- Priority levels
- Error handling
- Edge cases
- Acceptance criteria
- Security considerations

### Human Review

Kiểm tra:

- JSON schema có hợp lệ không.
- Category và Priority có phù hợp không.
- AI có tự suy đoán khi thiếu thông tin không.
- Confidence có được xử lý hợp lý không.
- Error và fallback có đảm bảo hệ thống vẫn hoạt động không.
- AI có thực hiện hoặc đề xuất thao tác vượt quyền không.
- Backend có kiểm soát và xác thực kết quả AI hay không.

## 8. Evidence

Mỗi demo nên lưu lại bằng chứng của quá trình sử dụng AI:

- Prompt được sử dụng.
- AI Output.
- Human Review.
- Final Result.

Bằng chứng có thể được lưu dưới dạng:

- Screenshot.
- Markdown.
- JSON.
- Hoặc tài liệu kết quả tương ứng.

## 9. Kết luận

Các demo cho thấy AI có thể hỗ trợ từ giai đoạn khám phá sản phẩm đến đặc tả tính năng trong Chapter 3.

AI đóng vai trò hỗ trợ tạo và phân tích nội dung, trong khi người phát triển chịu trách nhiệm kiểm tra, điều chỉnh và xác nhận kết quả trước khi áp dụng vào SmartRent.
