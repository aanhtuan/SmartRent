# 3.2 Product Requirements Document (PRD) – SmartRent

## 1. Product Overview
SmartRent là hệ thống quản lý nhà cho thuê tích hợp AI, hỗ trợ chủ nhà/quản lý và người thuê trong các hoạt động vận hành hằng ngày.

## 2. Product Goals
- Quản lý dữ liệu nhà cho thuê tập trung.
- Đơn giản hóa nghiệp vụ quản lý.
- Minh bạch trạng thái yêu cầu sửa chữa.
- Cải thiện trải nghiệm người thuê.
- Ứng dụng AI vào các tác vụ có tính lặp lại hoặc cần phân loại thông tin.

## 3. User Roles

| Role | Quyền chính |
|---|---|
| Admin/Landlord | Quản lý toàn bộ dữ liệu |
| Tenant | Xem dữ liệu cá nhân và gửi yêu cầu |
| AI Assistant | Hỗ trợ trả lời/phân tích theo dữ liệu được phép |

## 4. Functional Requirements

### FR-01 – Authentication
Người dùng đăng nhập và được phân quyền theo vai trò.

### FR-02 – Room Management
Chủ nhà có thể thêm, sửa, xóa và xem trạng thái phòng.

### FR-03 – Tenant Management
Chủ nhà quản lý thông tin người thuê và phòng đang thuê.

### FR-04 – Contract Management
Lưu và tra cứu thông tin hợp đồng.

### FR-05 – Rent Management
Theo dõi tiền thuê và trạng thái thanh toán.

### FR-06 – Maintenance Request
Người thuê tạo yêu cầu sửa chữa; chủ nhà xem, cập nhật và hoàn tất yêu cầu.

### FR-07 – Notification
Hệ thống gửi thông báo liên quan đến thanh toán, hợp đồng và xử lý yêu cầu.

### FR-08 – AI Assistant
Người dùng có thể đặt câu hỏi bằng ngôn ngữ tự nhiên.

### FR-09 – AI Request Classification
AI phân loại yêu cầu sửa chữa và đề xuất mức độ ưu tiên.

## 5. Non-functional Requirements
- Bảo mật thông tin người dùng.
- Phân quyền truy cập dữ liệu.
- Giao diện dễ sử dụng.
- API có cấu trúc rõ ràng.
- Có khả năng mở rộng.
- AI phải có cơ chế xử lý trường hợp không đủ thông tin.
- Không để AI tự ý thực hiện thao tác quan trọng nếu chưa được hệ thống cho phép.

## 6. AI Requirements
AI Assistant cần:
- Hiểu câu hỏi tiếng Việt tự nhiên.
- Trả lời dựa trên ngữ cảnh SmartRent.
- Không bịa dữ liệu khi hệ thống không cung cấp thông tin.
- Yêu cầu người dùng bổ sung thông tin khi cần.

AI Classification cần:
- Nhận nội dung yêu cầu.
- Xác định category.
- Xác định priority.
- Sinh summary.
- Trả kết quả có cấu trúc.

## 7. MVP Scope
### In Scope
Quản lý phòng, người thuê, hợp đồng, tiền thuê, yêu cầu sửa chữa, thông báo và AI.

### Out of Scope
- Tích hợp ngân hàng thực tế.
- Hệ thống kế toán chuyên nghiệp.
- Nhận diện giấy tờ pháp lý tự động.
- IoT điều khiển thiết bị trong phòng.

## 8. Assumptions
- Người dùng có tài khoản hợp lệ.
- Dữ liệu phòng và người thuê được lưu trong database.
- AI chỉ truy cập dữ liệu mà backend cho phép.
