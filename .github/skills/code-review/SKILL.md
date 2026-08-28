# Code review skill

Use this skill for pull-request/code-review tasks. Optimize for **high-signal, evidence-backed findings with low review noise**.

## Goal

Find concrete defects introduced, exposed, or made reachable by the proposed change. Prioritize correctness, regressions, security, safety, compatibility, data integrity, concurrency, resource lifetime, and important missing validation/tests.

Do not try to prove that every changed line is ideal.

## Review procedure

1. **Establish intent**
   - Read the PR title/description and linked context available to the review.
   - Identify the behavior the change intends to add, remove, or preserve.
   - Treat the diff as implementation evidence, not as the specification by itself.

2. **Build a change-impact map**
   - Identify changed components and interfaces.
   - Trace callers/consumers/dependencies only where the change can affect them.
   - Note repository invariants and path-specific instructions that apply.
   - Expand beyond changed lines only when there is evidence of wider impact.

3. **Review highest-risk consequences first**
   Consider only lenses relevant to the change:
   - functional correctness and edge cases
   - error handling and partial failure
   - API/schema/protocol/configuration compatibility
   - state ownership, cleanup, lifetime, and resource leaks
   - concurrency, ordering, races, retries, and idempotency
   - authentication, authorization, secret handling, and trust boundaries
   - persistence, migrations, rollback, and data loss
   - build, packaging, deployment, and runtime assumptions
   - meaningful test gaps for changed behavior

4. **Validate suspected findings**
   - Prefer disproving a suspicion over posting a weak comment.
   - Confirm the affected path is reachable or realistically used.
   - Check nearby definitions/usages/tests when necessary.
   - Do not infer a repository-wide absence from a narrow search.

5. **Report only actionable findings**
   A finding should explain:
   - what is wrong
   - why this change causes/exposes it
   - realistic impact
   - precise evidence/location
   - concise direction for correction

## Noise filter

Do **not** comment on:

- formatting, import ordering, whitespace, or mechanical style that automated tooling should enforce
- generic best practices without a concrete failure mode
- unrelated pre-existing defects
- speculative future architecture concerns
- broad refactoring preferences
- optional naming/readability preferences unless they create genuine ambiguity or misuse risk
- missing tests when existing coverage already exercises the changed behavior adequately
- duplicate manifestations of the same root cause; prefer one root-cause finding when practical

If a formatter, linter, compiler, type checker, schema validator, or ordinary CI check is expected to catch the issue reliably, generally let automation own it unless the failure has an important semantic consequence that the automated message will not explain.

## Severity

Use severity according to realistic impact and reachability:

- **BLOCKER** — merge should be prevented; likely severe security/safety/data-loss/correctness failure or a change that cannot work as intended
- **HIGH** — serious reachable regression, security/safety issue, major compatibility break, or significant incorrect behavior
- **MEDIUM** — concrete defect with bounded impact, or an important validation/test gap that can allow a realistic regression
- **LOW** — small but real correctness/robustness issue worth fixing; never use LOW for stylistic preference

Do not inflate severity based on theoretical worst case.

## Finding format

Keep each finding independently understandable and concise:

```text
[SEVERITY] Short defect statement

Why: <realistic failure or regression>
Evidence: <how the changed code causes/exposes it>
Suggested direction: <minimal correction direction>
```

Anchor the comment to the smallest useful changed line/range when possible. If evidence spans files, mention the relevant path/symbol without dumping large excerpts.

## Final quality check

Before submitting a finding, verify all of the following:

- attributable to the proposed change
- concrete failure mode or meaningful regression risk
- supported by repository or authoritative external evidence available to the review
- not merely automated-tool/style noise
- severity is proportional to realistic impact
- not a duplicate of a stronger root-cause finding

If no finding passes this bar, return no actionable findings rather than manufacturing comments.
