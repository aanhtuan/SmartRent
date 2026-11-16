# 6.1 AI Sinh Mã nguồn (Code Generation)

## Khái niệm

Code Generation là việc yêu cầu AI tạo mới một phần mã nguồn từ yêu cầu, thiết kế, ví dụ đầu vào/đầu ra hoặc interface có sẵn. Kết quả có thể là một hàm, lớp, endpoint, test, migration hay tài liệu. AI giúp rút ngắn phần việc lặp lại, nhưng không tự xác nhận rằng mã phù hợp với kiến trúc hoặc an toàn để chạy.

## Khi nào nên dùng

- Tạo skeleton hoặc phần triển khai có phạm vi và contract rõ ràng.
- Viết test case từ acceptance criteria đã được xác nhận.
- Tạo mapping, validation đơn giản hoặc boilerplate theo pattern đang dùng trong repository.
- Đề xuất nhiều phương án triển khai nhỏ để lập trình viên so sánh.

Không nên giao một yêu cầu mơ hồ như “hoàn thiện toàn bộ backend”. Với thay đổi liên quan authorization, thanh toán, migration dữ liệu hay xử lý dữ liệu nhạy cảm, cần chia nhỏ và review đặc biệt kỹ.

## Cấu trúc yêu cầu sinh mã

1. Mục tiêu và hành vi quan sát được.
2. File, module hoặc abstraction được phép thay đổi.
3. API/type/schema hiện có cần tuân theo.
4. Constraints về kiến trúc, bảo mật, lỗi và tương thích.
5. Test cần có và cách chạy.
6. Điều không được thay đổi; yêu cầu AI liệt kê giả định nếu thiếu dữ liệu.

Prompt ví dụ cho SmartRent: “Triển khai validation cho input tạo Maintenance Request theo contract hiện có. Chỉ sửa service và test liên quan; giữ nguyên API public. Không thêm dependency, không gọi AI provider trong test, không thay đổi status flow. Trước khi đề xuất code, nêu file dự định sửa và các giả định.”

## Quy trình review mã sinh ra

- So sánh diff với yêu cầu ban đầu; bỏ thay đổi không liên quan.
- Kiểm tra input validation, authorization ở backend, error handling và data exposure.
- Xác nhận dependency direction phù hợp kiến trúc; controller không sở hữu business rule.
- Chạy test gần nhất trước, sau đó chạy các gate cần thiết của repository.
- Yêu cầu giải thích các đoạn không rõ; không merge code chỉ vì nó biên dịch.

## Tiêu chí hoàn thành

Mã đáp ứng acceptance criteria, tương thích contract và convention hiện có, có kiểm thử phù hợp, không chứa secret hoặc dữ liệu thật, và người review hiểu được mọi thay đổi được chấp nhận.