# Chương 6 – AI Lập trình

Chương này hướng dẫn sử dụng AI như một cộng sự trong quá trình phát triển phần mềm: sinh mã nguồn, hoàn thành đoạn mã, hỗ trợ sửa lỗi và lập trình cặp. AI tạo đề xuất; lập trình viên chịu trách nhiệm hiểu, kiểm tra, kiểm thử và quyết định có đưa thay đổi vào sản phẩm hay không.

## Nội dung

| Mục | Chủ đề | Tài liệu |
|---|---|---|
| 6.1 | AI Sinh Mã nguồn (Code Generation) | [01-code-generation.md](01-code-generation.md) |
| 6.2 | AI Tự động Hoàn thành Mã nguồn (Code Completion) | [02-code-completion.md](02-code-completion.md) |
| 6.3 | AI Sửa lỗi (Debugging) | [03-debugging.md](03-debugging.md) |
| 6.4 | Lập trình Cặp cùng AI (AI Pair Programming) | [04-ai-pair-programming.md](04-ai-pair-programming.md) |
| 6.5 | Quy trình Lập trình cùng AI | [05-ai-programming-workflow.md](05-ai-programming-workflow.md) |
| Bài thực hành 6 | Xây dựng và kiểm chứng một lát cắt tính năng | [06-practical-exercise.md](06-practical-exercise.md) |
| Demo ví dụ minh họa | Walkthrough thực hành trên luồng Maintenance Request | [demo README](../../demo/chapter-06/README.md) |

## Nguyên tắc xuyên suốt

- Cung cấp yêu cầu, ngữ cảnh và ràng buộc cần thiết; không gửi secret, token, dữ liệu cá nhân thật hoặc mã nguồn không được phép chia sẻ.
- Xem mã AI sinh ra như mã do contributor chưa được review cung cấp: đọc từng thay đổi, kiểm tra boundary và xác minh bằng test/linter/build phù hợp.
- Không cho AI quyết định quyền truy cập, trạng thái nghiệp vụ hoặc tính đúng đắn của giao dịch. Backend vẫn là nơi thực thi authorization và business rules.
- Giữ thay đổi nhỏ, có thể review và hoàn tác; không chấp nhận diff ngoài phạm vi yêu cầu.
- Khi thiếu context, yêu cầu AI nêu câu hỏi hoặc giả định thay vì tự bịa API, schema hay hành vi.

## Tài liệu hỗ trợ

- [Prompt thực hành Chương 6](../../prompts/chapter-06/ai-programming-prompts.md)
- [Architecture SmartRent](../../design/architecture/smartrent-architecture.md)
- [Maintenance API](../../design/api/maintenance-api.md)