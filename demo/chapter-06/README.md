# Bài thực hành 6 – Demo Lập trình cùng AI

## Mục tiêu

Walkthrough dùng AI để hỗ trợ một thay đổi nhỏ trong luồng Maintenance Request, từ hiểu code đến kiểm tra và review diff. Demo này là hướng dẫn quy trình; không giả định repository đã có implementation backend cụ thể và không thay đổi sản phẩm bằng provider AI thật.

## Chuẩn bị

- Mở repository và xác định code, API contract, test cùng architecture artefact thực sự liên quan.
- Chọn một acceptance criterion có phạm vi hẹp. Ví dụ: khi classifier thất bại, request vẫn giữ mô tả gốc và có thể được xử lý thủ công ở trạng thái `PENDING`.
- Dùng sandbox/test environment; loại bỏ secret, token và dữ liệu cá nhân khỏi prompt/log.
- Mở [prompt thực hành](../../prompts/chapter-06/ai-programming-prompts.md) và tài liệu [Bài thực hành 6](../../docs/chapter-06-ai-programming/06-practical-exercise.md).

## Walkthrough

| Chặng | Việc thực hiện | Bằng chứng cần kiểm tra |
|---|---|---|
| 1. Định vị | Hỏi AI tóm tắt code path hiện tại, contract và test; yêu cầu xác định file scope, chưa sửa code. | Tên file/symbol tồn tại; assumptions được đánh dấu. |
| 2. Lập test | Xác định case thành công, provider timeout/invalid response và authorization; chọn case gắn trực tiếp với task. | Test mô tả behavior, không phụ thuộc provider thật. |
| 3. Sinh thay đổi | Sau khi duyệt kế hoạch, yêu cầu AI tạo diff nhỏ theo pattern hiện có. | Không đổi scope/API tùy tiện; original description và backend validation được giữ. |
| 4. Debug | Nếu test fail, cung cấp output đã làm sạch; yêu cầu giả thuyết và phép thử phân biệt trước khi sửa. | Root cause có bằng chứng; regression test khóa lỗi. |
| 5. Review | Yêu cầu AI giải thích diff/edge cases, rồi review độc lập. | Không có DB access cho AI, bypass authorization hay transition do AI điều khiển. |
| 6. Verify | Chạy test liên quan, sau đó lint/typecheck/build theo dự án. | Ghi đúng lệnh và kết quả; nêu gate chưa chạy được. |

## Luồng minh họa

```text
Maintenance Request task
  → đọc requirement, implementation, tests
  → AI phân tích scope và đề xuất test
  → developer duyệt kế hoạch
  → AI hỗ trợ diff nhỏ
  → developer review business/security rules
  → test và quality gates
  → chấp nhận, sửa tiếp hoặc loại bỏ diff
```

## Prompt demo

```text
Hãy phân tích luồng Maintenance Request hiện có trong repository và xác định cách bảo đảm request vẫn có thể xử lý thủ công khi AI classifier timeout hoặc trả output không hợp lệ.

Trước khi sửa code: nêu file/symbol liên quan, contract hiện tại, test đang có, acceptance criteria áp dụng và các giả định. Đề xuất test nhỏ nhất cho fallback; không tự tạo API/schema/framework.

Sau khi tôi xác nhận, chỉ thay đổi phần cần thiết. Giữ original description, backend authorization/validation và status PENDING theo contract. Không gọi provider thật, không để AI truy cập DB hoặc thay đổi business state. Cuối cùng báo diff, test/lệnh đã chạy và phần chưa xác minh.
```

## Completion check

- [ ] Code path/contract được xác định từ repository, không bịa.
- [ ] Có test cho case task và ít nhất một failure/fallback case phù hợp.
- [ ] Diff nằm trong scope đã thống nhất và người học hiểu toàn bộ thay đổi.
- [ ] Authorization, business state và persistence vẫn thuộc backend.
- [ ] Kết quả kiểm tra được ghi trung thực; không chạy được thì nêu lý do.