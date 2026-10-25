# SmartRent Frontend — Giao diện Quản lý Thuê trọ Thông minh

Ứng dụng web React 18 + TypeScript + Vite + Tailwind CSS dành cho hệ thống quản lý thuê trọ thông minh SmartRent, tích hợp trực tiếp với backend Spring Boot 3.x và mô hình AI Gemini qua ranh giới tích hợp an toàn.

---

## 1. Kiến trúc & Công nghệ

- **Framework**: React 18 + TypeScript (Strict Mode).
- **Công cụ đóng gói**: Vite 6.
- **Styling**: Tailwind CSS với hệ màu và tokens thiết kế tùy biến riêng cho SmartRent.
- **Quản lý trạng thái Server**: TanStack Query (React Query v5) với cơ chế xóa bộ nhớ đệm an toàn khi đăng xuất.
- **Điều hướng & Phân quyền**: React Router v7 với `ProtectedRoute` và `RoleGuard` kiểm soát quyền `LANDLORD` và `TENANT`.
- **Form & Xác thực**: React Hook Form kết hợp Zod.
- **Icons**: Lucide React.
- **Kiểm thử**: Vitest, React Testing Library, Playwright.

---

## 2. Hệ màu & Phong cách thiết kế

Phong cách chủ đạo: **Soft Minimalism + Modern SaaS + Warm Professionalism**.

- Nền ứng dụng: `#F7F9F7`
- Bề mặt thẻ / modal: `#FFFFFF`
- Màu chủ đạo (Primary): `#26766D` (Hover: `#1C625A`, Nền mềm: `#DDEFE9`)
- Điểm nhấn ấm (Warm Accent): `#D5AA77`
- Văn bản chính: `#243431`, phụ: `#71807B`, đường viền: `#E5ECE8`
- Phông chữ mặc định: **Be Vietnam Pro** với hỗ trợ tiếng Việt hoàn chỉnh.

---

## 3. Bảo mật & Cơ chế phiên đăng nhập

1. **JWT Lưu trữ trong bộ nhớ (In-memory Only)**:
   - Token JWT tuyệt đối **không** lưu trong `localStorage` hoặc `sessionStorage` để ngăn chặn tấn công XSS trích xuất mã token.
   - Khi tải lại trang hoặc hết hạn phiên 30 phút, ứng dụng chủ động hiển thị hộp thoại đăng nhập lại an toàn.
2. **Phân quyền đa tầng**:
   - `LANDLORD`: Xem và quản lý bất động sản, phòng trọ, hồ sơ người thuê, hợp đồng, hóa đơn thu tiền, tiếp nhận và chuyển trạng thái sửa chữa.
   - `TENANT`: Xem thông tin phòng đang thuê, hợp đồng cá nhân, hóa đơn cần đóng, báo sự cố với AI preview và hỏi đáp Trợ lý AI.
3. **Ranh giới AI**:
   - Trình duyệt **không** chứa Gemini API key và **không** gọi trực tiếp Google AI.
   - Mọi tương tác AI (xem trước phân loại sự cố và Trợ lý AI) đều đi qua API của backend sau khi đã xác thực và lọc bớt dữ liệu nhạy cảm (data minimization).

---

## 4. Danh mục 33 Endpoint tích hợp

Ứng dụng tích hợp đầy đủ 33 phương thức API chuẩn của backend:

| Phân hệ | Đường dẫn | Phương thức | Mô tả |
|---|---|---|---|
| **Identity** | `/api/auth/login` | POST | Đăng nhập nhận JWT RS256 |
| | `/api/users/me` | GET | Lấy thông tin tài khoản hiện tại |
| **Properties** | `/api/properties` | GET / POST | Danh sách & tạo khu nhà trọ |
| | `/api/properties/{id}` | GET / PATCH | Chi tiết & cập nhật/khóa nhà trọ |
| **Rooms** | `/api/properties/{id}/rooms` | GET / POST | Danh sách phòng theo nhà trọ & tạo phòng |
| | `/api/rooms/{id}` | GET / PATCH / DELETE | Chi tiết, sửa mã & khóa phòng |
| **Tenants** | `/api/tenant-profiles` | GET / POST | Danh sách hồ sơ khách & tạo hồ sơ |
| | `/api/tenant-profiles/{id}` | GET / PATCH | Chi tiết & cập nhật thông tin liên hệ |
| **Contracts** | `/api/contracts` | GET / POST | Danh sách & lập hợp đồng thuê mới |
| | `/api/contracts/{id}` | GET / PATCH | Chi tiết & chấm dứt hợp đồng |
| **Payments** | `/api/payments` | GET / POST | Danh sách & lập hóa đơn thu phí |
| | `/api/payments/{id}` | GET / PATCH | Chi tiết & xác nhận đã thu (PAID) |
| **Maintenance** | `/api/maintenance-requests` | GET / POST | Danh sách & gửi báo hỏng (kèm key & token) |
| | `/api/maintenance-requests/preview` | POST | AI phân tích xem trước sự cố |
| | `/api/maintenance-requests/{id}` | GET | Chi tiết sự cố sửa chữa |
| | `/api/maintenance-requests/{id}/status` | PATCH | Chuyển trạng thái (tiếp nhận/hoàn thành/hủy) |
| | `/api/maintenance-requests/{id}/classify` | POST | Phân loại lại bằng AI |
| **Notifications**| `/api/notifications` | GET | Danh sách thông báo |
| | `/api/notifications/{id}` | GET / PATCH | Chi tiết & đánh dấu đã đọc |
| **Assistant** | `/api/ai-assistant/messages` | POST | Đặt câu hỏi cho Trợ lý AI (chỉ đọc) |

---

## 5. Hướng dẫn khởi chạy & Phát triển

### Yêu cầu tiên quyết
- Node.js 22+
- npm 10+
- Backend Spring Boot đang chạy ở cổng 8080 (hoặc qua Vite proxy).

### Cài đặt và chạy
```sh
cd frontend
npm install

# Chạy môi trường phát triển (http://localhost:5173)
npm run dev

# Kiểm tra kiểu dữ liệu TypeScript (Strict mode)
npm run typecheck

# Kiểm tra chất lượng mã nguồn với ESLint
npm run lint

# Chạy bộ kiểm thử đơn vị & thành phần với Vitest
npm run test:run

# Đóng gói ứng dụng cho môi trường sản xuất
npm run build
```

---

## 6. Môi trường & Biến cấu hình

Tạo tệp `.env` trong thư mục `frontend/` (hoặc cấu hình tại thời điểm build):

```env
# URL máy chủ backend API (mặc định proxy qua Vite tới 127.0.0.1:8080)
VITE_API_BASE_URL=http://localhost:8080
```
