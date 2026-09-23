# Practice 3 – AI Demo for Product and Requirement Analysis

## 1. Objective

Demonstrate the use of AI prompts in Chapter 3 activities and how developers review and refine AI output before incorporating it into SmartRent documentation.

## 2. Demo Process

Each demo follows this process:

```text
Context
   ↓
Prompt
   ↓
AI Output
   ↓
Human Review
   ↓
Refinement
   ↓
Final Result
```

## 3. Demo 1 – Product Discovery

Use:

`../../prompts/chapter-03/product-discovery-prompts.md`

### Primary Input

> Perform Product Discovery analysis for SmartRent.

### Expected Results

- Target users
- Pain points
- Product opportunities
- AI opportunities
- MVP features

### Human Review

Verify that the output fits the SmartRent project scope, remove oversized features, and define a feasible MVP.

## 4. Demo 2 – PRD

Use:

`../../prompts/chapter-03/prd-prompts.md`

### Expected Results

- Product overview
- Product goals
- Target users
- User roles
- Functional requirements
- Non-functional requirements
- AI requirements
- MVP scope
- Out of scope
- Assumptions

### Human Review

Review each requirement, especially its ID, functional scope, and ability to flow into Requirement Analysis, User Stories, and Feature Specification.

## 5. Demo 3 – Requirement Analysis

Use:

`../../prompts/chapter-03/requirement-prompts.md`

### Expected Results

- Requirement ID
- Actor
- Priority
- Input / Processing / Output
- Business rules
- Edge cases
- Security considerations
- Preconditions / Postconditions
- Acceptance criteria

### Human Review

Compare the output with the PRD and revise requirements with unclear actors, inputs, outputs, processing conditions, or business rules.

Pay particular attention to maintenance request submission and AI-based request classification.

## 6. Demo 4 – User Story

### Sample Prompt

> Create an Agile User Story and Acceptance Criteria for SmartRent's maintenance request submission feature.

### Expected Results

- User Story
- Actor / role
- User goal
- Acceptance Criteria
- Valid and invalid scenarios

### Human Review

Verify that the User Story accurately reflects the requirement and that the Acceptance Criteria are testable.

## 7. Demo 5 – Feature Specification

Use:

`../../prompts/chapter-03/feature-prompts.md`

### Expected Results

- Objective
- User
- User flow
- Input
- AI processing
- Output schema
- Categories
- Priority levels
- Error handling
- Edge cases
- Acceptance criteria
- Security considerations

### Human Review

Verify:

- Whether the JSON schema is valid.
- Whether the category and priority are appropriate.
- Whether AI makes assumptions when information is missing.
- Whether the confidence value is handled appropriately.
- Whether error handling and fallbacks keep the system operational.
- Whether AI performs or recommends unauthorized actions.
- Whether the backend controls and validates AI results.

## 8. Evidence

Each demo should retain evidence of the AI usage process:

- Prompt used.
- AI output.
- Human review.
- Final result.

Evidence can be retained as:

- Screenshots.
- Markdown files.
- JSON files.
- Relevant result documents.

## 9. Conclusion

These demos show that AI can support activities from product discovery through feature specification in Chapter 3.

AI supports content generation and analysis, while developers remain responsible for reviewing, refining, and validating results before applying them to SmartRent.
