# 4.4 AI Design Review – Maintenance Request

## Phạm vi

Đánh giá User Flow, Wireframe và Prototype của Maintenance Request theo yêu cầu Chapter 3. AI đưa finding; Human Reviewer quyết định cuối cùng.

## Findings và Human Review

| ID | Finding | Mức độ | Khuyến nghị AI | Quyết định | Hành động cuối cùng |
|---|---|---|---|---|---|
| DR-01 | AI có thể không phản hồi khi gửi yêu cầu. | High | Lưu yêu cầu không phân loại để xử lý thủ công. | Accepted | Dùng trạng thái `PENDING` và WF-08. |
| DR-02 | Mô tả ngắn có thể dẫn tới phân loại sai. | High | Yêu cầu vị trí và triệu chứng. | Accepted | Dùng WF-07, gửi lại thông tin cho AI. |
| DR-03 | Người dùng có thể hiểu AI tự ra quyết định. | High | Cho phép kiểm tra kết quả; không để AI đổi trạng thái. | Accepted | Có màn hình xác nhận; backend kiểm soát workflow. |
| DR-04 | Tóm tắt AI có thể làm mất ngữ cảnh. | Medium | Luôn hiển thị mô tả gốc. | Accepted | Thêm mô tả gốc ở Request Detail. |
| DR-05 | Confidence có thể bị hiểu là quyết định tự động. | Medium | Gắn nhãn là thông tin hỗ trợ. | Accepted with caution | Không dùng confidence làm điều kiện duy nhất cho hành động quan trọng. |

## Quyết định thiết kế cuối cùng

- Giữ luồng người thuê tạo/theo dõi và chủ nhà xử lý yêu cầu.
- Duy trì `PENDING`, `PROCESSING`, `COMPLETED`.
- Chỉ chủ nhà được phân quyền mới chuyển trạng thái.
- Thiếu thông tin thì yêu cầu bổ sung; AI lỗi thì vẫn lưu và xử lý thủ công.
- AI chỉ hỗ trợ phân loại/tóm tắt, không trực tiếp thực hiện hành động nghiệp vụ.

## Traceability

| Nhu cầu | Bằng chứng |
|---|---|
| Người thuê gửi, xem yêu cầu | User Flow; Wireframe WF-02 đến WF-05; Prototype bước 1–4. |
| Chủ nhà xử lý yêu cầu | Wireframe WF-05; Prototype bước 5–6. |
| AI có kiểm soát | Wireframe WF-04; finding DR-03. |
| Xử lý ngoại lệ AI | Wireframe WF-07, WF-08; finding DR-01, DR-02. |
