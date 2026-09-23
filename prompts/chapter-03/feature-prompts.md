# Prompt – Feature Specification

## Prompt
You are a Senior Software/Product Analyst.

Write a Feature Specification for SmartRent's AI Maintenance Assistant feature.

Include:
1. Objective
2. User
3. User flow
4. Input
5. AI processing
6. Output schema
7. Categories
8. Priority levels
9. Error handling
10. Edge cases
11. Acceptance Criteria
12. Security considerations

The result must be sufficiently specific for developers to use as the basis for API design and feature implementation.

## Human Review
Developers must verify:
- Whether the JSON schema is valid.
- Whether the category and priority are appropriate.
- Whether AI makes assumptions when information is missing.
- Whether the confidence value is reasonable.
- Whether error handling and fallbacks keep the system operational.
- Whether AI performs or recommends unauthorized actions.

Clearly define:
- JSON input/output schema
- Validation rules
- Confidence threshold
- Missing information handling
- Fallback when AI cannot classify a request
- Fallback when the AI service is unavailable
- Prevent AI from autonomously executing critical actions
- Require the backend to control and validate AI results
