# SmartRent Chapter 6 – AI Programming Prompts

## Cách sử dụng

Thay phần trong ngoặc vuông bằng context đã được phép chia sẻ. Cung cấp file/contract liên quan, không gửi secret, token, production data hoặc PII thật. Luôn yêu cầu AI nêu giả định và giới hạn; chỉ chấp nhận diff sau khi review và chạy kiểm tra phù hợp.

## 1. Code Generation

```text
Bạn là coding partner cho repository SmartRent. Hãy triển khai [behavior nhỏ, có thể kiểm chứng] theo acceptance criteria sau: [criteria].

Context đã xác minh:
- Các file/API/type liên quan: [paths và contract]
- Pattern đang dùng: [mô tả hoặc ví dụ từ repository]
- Test hiện có và lệnh chạy: [test/lệnh]

Constraints:
- Chỉ thay đổi [file/module scope]; giữ nguyên public contract trừ khi được yêu cầu rõ.
- Backend sở hữu authorization và business rules. AI/provider không truy cập DB hoặc tự đổi business state.
- Không thêm dependency, endpoint, schema field hoặc requirement chưa có căn cứ.
- Bảo toàn error handling/fallback hiện có; không đưa secret hoặc dữ liệu thật vào code/test.

Trước khi code, tóm tắt luồng hiện tại, file dự kiến sửa và giả định/câu hỏi còn thiếu. Sau khi triển khai, liệt kê behavior đã đổi, test đã chạy và rủi ro chưa xác minh.
```

## 2. Code Completion

```text
Hãy đề xuất phần tiếp theo cho đoạn code dưới đây, chỉ trong phạm vi [function/block]. Tuân theo style và abstraction hiện có trong context.

Code/context: [đoạn code tối thiểu, đã loại bỏ dữ liệu nhạy cảm]
Ý định và contract: [mô tả]
Edge cases bắt buộc: [empty/null/error/authorization/fallback phù hợp]

Đưa ra đoạn hoàn chỉnh cùng giải thích ngắn về từng nhánh. Không tự thêm dependency, đổi API, truy cập database ngoài repository boundary hoặc suy diễn business rule. Nếu contract chưa đủ, hỏi lại thay vì đoán.
```

## 3. Debugging

```text
Hãy hỗ trợ chẩn đoán bug dựa trên bằng chứng, chưa sửa code ngay.

Expected behavior: [hành vi mong muốn]
Actual behavior: [hành vi quan sát được]
Reproduction: [các bước tối thiểu]
Error/test output đã được làm sạch: [output]
Relevant code/test: [paths hoặc đoạn code]

Hãy tách facts khỏi assumptions, đưa tối đa ba giả thuyết xếp theo mức độ được bằng chứng hỗ trợ, và đề xuất phép kiểm tra nhỏ nhất để phân biệt chúng. Không đề xuất workaround làm yếu authorization, validation hoặc fallback. Sau khi có kết quả kiểm tra, mới đề xuất root-cause fix và regression test nhỏ nhất.
```

## 4. AI Pair Programming

```text
Đóng vai coding partner cho task [task]. Chưa sửa file ở lượt đầu.

Hãy đọc context sau: [requirements, code, tests, architecture]
Mục tiêu/acceptance criteria: [criteria]
Phạm vi cho phép: [files/modules]
Không được: [constraints]

Trước tiên hãy tóm tắt hành vi hiện tại, đề xuất các bước nhỏ, nêu rủi ro/giả định và chờ tôi xác nhận hướng. Sau mỗi bước, báo file/diff, lý do, test chạy và phần còn thiếu. Nếu phát hiện yêu cầu mâu thuẫn với code hoặc tài liệu, dừng và nêu bằng chứng.
```

## 5. Bài thực hành – Maintenance Request

```text
Hỗ trợ bài thực hành coding SmartRent cho Maintenance Request. Dựa trên implementation và contract thật trong repository; nếu không tìm thấy, hãy nêu rõ thay vì tạo endpoint/framework/schema giả định.

Yêu cầu kiểm tra: tạo request giữ original description và status PENDING; AI classification là metadata không đáng tin cho đến khi backend validate; provider failure/invalid output phải có fallback thủ công; authorization do backend quyết định.

Làm theo lượt:
1. Xác định file và behavior hiện có, acceptance criteria, test và lệnh chạy.
2. Đề xuất test cases trước implementation.
3. Sau khi được xác nhận, thực hiện diff tối thiểu trong scope đã thống nhất.
4. Phân tích failure được cung cấp, đề xuất root cause và regression test.
5. Báo kết quả test thực tế và mọi rủi ro chưa xác minh.

Không gọi AI provider thật, không dùng PII/secret, không để AI ghi DB hoặc đổi trạng thái nghiệp vụ, không mở rộng scope ngoài yêu cầu.
```