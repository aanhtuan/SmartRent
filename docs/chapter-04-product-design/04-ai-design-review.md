# 4.4 AI Design Review – SmartRent

## Mục tiêu
Dùng AI để review thiết kế Chapter 4 trước khi chuyển sang Software Architecture.

## Review Areas
- User experience
- Completeness
- Consistency
- Error handling
- AI transparency
- Security and authorization
- Traceability với Chapter 3

## AI Review Prompt
```text
Bạn là Senior Product Designer và UX Reviewer.

Hãy review thiết kế Chapter 4 của SmartRent dựa trên:
- PRD
- Requirement Analysis
- User Stories
- Feature Specification
- User Flow
- Wireframe
- Prototype

Kiểm tra:
1. Completeness
2. User experience
3. Consistency
4. Error handling
5. Missing information flow
6. AI unavailable fallback
7. AI transparency
8. Backend authorization
9. Status transition
10. Traceability với requirements

Với mỗi vấn đề:
- Nêu vấn đề
- Mức độ: High / Medium / Low
- Giải thích
- Đề xuất cải thiện

Không tự quyết định thay đổi thiết kế. Recommendation phải được Human Reviewer kiểm tra.
```

## Review Checklist
| Area | Question |
|---|---|
| User Flow | Main flow có đầy đủ không? |
| User Flow | Missing information có được xử lý không? |
| User Flow | AI unavailable có fallback không? |
| Wireframe | Primary actions có rõ không? |
| Wireframe | AI output có dễ hiểu không? |
| Prototype | Main states có mô phỏng được không? |
| UX | Error message có hướng dẫn không? |
| AI | AI có bị thiết kế như actor có quyền tự quyết định không? |
| Security | Authorization có do backend kiểm soát không? |
| Consistency | Status có thống nhất với Chapter 3 không? |
| Traceability | Thiết kế có đáp ứng requirements không? |

## Sample Review Findings

### Finding 01 – AI failure fallback
- **Impact:** High
- **Decision:** Accepted
- **Action:** Giữ flow lưu request ở `PENDING` khi AI unavailable.

### Finding 02 – Missing information
- **Impact:** High
- **Decision:** Accepted
- **Action:** Yêu cầu bổ sung thông tin thay vì AI tự suy đoán.

### Finding 03 – AI authority
- **Impact:** High
- **Decision:** Accepted
- **Action:** AI chỉ hỗ trợ classification; status transition do application workflow kiểm soát.

### Finding 04 – Original description
- **Impact:** Medium
- **Decision:** Accepted
- **Action:** Luôn hiển thị original description trong Request Detail.

### Finding 05 – Confidence
- **Impact:** Medium
- **Decision:** Accepted with caution
- **Action:** Confidence là thông tin hỗ trợ, không dùng riêng nó để tự động thực hiện critical action.

## Human Review
Sinh viên kiểm tra từng finding, đối chiếu Chapter 3 và quyết định Accepted / Rejected / Modified.

## Final Design Decision
Giữ:
- Main maintenance flow.
- Missing-information flow.
- AI-unavailable fallback.
- Tenant request tracking.
- Landlord processing.
- Clear status transition.
- Backend-controlled authorization.
- AI-assisted workflow.

Chapter 4 là đầu vào cho Chapter 5 – Software Architecture.
