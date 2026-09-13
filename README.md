# SmartRent – Hệ thống quản lý nhà cho thuê tích hợp AI

## 1. Giới thiệu

SmartRent là hệ thống hỗ trợ chủ nhà/người quản lý vận hành nhà cho thuê và chăm sóc người thuê. Hệ thống tập trung các nghiệp vụ quản lý phòng, người thuê, hợp đồng, tiền thuê và yêu cầu sửa chữa, đồng thời tích hợp AI để hỗ trợ giao tiếp, phân loại yêu cầu và khai thác thông tin.

## 2. Mục tiêu

- Tập trung dữ liệu quản lý nhà cho thuê.
- Giảm các thao tác quản lý thủ công.
- Hỗ trợ người thuê gửi và theo dõi yêu cầu.
- Ứng dụng AI vào phân tích, phân loại và hỗ trợ vận hành.
- Xây dựng sản phẩm theo quy trình Product Discovery → PRD → Requirement Analysis → User Stories → Feature Specification.

## 3. Đối tượng sử dụng

- Chủ nhà / quản lý.
- Người thuê.
- AI Assistant.

## 4. Phạm vi MVP

1. Đăng nhập và phân quyền.
2. Quản lý phòng.
3. Quản lý người thuê.
4. Quản lý hợp đồng.
5. Theo dõi tiền thuê.
6. Quản lý yêu cầu sửa chữa.
7. Thông báo.
8. AI Assistant.
9. AI phân loại yêu cầu sửa chữa.

## 5. Cấu trúc repository

```text
SmartRent/
├── backend/
├── database/
├── demo/
│   └── chapter-03/
│       └── README.md
├── docs/
│   └── chapter-03-requirement-analysis/
│       ├── 01-product-discovery.md
│       ├── 02-PRD.md
│       ├── 03-requirement-analysis.md
│       ├── 04-user-stories.md
│       └── 05-feature-specification.md
├── frontend/
├── prompts/
│   └── chapter-03/
│       ├── product-discovery-prompts.md
│       ├── prd-prompts.md
│       ├── requirement-prompts.md
│       └── feature-prompts.md
└── README.md
```

## 6. Project Roadmap

- [x] Chapter 3 – Requirement & Product Analysis
- [ ] Chapter 4 – Product Design
- [ ] Chapter 5 – Software Architecture
- [ ] Chapter 6 – AI Programming
- [ ] Chapter 7 – Code Review & Refactoring
- [ ] Chapter 8 – Testing
- [ ] Chapter 9 – Technical Documentation
- [ ] Final Demo

## 7. AI Development Approach

SmartRent sử dụng AI như một công cụ hỗ trợ trong quá trình phát triển phần mềm, không thay thế hoàn toàn quyết định của người phát triển.

Quy trình làm việc:

1. Define context and requirements
2. Write prompt
3. Generate output with AI
4. Human review
5. Refine and validate
6. Apply to project

AI được sử dụng trong các giai đoạn phù hợp của quá trình phát triển:

- Product Discovery
- PRD generation
- Requirement Analysis
- User Story generation
- Feature Specification
- UI/UX Design
- Architecture Design
- Code Generation
- Code Review
- Testing
- Technical Documentation

## 8. Nguyên tắc sử dụng AI

- Kết quả từ AI phải được người phát triển kiểm tra trước khi sử dụng.
- Không đưa trực tiếp output của AI vào hệ thống nếu chưa được xác nhận.
- Các quyết định quan trọng về nghiệp vụ, bảo mật và kiến trúc phải được người phát triển xem xét.
- AI chỉ được truy cập dữ liệu và thực hiện thao tác trong phạm vi được hệ thống cho phép.
- Khi AI không đủ thông tin, hệ thống cần yêu cầu bổ sung hoặc sử dụng phương án xử lý dự phòng phù hợp.
