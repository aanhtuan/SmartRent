# Bài thực hành 6 – Lập trình SmartRent cùng AI

## Mục tiêu

Thực hành một vòng đời coding có AI hỗ trợ trên một lát cắt nhỏ của Maintenance Request: làm rõ contract, tạo hoặc bổ sung test, triển khai, chẩn đoán một lỗi có chủ đích và review kết quả. Bài tập chỉ chạy trong môi trường phát triển; không dùng dữ liệu người thuê thật hoặc credential của AI provider.

## Phạm vi

Chọn repository/module hiện có liên quan đến Maintenance Request. Nếu chưa có implementation code, thực hiện phần phân tích/test design trên một branch hoặc sandbox riêng và ghi rõ những gì chưa thể chạy; không tự giả định endpoint, framework hay schema mới. Không triển khai provider AI thật trong bài này.

Hành vi cần giữ theo tài liệu SmartRent:

- Request có mô tả gốc và trạng thái ban đầu `PENDING`.
- Phân loại AI chỉ là gợi ý; backend xác thực input, authorization và kết quả trước khi lưu metadata.
- Nếu AI lỗi hoặc output không hợp lệ, không tin gợi ý; luồng xử lý thủ công vẫn khả dụng.
- AI không truy cập database trực tiếp và không tự chuyển trạng thái nghiệp vụ.

## Các bước thực hành

1. **Khảo sát:** xác định file/API/service/test đang sở hữu hành vi; ghi lại contract và acceptance criteria có liên quan.
2. **Lập kế hoạch với AI:** dùng prompt phân tích trong [bộ prompt](../../prompts/chapter-06/ai-programming-prompts.md); yêu cầu nêu file scope, giả định và rủi ro trước khi sửa.
3. **Viết test:** tạo test cho success, AI unavailable/invalid output và authorization boundary dựa trên code/contract có thật.
4. **Sinh hoặc hoàn thiện code:** yêu cầu triển khai tối thiểu trong scope đã duyệt; không thay đổi public API hay thêm dependency nếu không có lý do được xác nhận.
5. **Debug có chủ đích:** trong môi trường test, làm một test thất bại bằng cách đảo một điều kiện fallback hoặc validation; đưa error và context đã loại bỏ dữ liệu nhạy cảm cho AI phân tích, rồi khôi phục behavior qua một regression test.
6. **Pair review:** yêu cầu AI giải thích diff và liệt kê edge case; người học đối chiếu với requirement, architecture và test.
7. **Xác minh:** chạy test nhỏ nhất trước, sau đó các quality gate sẵn có. Ghi lại lệnh, kết quả và phần chưa chạy.

## Deliverables

- Tóm tắt behavior và file scope trước khi code.
- Test/implementation diff nhỏ, có thể review.
- Bảng ngắn gồm acceptance criteria, test tương ứng và kết quả.
- Ghi chú review: giả định, phát hiện AI sai hoặc thiếu, rủi ro còn lại.

## Rubric

| Tiêu chí | Đạt khi |
|---|---|
| Scope | Chỉ thay đổi phần cần thiết, không tự thêm API/schema/dependency. |
| Correctness | Test bao phủ luồng thành công và ít nhất một failure/fallback case. |
| Security | Authorization vẫn ở backend; prompt/log không chứa secret hoặc PII thật. |
| Review | Người học giải thích được code được chấp nhận và từ chối thay đổi không phù hợp. |
| Evidence | Kết quả test được ghi trung thực; phần không xác minh được nêu rõ. |

## Câu hỏi thảo luận

- Phần nào AI làm nhanh hơn, và phần nào cần quyết định của con người?
- Có giả định nào AI đưa ra không khớp code hoặc tài liệu?
- Test nào phân biệt được bug gốc với triệu chứng?
- Nếu provider timeout, trạng thái và dữ liệu nào phải được giữ nguyên?