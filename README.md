# SmartRent – AI-Integrated Rental Property Management System

## 1. Introduction

SmartRent is a system that helps landlords and property managers operate rental properties and support tenants. It centralizes room, tenant, contract, rent, and maintenance-request management while integrating AI to support communication, request classification, and information retrieval.

## 2. Objectives

- Centralize rental property management data.
- Reduce manual administrative tasks.
- Enable tenants to submit and track requests.
- Apply AI to analysis, classification, and operational support.
- Develop the product through the Product Discovery → PRD → Requirement Analysis → User Stories → Feature Specification process.

## 3. Target Users

- Landlords / property managers.
- Tenants.
- AI Assistant.

## 4. MVP Scope

1. Authentication and authorization.
2. Room management.
3. Tenant management.
4. Contract management.
5. Rent tracking.
6. Maintenance request management.
7. Notifications.
8. AI Assistant.
9. AI-based maintenance request classification.

## 5. Repository Structure

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

SmartRent uses AI as a supporting tool throughout software development; it does not replace developer decision-making.

Workflow:

1. Define context and requirements
2. Write prompt
3. Generate output with AI
4. Human review
5. Refine and validate
6. Apply to project

AI is used at appropriate stages of the development lifecycle:

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

## 8. Principles for Using AI

- Developers must review AI-generated results before using them.
- AI output must not be introduced directly into the system without validation.
- Developers must review critical business, security, and architectural decisions.
- AI may access data and perform actions only within the scope authorized by the system.
- When AI lacks sufficient information, the system must request additional details or apply an appropriate fallback strategy.
