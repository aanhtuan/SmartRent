# SmartRent — CS2028 AI development evidence

Use real Context -> Prompt -> AI Output -> Human Review -> Refinement -> Final Result. Prompt templates in `prompts/` are reusable design inputs, not proof that a particular model ran them. Do not reconstruct missing historical output as original evidence.

## Record format

Task/run ID and timestamp; tool/model/version if actually observed; base SHA and source revisions; sanitized prompt/reference; output/diff; reviewer and accepted/rejected/modified findings; refinement prompt/change if performed; exact verification commands/results; final artifacts and limitations. Never fabricate reviewer names, model versions, iteration counts or past approval.

Store each authorized task record here, or link to its issue/PR/chat evidence. Use synthetic/redacted data; never keys, JWTs, password hashes, real tenant PII or raw sensitive provider payloads. Model/provider development tools and application Gemini integration are different boundaries.

## Records

- [Sprint 0 documentation normalization](sprint-0-normalization.md): current task, verification section completed only after checks run.
- [C6-01 backend foundation](c6-01-backend-foundation.md): actual local implementation/build/test evidence; human review and remote CI pending.

- [C6-03 database foundation](c6-03-database-foundation.md): PostgreSQL/identity increment merged through PR #10; local verification and push/PR hosted CI passed. Historical pre-merge evidence is retained.
- [B01/C6-04 final security review](c6-04-security-review.md): source review, reproduced configuration defects, fixes, 54-test verification and logical Git publication groups; no Git publication performed.
- [B01/C6-04 development account provisioning](c6-04-dev-account-provisioning.md): G1 approval, local implementation, PostgreSQL rollback/concurrency tests and Argon2id benchmark; hosted CI and delivery pending.
- [Backend-first Phase 0](backend-phase-0-audit.md): repository audit, fresh baseline verification, C6-03 status reconciliation and proposed implementation/approval gates; Phase 0 itself did not implement business behavior.
