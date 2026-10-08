# 6.2 AI Tự động Hoàn thành Mã nguồn (Code Completion)

## Khái niệm

Code Completion dự đoán phần mã tiếp theo trong editor, từ một biểu thức ngắn đến một khối triển khai. Khác với yêu cầu sinh một feature hoàn chỉnh, completion hoạt động ngay trong ngữ cảnh file đang mở và thường được chấp nhận từng phần.

## Cách dùng có chủ đích

- Viết tên hàm, type và cấu trúc điều khiển thể hiện rõ ý định trước khi nhận gợi ý.
- Chấp nhận từng đoạn nhỏ; đọc lại cả phần trước và sau vị trí completion.
- Dùng completion cho boilerplate và pattern lặp lại đã có trong repository.
- Tự viết phần quyết định nghiệp vụ hoặc security-sensitive nếu không thể kiểm tra gợi ý ngay.
- Từ chối gợi ý không khớp abstraction, kể cả khi cú pháp có vẻ hợp lệ.

## Rủi ro thường gặp

- Tên biến/hàm hợp lệ nhưng business rule bị đảo hoặc thiếu nhánh.
- Dùng API, method hay package không tồn tại trong phiên bản dự án.
- Bỏ sót null/empty/error case hoặc tạo xử lý lỗi quá rộng.
- Vô tình lặp logic, mở rộng quyền truy cập hoặc log dữ liệu nhạy cảm.
- Completion kéo theo thay đổi ngoài đoạn đang viết khi chấp nhận nhiều dòng.

## Ví dụ trong SmartRent

Khi bổ sung kiểm tra trạng thái Maintenance Request, completion có thể gợi ý một nhánh `if` hoặc một test. Lập trình viên phải đối chiếu transition hợp lệ trong tài liệu nghiệp vụ, bảo đảm chỉ actor được authorize mới đổi trạng thái và vẫn giữ fallback khi AI unavailable. Gợi ý không phải nguồn xác nhận workflow.

## Thực hành tốt

- Đặt con trỏ trong hàm nhỏ, có contract rõ và context cục bộ đủ dùng.
- Dùng tên miền cụ thể như `requestStatus` thay vì tên mơ hồ.
- Kiểm tra import, side effect, exception và điều kiện biên sau mỗi completion.
- Chạy formatter/linter và test liên quan; không để completion tự thêm dependency hay sửa file hàng loạt ngoài ý định.