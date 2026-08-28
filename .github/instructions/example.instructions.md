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

Example:

```md
---
description: 'Rules for GitHub Actions workflows'
applyTo: '.github/workflows/**/*.yml,.github/workflows/**/*.yaml'
---

- Treat `GITHUB_TOKEN` permissions as a security boundary.
- Flag unnecessarily broad write permissions.
- Review `pull_request_target` for execution of PR-controlled content.
- Check whether secrets can reach untrusted code.
```

Avoid:

- repository-wide version facts that other tasks also need
- model/tool/delegation instructions
- review-output formatting
- generic style advice already enforced by tooling
- `applyTo: '**'` as a substitute for proper repository-wide context

Prefer semantic repository boundaries over broad extensions. For example, do not apply generic YAML rules to every `*.yml` file when Ansible, GitHub Actions, and Compose require different review semantics.
