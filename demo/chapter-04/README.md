# Chapter 4 Demo – AI in Product Design

## Mục tiêu
Chứng minh việc sử dụng AI trong Product Design của SmartRent.

```text
Prompt
  ↓
AI Output
  ↓
Human Review
  ↓
Refinement
  ↓
Final Design
```

## Demo 1 – User Flow
Prompt: `../../prompts/chapter-04/user-flow-prompts.md`

Input: Chapter 3 PRD, Requirement Analysis, User Stories, Feature Specification.

Output: [User Flow](../../design/user-flows/smartrent-maintenance-flow.md) cho Maintenance Request.

Human Review:
- Actors
- Main flow
- Missing information
- AI unavailable
- Status transitions

## Demo 2 – Wireframe
Prompt: `../../prompts/chapter-04/wireframe-prompts.md`

Output: [Low-fidelity wireframe specification](../../design/wireframes/maintenance-request-wireframe.md).

Human Review:
- Navigation
- Primary actions
- Error states
- AI result presentation

## Demo 3 – Prototype
Prompt: `../../prompts/chapter-04/prototype-prompts.md`

Output: [Prototype interaction specification](../../design/prototypes/maintenance-request-prototype.md).

Human Review:
- Main flow
- Missing-information state
- AI-unavailable state
- Status transition

## Demo 4 – AI Design Review
Prompt: `../../prompts/chapter-04/design-review-prompts.md`

Output: [Design review findings](../../design/design-reviews/maintenance-request-ai-review.md).

Human Review:
- Xác nhận từng finding.
- Đối chiếu Chapter 3.
- Accepted / Rejected / Modified.
- Cập nhật final design nếu cần.

## Evidence
Mỗi demo nên lưu:
- Prompt
- AI Output
- Human Review
- Final Result
- Screenshot nếu có

## Deliverables
- [User Flow](../../design/user-flows/smartrent-maintenance-flow.md)
- [Wireframe specification](../../design/wireframes/maintenance-request-wireframe.md)
- [Prototype specification](../../design/prototypes/maintenance-request-prototype.md)
- [AI Design Review](../../design/design-reviews/maintenance-request-ai-review.md)
- Prompt collection
- Demo documentation

## Transition to Chapter 5
Chapter 4 là đầu vào cho Software Architecture: components, API boundaries, database entities, backend responsibilities và AI service integration.
