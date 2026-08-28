# Repository-wide Copilot instructions

> Template: replace placeholders with facts and policies that are genuinely authoritative for the target repository. Remove examples that are not true.

This file contains **small, always-relevant Copilot guidance** shared across implementation and review surfaces.

Use the surrounding files deliberately:

- `AGENTS.md` — repository purpose, architecture map, invariants, verification map, and change-sensitive boundaries
- `.github/copilot-instructions.md` — universal Copilot behavior and authoritative project/version/documentation facts
- `.github/instructions/*.instructions.md` — path-specific implementation/review rules selected with `applyTo`
- `.github/agents/*.agent.md` — VS Code custom-agent roles, models, tools, delegation, and output contracts
- `.github/skills/code-review/SKILL.md` — GitHub Copilot code-review procedure and finding quality bar

Do not duplicate detailed review procedure or agent routing here.

## Authoritative project facts

- Primary language/toolchain baseline: `<for example: C++20 with GCC 14, Python 3.12, TypeScript 5.x>`
- Framework/runtime/distribution: `<name and exact supported version/distribution>`
- Target operating system/platform: `<OS/version, architecture, device, browser/runtime, etc.>`
- Package/build system: `<for example: CMake + Ninja, Cargo, npm>`
- Dependency baseline(s): `<only versions/ranges that are authoritative project constraints>`

Treat declared versions, distributions, platforms, and toolchain baselines as compatibility constraints. Do not silently assume APIs or behavior from newer versions are available.

## Authoritative documentation sources

Record the primary official documentation locations used for version-sensitive technical evidence.

- `<technology/framework>`
  - Target version/distribution: `<version>`
  - Official documentation: `<official domain or URL>`
- `<technology/framework>`
  - Target version/distribution: `<version>`
  - Official documentation: `<official domain or URL>`

Examples to replace or remove:

- ROS 2
  - Target distribution: `Jazzy`
  - Official documentation: `https://docs.ros.org/en/jazzy/`
- Angular
  - Target major version: `20`
  - Official documentation: `https://v20.angular.dev/`

Prefer authoritative documentation matching the declared target version. Do not treat latest/rolling/nightly documentation as proof for an older supported release without explicit evidence.

## Universal change policy

These rules should remain useful whether Copilot is implementing code in VS Code or reviewing a pull request on GitHub:

- Preserve established repository architecture and compatibility boundaries unless the task explicitly changes them.
- Prefer concrete repository evidence over assumptions about how nearby code probably behaves.
- Make focused changes; avoid unrelated refactors unless they are required for correctness.
- When behavior changes, update or add meaningful tests when the behavior can reasonably be captured.
- Distinguish checks actually executed from checks inferred only by reading code.
- Do not edit generated or vendored sources directly when the repository defines a generation/update path.
- Treat security, safety, data-loss, persistence, migration, public API/schema/protocol, and concurrency boundaries as high-risk when a change touches them.

## Review-noise policy

When acting as a reviewer, optimize for high signal:

- report concrete defects, violated repository invariants, and consequence-backed semantic misuse; do not report taste
- require a realistic failure/regression or concrete semantic liability before commenting
- the defect must be caused by the current change, but supporting evidence may come from unchanged callers, consumers, tests, configuration, or sibling implementations
- do not spend review comments on formatting/style or deterministic failures that CI/tooling should reliably enforce
- do not report unrelated pre-existing defects as findings on the current change
- verify suspected issues before presenting them as confirmed
- prefer one root-cause finding over multiple duplicate comments
- if the available evidence cannot substantiate the concern, stay silent

Detailed review procedure, semantic-misuse criteria, and severity guidance belong in `.github/skills/code-review/SKILL.md`.

## Path-specific guidance

Do not place ordinary language-, framework-, module-, test-, or workflow-specific rules here. Put them in `.github/instructions/*.instructions.md` with precise `applyTo` patterns.

Prefer semantic boundaries over broad file extensions. For example, do not use one global YAML rule for Ansible, GitHub Actions, Kubernetes, and Compose when their correctness/security concerns differ.

When encoding a framework or repository-native abstraction, describe the invariant and concrete consequence of misuse. Do not write broad rules such as `prefer modern idioms` or `always use abstraction X` without a semantic reason.

## What does not belong here

Keep these out of repository-wide instructions:

- model names and model fallback order
- subagent topology and delegation policy
- VS Code tool permissions
- detailed Scout/Reviewer output schemas
- long code-review checklists
- path-specific implementation conventions
- generic formatter/linter rules

Those concerns have dedicated files so that Copilot receives only the context needed for the current job.
