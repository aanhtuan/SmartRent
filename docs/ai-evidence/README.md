# SmartRent — CS2028 AI development evidence

Use real Context -> Prompt -> AI Output -> Human Review -> Refinement -> Final Result. Prompt templates in `prompts/` are reusable design inputs, not proof that a particular model ran them. Do not reconstruct missing historical output as original evidence.

## Record format

Task/run ID and timestamp; tool/model/version if actually observed; base SHA and source revisions; sanitized prompt/reference; output/diff; reviewer and accepted/rejected/modified findings; refinement prompt/change if performed; exact verification commands/results; final artifacts and limitations. Never fabricate reviewer names, model versions, iteration counts or past approval.

Store each authorized task record here, or link to its issue/PR/chat evidence. Use synthetic/redacted data; never keys, JWTs, password hashes, real tenant PII or raw sensitive provider payloads. Model/provider development tools and application Gemini integration are different boundaries.

## Records

- [Sprint 0 documentation normalization](sprint-0-normalization.md): current task, verification section completed only after checks run.
