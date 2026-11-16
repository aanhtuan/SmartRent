# 6.3 AI Sửa lỗi (Debugging)

## Mục tiêu

AI có thể hỗ trợ thu hẹp nguyên nhân lỗi, diễn giải stack trace, đề xuất phép kiểm tra và tạo regression test. Debugging tốt bắt đầu từ bằng chứng quan sát được; không yêu cầu AI đoán cách sửa chỉ dựa trên mô tả chung chung.

## Thông tin nên cung cấp

- Hành vi mong đợi và hành vi thực tế.
- Các bước tái hiện tối thiểu, môi trường và phiên bản liên quan.
- Error message/stack trace đã loại bỏ token, PII và thông tin nhạy cảm.
- Đoạn code và test liên quan cùng thay đổi gần đây nếu biết.
- Kết quả lệnh kiểm tra đã chạy.

## Quy trình chẩn đoán

1. Tái hiện lỗi hoặc xác nhận test đang thất bại.
2. Yêu cầu AI đưa ra giả thuyết có thể kiểm chứng, xếp theo bằng chứng; tách fact khỏi suy đoán.
3. Chạy phép kiểm tra nhỏ nhất để phân biệt các giả thuyết.
4. Sửa nguyên nhân gốc với diff nhỏ; tránh đổi hành vi không thuộc bug.
5. Thêm hoặc cập nhật regression test để khóa hành vi mong đợi.
6. Chạy lại test đã thất bại và gate liên quan; xem xét side effect trước khi kết luận.

## Debugging có AI trong SmartRent

Nếu lỗi là request được lưu dù classification provider timeout, cần lần theo ranh giới AI Adapter, fallback và transaction. Kết quả mong đợi theo kiến trúc là không tin output lỗi, giữ mô tả gốc và cho phép luồng xử lý thủ công `PENDING` khi phù hợp. Không “sửa” lỗi bằng cách để AI cập nhật trực tiếp database hoặc bỏ authorization.

## Giới hạn

AI có thể đưa ra nguyên nhân nghe hợp lý nhưng sai, đặc biệt khi thiếu runtime context. Không gửi production dump hoặc bí mật vào prompt. Không thay đổi nhiều module trước khi chứng minh lỗi nằm ở đó; nếu không tái hiện được, ghi rõ mức độ chưa chắc chắn và dữ liệu còn thiếu.