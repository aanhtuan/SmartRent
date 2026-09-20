# 4.3 Prototype – Maintenance Request

## Phạm vi

Prototype mô phỏng trải nghiệm người dùng của Maintenance Request; không triển khai backend, cơ sở dữ liệu, AI API hay thông báo thời gian thực.

## Luồng chính

```text
Dashboard → Danh sách yêu cầu → Tạo yêu cầu
→ Phân loại AI → Xác nhận → Chi tiết yêu cầu
→ Chủ nhà xử lý → PROCESSING → COMPLETED
```

## Tương tác

| Bước | Màn hình | Thao tác | Phản hồi | Kết quả |
|---|---|---|---|---|
| 1 | Dashboard | Chọn `Sửa chữa` | Mở danh sách yêu cầu. | Request List |
| 2 | Request List | Chọn `Tạo yêu cầu` | Hiển thị biểu mẫu. | Create Request |
| 3 | Create Request | Nhập dữ liệu, gửi | Kiểm tra dữ liệu và mô phỏng AI. | AI Result / Missing Information / AI Unavailable |
| 4 | AI Result | Chọn `Xác nhận gửi` | Lưu yêu cầu `PENDING`, thông báo chủ nhà. | Request Detail |
| 5 | Request Detail | Chủ nhà chọn `Bắt đầu xử lý` | Kiểm tra quyền và cập nhật trạng thái. | PROCESSING |
| 6 | Request Detail | Chủ nhà chọn `Hoàn thành` | Kiểm tra quyền và lưu thời điểm hoàn thành. | COMPLETED |

## Kịch bản thay thế

### Thiếu thông tin

AI yêu cầu vị trí và triệu chứng khi mô tả chưa đủ. Người thuê bổ sung thông tin, gửi lại để AI phân loại, rồi xác nhận kết quả.

### AI không khả dụng

Hệ thống vẫn lưu yêu cầu ở `PENDING` nhưng không có phân loại AI. Chủ nhà nhận yêu cầu và xử lý thủ công.

## Dữ liệu mô phỏng

| Tình huống | Kết quả |
|---|---|
| “Ống nước phòng tắm bị rò rỉ” | Hệ thống nước, Cao, confidence 0.92. |
| “Phòng bị hỏng” | Yêu cầu bổ sung vị trí và triệu chứng. |
| AI service lỗi | Lưu thủ công ở `PENDING`. |

## Tiêu chí kiểm tra

- Người thuê tạo và theo dõi được yêu cầu.
- Có ba kết quả: AI thành công, thiếu thông tin và AI lỗi.
- Chủ nhà đi đúng chuỗi `PENDING → PROCESSING → COMPLETED`.
- AI hỗ trợ phân loại, còn quyền và workflow thuộc backend/application.
