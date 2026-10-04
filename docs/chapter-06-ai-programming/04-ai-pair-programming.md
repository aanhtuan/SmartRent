# 6.4 Lập trình Cặp cùng AI (AI Pair Programming)

## Mô hình cộng tác

Trong AI Pair Programming, lập trình viên giữ vai trò điều khiển: xác định mục tiêu, chọn phạm vi, đánh giá trade-off và quyết định thay đổi. AI đảm nhận các lượt hỗ trợ như phân tích, đề xuất, viết một phần code/test và giải thích. Đây là vòng lặp cộng tác, không phải ủy quyền trách nhiệm.

```text
Developer xác định mục tiêu
  → AI phân tích và nêu câu hỏi/đề xuất
  → Developer chọn hướng và thu hẹp phạm vi
  → AI hỗ trợ một thay đổi nhỏ
  → Developer review, chạy test và quyết định
  → Lặp lại hoặc hoàn tất
```

## Chia vai rõ ràng

**Lập trình viên** sở hữu yêu cầu, architecture decision, quyền truy cập, dữ liệu, kiểm thử, review và quyết định merge.

**AI** có thể phân tích code được cung cấp, gợi ý triển khai, giải thích lựa chọn, tạo test và chỉ ra rủi ro. AI không được xem là nguồn sự thật của repository, không tự có quyền chạy hành động ngoài phạm vi được cấp và không thay con người phê duyệt kết quả.

## Kỹ thuật làm việc theo lượt

- Bắt đầu bằng yêu cầu một bước: giải thích, lập danh sách thay đổi, hoặc viết test; không yêu cầu tất cả cùng lúc.
- Chốt plan ngắn và file scope trước khi sinh implementation.
- Yêu cầu AI báo cáo file đã đổi, hành vi thay đổi, test đã chạy và phần chưa xác minh.
- Phản hồi bằng lỗi cụ thể hoặc kết quả test; tránh prompt kiểu “cứ sửa cho đến khi chạy”.
- Dừng và đánh giá lại khi AI lặp lại giả thuyết, tạo diff rộng hoặc xung đột với contract.

## Giao tiếp hiệu quả

Đưa context vừa đủ, dùng tên symbol chính xác, trích nguyên lỗi, nêu constraint và tiêu chí chấp nhận. Nếu AI chưa có đủ thông tin, trả lời câu hỏi làm rõ trước khi yêu cầu chỉnh code. Giữ hội thoại gắn với một mục tiêu để giảm nhầm lẫn giữa các thay đổi.

## Dấu hiệu cần can thiệp

- AI tự tạo endpoint, field hoặc dependency chưa được thống nhất.
- AI sửa test để khớp implementation thay vì bảo vệ requirement.
- Diff chạm authentication, authorization, payment hoặc migration ngoài scope.
- Không thể giải thích code, test chưa chạy, hoặc kết quả có thay đổi hành vi không được yêu cầu.