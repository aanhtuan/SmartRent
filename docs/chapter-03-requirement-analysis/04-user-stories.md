# 3.4 User Stories & Acceptance Criteria – SmartRent

## US-01 – Đăng nhập
**As a** user, **I want** to log in, **so that** I can access features according to my role.

### Acceptance Criteria
- AC01: Người dùng nhập đúng thông tin thì đăng nhập thành công.
- AC02: Sai thông tin thì hệ thống hiển thị lỗi.
- AC03: Người dùng được chuyển tới giao diện phù hợp với role.

## US-02 – Quản lý phòng
**As a** landlord, **I want** to manage rooms, **so that** I can track my rental properties.

### Acceptance Criteria
- AC01: Có thể thêm phòng.
- AC02: Có thể sửa thông tin phòng.
- AC03: Có thể xem trạng thái phòng.
- AC04: Không cho phép dữ liệu phòng không hợp lệ.

## US-03 – Quản lý người thuê
**As a** landlord, **I want** to manage tenants, **so that** I know who is renting each room.

### Acceptance Criteria
- AC01: Có thể thêm người thuê.
- AC02: Có thể gán người thuê vào phòng.
- AC03: Có thể xem thông tin người thuê.
- AC04: Có thể cập nhật thông tin.

## US-04 – Theo dõi tiền thuê
**As a** tenant, **I want** to view my rent status, **so that** I know what I need to pay.

### Acceptance Criteria
- AC01: Hiển thị kỳ thanh toán.
- AC02: Hiển thị số tiền.
- AC03: Hiển thị trạng thái đã/chưa thanh toán.

## US-05 – Gửi yêu cầu sửa chữa
**As a** tenant, **I want** to submit a maintenance request, **so that** the landlord can resolve my problem.

### Acceptance Criteria
- AC01: Nhập được mô tả sự cố.
- AC02: Có thể chọn category hoặc để AI phân loại.
- AC03: Có thể đính kèm hình ảnh nếu hệ thống hỗ trợ.
- AC04: Sau khi gửi, request có mã định danh.
- AC05: Trạng thái ban đầu là PENDING.

## US-06 – Theo dõi yêu cầu
**As a** tenant, **I want** to track my request status, **so that** I know whether it is being handled.

### Acceptance Criteria
- AC01: Xem được danh sách yêu cầu của mình.
- AC02: Mỗi yêu cầu có trạng thái.
- AC03: Trạng thái được cập nhật khi chủ nhà xử lý.

## US-07 – AI Assistant
**As a** user, **I want** to ask AI questions, **so that** I can receive quick support.

### Acceptance Criteria
- AC01: Có ô nhập câu hỏi.
- AC02: AI trả lời theo ngữ cảnh SmartRent.
- AC03: Nếu thiếu dữ liệu, AI không tự bịa thông tin.
- AC04: Có thể xử lý câu hỏi tiếng Việt.

## US-08 – AI phân loại yêu cầu
**As a** landlord, **I want** AI to classify maintenance requests, **so that** I can prioritize work.

### Acceptance Criteria
- AC01: AI nhận nội dung yêu cầu.
- AC02: AI trả về category.
- AC03: AI trả về priority.
- AC04: AI tạo summary.
- AC05: Nếu không chắc chắn, AI trả về mức confidence thấp hoặc yêu cầu bổ sung thông tin.

## US-09 – Thông báo
**As a** user, **I want** to receive notifications, **so that** I do not miss important updates.

### Acceptance Criteria
- AC01: Có thông báo khi request được cập nhật.
- AC02: Có thông báo cho sự kiện thanh toán/hợp đồng quan trọng.
