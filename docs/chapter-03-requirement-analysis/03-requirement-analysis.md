# 3.3 Requirement Analysis – SmartRent

## 1. Functional Requirement Analysis

| ID | Requirement | Actor | Priority | Input | Output |
|---|---|---|---|---|---|
| FR-01 | Đăng nhập | User | High | Email, password | Session |
| FR-02 | Quản lý phòng | Landlord | High | Room data | Room record |
| FR-03 | Quản lý người thuê | Landlord | High | Tenant data | Tenant record |
| FR-04 | Quản lý hợp đồng | Landlord | High | Contract data | Contract record |
| FR-05 | Theo dõi tiền thuê | Landlord/Tenant | High | Payment data | Payment status |
| FR-06 | Gửi yêu cầu sửa chữa | Tenant | High | Description, image | Request |
| FR-07 | Xử lý yêu cầu | Landlord | High | Request ID, status | Updated request |
| FR-08 | Gửi thông báo | System | Medium | Event | Notification |
| FR-09 | Chat AI | User | High | Natural language | AI response |
| FR-10 | Phân loại yêu cầu bằng AI | System/AI | High | Request text | Category, priority, summary |

## 2. Maintenance Request Flow
```text
Tenant
  ↓
Nhập nội dung sự cố
  ↓
SmartRent Backend
  ↓
AI Classification
  ↓
Category + Priority + Summary
  ↓
Lưu database
  ↓
Landlord nhận thông báo
  ↓
Processing
  ↓
Completed
```

## 3. Request States
```text
PENDING → PROCESSING → COMPLETED
                    ↘ CANCELLED
```

## 4. Business Rules
- Chỉ người thuê của phòng đó mới được tạo yêu cầu liên quan đến phòng.
- Người thuê chỉ xem được yêu cầu của mình.
- Chủ nhà chỉ quản lý tài sản thuộc quyền quản lý.
- Yêu cầu mới có trạng thái PENDING.
- AI không tự chuyển trạng thái hoàn thành.
- Dữ liệu AI trả về phải được kiểm tra trước khi thực hiện nghiệp vụ quan trọng.

## 5. Edge Cases
- Nội dung yêu cầu quá ngắn.
- Người thuê không cung cấp đủ thông tin.
- AI không xác định được category.
- AI service không phản hồi.
- Người dùng gửi yêu cầu trùng lặp.
- Phòng không còn thuộc quyền quản lý.
- Người thuê không còn hiệu lực hợp đồng.

## 6. Non-functional Analysis
### Security
Phân quyền theo role và kiểm tra quyền ở backend.

### Performance
Các truy vấn phổ biến cần có cấu trúc dữ liệu phù hợp; AI request có thể xử lý bất đồng bộ khi cần.

### Reliability
Nếu AI lỗi, người dùng vẫn có thể gửi yêu cầu thủ công.

### Usability
Giao diện ưu tiên thao tác đơn giản, trạng thái rõ ràng và thông báo dễ hiểu.
