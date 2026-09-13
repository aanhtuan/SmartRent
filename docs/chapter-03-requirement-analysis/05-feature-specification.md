# 3.5 Feature Specification – SmartRent

## Feature F-01: AI Maintenance Assistant

### 1. Objective
Tự động phân tích nội dung yêu cầu sửa chữa của người thuê để hỗ trợ phân loại, ưu tiên và tóm tắt.

### 2. User
- Người thuê.
- Chủ nhà/quản lý.

### 3. Input
```json
{
  "request_text": "Máy lạnh phòng tôi không lạnh và có tiếng kêu lớn.",
  "room_id": "A101"
}
```

### 4. AI Processing
AI thực hiện:
1. Đọc nội dung.
2. Xác định loại sự cố.
3. Xác định mức độ ưu tiên.
4. Tóm tắt sự cố.
5. Nêu thông tin còn thiếu nếu cần.

### 5. Output
```json
{
  "category": "AIR_CONDITIONER",
  "priority": "MEDIUM",
  "summary": "Máy lạnh phòng A101 không làm lạnh và phát ra tiếng kêu lớn.",
  "missing_information": [],
  "confidence": 0.90
}
```

### 6. Category
- ELECTRICITY
- PLUMBING
- INTERNET
- AIR_CONDITIONER
- FURNITURE
- CLEANING
- OTHER

### 7. Priority
- LOW
- MEDIUM
- HIGH

### 8. Error Handling
Nếu AI không thể phân loại:
```json
{
  "category": "OTHER",
  "priority": "MEDIUM",
  "summary": "...",
  "missing_information": ["Vui lòng mô tả rõ thiết bị đang gặp vấn đề."]
}
```

Nếu AI service không hoạt động, hệ thống vẫn cho phép lưu yêu cầu với trạng thái chưa phân loại.

## Feature F-02: AI Assistant

### Objective
Cho phép người dùng đặt câu hỏi tự nhiên về các chức năng và thông tin mà họ được phép truy cập.

### Example
User:
> Tôi còn phải thanh toán bao nhiêu tiền tháng này?

AI:
> Hệ thống có thể trả lời dựa trên dữ liệu thanh toán được backend cung cấp cho tài khoản của bạn.

### Rules
- AI không được truy cập trực tiếp database nếu không thông qua cơ chế backend được kiểm soát.
- Không tiết lộ dữ liệu của người dùng khác.
- Không tự xác nhận giao dịch tài chính.
- Không bịa thông tin khi dữ liệu không tồn tại.

## Feature F-03: Maintenance Request Management

### Main Flow
```text
Create Request
    ↓
AI Classification
    ↓
Save Request
    ↓
Notify Landlord
    ↓
Processing
    ↓
Completed
```

### Acceptance Criteria
- Request được lưu thành công.
- Có request ID.
- Có category/priority hoặc trạng thái chưa phân loại.
- Người thuê xem được request.
- Chủ nhà cập nhật được trạng thái.
