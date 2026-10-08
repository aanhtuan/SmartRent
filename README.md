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
├── AGENTS.md                         # shared agent rules (local working tree)
├── .agents/skills/                   # installed and repository-local skills
├── .gemini/settings.json             # workspace agent context
├── docs/
│   ├── project-roadmap.md            # start here
│   ├── sprint-0-decisions.md          # working baseline and review gates
│   ├── implementation-readiness.md
│   ├── chapter-03-requirement-analysis/
│   ├── chapter-04-product-design/
│   ├── chapter-05-software-architecture/
│   ├── chapter-06-ai-programming/     # implementation backlog, no code yet
│   ├── chapter-07-code-review-refactoring/
│   ├── chapter-08-software-testing/
│   ├── chapter-09-technical-documentation/
│   └── ai-evidence/
├── design/                           # API, architecture, UML, schema and UX
├── prompts/chapter-03..05/            # versioned prompt templates
└── demo/chapter-03..05/               # design/demo evidence specifications
```

Backend/frontend/database implementations are planned; no runnable application manifests or migrations exist yet. Empty placeholder directories are not completed features.

## 6. Project Roadmap

| Stage | Current status |
|---|---|
| Chapters 3–5 | Documents exist and normalized; new policy defaults await named review gates. |
| Agent environment | Local rules/skills exist; runtime CLI activation and application execution are separate checks. |
| Chapter 6 | Dependency-ordered backlog; implementation not started. |
| Chapters 7–9 | Review/test/documentation plans; execution evidence accumulates per task. |
| Final demo/deployment | Not implemented or verified. |

Start with [end-to-end roadmap](docs/project-roadmap.md), [decisions](docs/sprint-0-decisions.md), [readiness](docs/implementation-readiness.md) and [first coding tasks](docs/chapter-06-ai-programming/implementation-backlog.md). Follow [agent workflow](docs/agent-workflow.md). No task is complete merely because a document exists.

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
