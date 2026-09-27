# 4.2 Wireframe – Maintenance Request

## Mục tiêu

Wireframe low-fidelity cho luồng tạo và xử lý yêu cầu sửa chữa. Nội dung tập trung vào cấu trúc thông tin, thao tác chính và trạng thái ngoại lệ, không quy định giao diện cuối cùng.

## Danh sách màn hình

| ID | Màn hình | Actor | Mục đích |
|---|---|---|---|
| WF-01 | Tenant Dashboard | Người thuê | Đi đến yêu cầu sửa chữa. |
| WF-02 | Request List | Người thuê | Xem, lọc và tạo yêu cầu. |
| WF-03 | Create Request | Người thuê | Nhập phòng và mô tả sự cố. |
| WF-04 | AI Result | Người thuê | Kiểm tra kết quả AI trước khi lưu. |
| WF-05 | Request Detail | Người thuê / Chủ nhà | Theo dõi nội dung, AI result và trạng thái. |
| WF-06 | Landlord Dashboard | Chủ nhà | Ưu tiên và xử lý yêu cầu. |
| WF-07 | Missing Information | Người thuê | Bổ sung thông tin còn thiếu. |
| WF-08 | AI Unavailable | Người thuê | Xác nhận xử lý thủ công. |

## Màn hình chính

### WF-02 – Danh sách yêu cầu

```text
+------------------------------------------------+
| Yêu cầu sửa chữa                               |
+------------------------------------------------+
| [ + Tạo yêu cầu ]                              |
| Bộ lọc: [Tất cả v]  Trạng thái: [Tất cả v]    |
| #001 | Hệ thống nước | Cao   | PENDING         |
| #002 | Internet      | Trung | PROCESSING      |
+------------------------------------------------+
```

### WF-03 – Tạo yêu cầu

```text
+------------------------------------------------+
| Tạo yêu cầu sửa chữa                           |
+------------------------------------------------+
| Phòng: [Phòng 101                         v]   |
| Mô tả sự cố *                                  |
| +--------------------------------------------+ |
| | Ví dụ: Ống nước trong phòng tắm bị rò rỉ.  | |
| +--------------------------------------------+ |
| [Hủy]                         [Gửi yêu cầu]    |
+------------------------------------------------+
```

Validation: bắt buộc có phòng và mô tả trước khi gửi.

### WF-04 – Kết quả phân tích AI

```text
+------------------------------------------------+
| Kết quả phân tích AI                           |
+------------------------------------------------+
| Danh mục: Hệ thống nước                        |
| Mức độ ưu tiên: Cao                            |
| Tóm tắt: Có rò rỉ tại ống nước phòng tắm.      |
| Độ tin cậy: 0.92                               |
| [Sửa thông tin]              [Xác nhận gửi]    |
+------------------------------------------------+
```

Kết quả AI chỉ là hỗ trợ; người thuê có thể chỉnh sửa thông tin trước khi xác nhận.

### WF-05 – Chi tiết yêu cầu

```text
+------------------------------------------------+
| Yêu cầu sửa chữa #001                          |
+------------------------------------------------+
| Danh mục: Hệ thống nước | Ưu tiên: Cao         |
| Trạng thái: PROCESSING                          |
| Mô tả gốc: Ống nước trong phòng tắm bị rò rỉ.   |
| Tóm tắt AI: Có rò rỉ tại ống nước phòng tắm.   |
| Timeline: PENDING -- PROCESSING -- COMPLETED   |
+------------------------------------------------+
```

Người thuê chỉ theo dõi. Chủ nhà có thêm `Bắt đầu xử lý` và `Hoàn thành`; backend xác thực quyền trước khi đổi trạng thái.

## Trạng thái ngoại lệ

### WF-07 – Thiếu thông tin

```text
+------------------------------------------------+
| Cần thêm thông tin                             |
| AI chưa thể phân loại đáng tin cậy.             |
| Vui lòng cho biết vị trí và triệu chứng cụ thể. |
| [Thông tin bổ sung...........................]  |
| [Quay lại]                 [Gửi thông tin]     |
+------------------------------------------------+
```

### WF-08 – AI không khả dụng

```text
+------------------------------------------------+
| Yêu cầu đã được tiếp nhận                       |
| AI tạm thời không khả dụng. Yêu cầu vẫn được   |
| lưu để chủ nhà xử lý thủ công.                  |
| Trạng thái: PENDING            [Xem yêu cầu]   |
+------------------------------------------------+
```

## Nguyên tắc thiết kế

- Thao tác chính có nhãn rõ ràng và dễ tìm.
- Luôn giữ mô tả gốc cùng kết quả AI.
- AI không tự thay đổi trạng thái hoặc thực hiện hành động nghiệp vụ quan trọng.
- Có fallback cho thiếu thông tin và lỗi dịch vụ AI.
