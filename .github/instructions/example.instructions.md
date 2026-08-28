---
description: 'TEMPLATE: path-specific implementation and review rules; replace the glob and content or delete this file'
applyTo: '__REPLACE_WITH_REAL_PATH__/**'
---

# Path-specific rules

> This file is intentionally inactive until `applyTo` is replaced with a real repository path.

Use path-specific instructions for rules that are important only when matching files are being implemented or reviewed.

Good content:

- framework/language conventions that affect correctness
- subsystem-specific invariants
- ownership/error-handling patterns
- compatibility expectations for a particular API area
- security rules for a sensitive directory
- test conventions for matching tests
- repository-native abstractions whose misuse creates concrete semantic consequences

## Prefer rules with an evidence shape

A useful rule answers these questions:

```text
Trigger
  When does this rule apply?

Invariant
  What must remain true?

Failure mode
  What concrete bad behavior follows if it is violated?

Evidence
  What should Copilot inspect before commenting?

Escape hatch
  What evidence means the code is actually safe?
```

Example:

```md
---
description: 'Rules for GitHub Actions workflows'
applyTo: '.github/workflows/**/*.yml,.github/workflows/**/*.yaml'
---

- Treat `GITHUB_TOKEN` permissions as a security boundary.
- Flag unnecessarily broad write permissions only when the job can reach those permissions.
- Review `pull_request_target` when PR-controlled content can be executed.
- Check whether secrets can reach untrusted code before reporting exposure.
```

## Semantic misuse belongs here when it is domain-specific

Do not put a framework encyclopedia into the core review skill. Encode concrete framework/subsystem semantics under the paths where they matter.

For example, an Angular-oriented instruction could say:

```md
- Treat values that are purely derived from existing signals as derived state.
- Flag `effect()` that copies a pure derivation into writable state when it creates a second source of truth, eager synchronization, or update-order/lifecycle dependence.
- Prefer `computed()` when the value has no independent mutation semantics.
- Do not flag effects whose purpose is external synchronization such as browser APIs, persistence, analytics, network I/O, focus, or imperative third-party APIs.
- Do not comment merely because `computed()` is shorter.
```

The important boundary is **semantic consequence**, not preferred syntax.

Avoid:

- repository-wide version facts that other tasks also need
- model/tool/delegation instructions
- review-output formatting
- generic style advice already enforced by tooling
- broad rules such as `prefer modern idioms` without a failure mode
- `applyTo: '**'` as a substitute for proper repository-wide context

Prefer semantic repository boundaries over broad extensions. For example, do not apply generic YAML rules to every `*.yml` file when Ansible, GitHub Actions, and Compose require different review semantics.
