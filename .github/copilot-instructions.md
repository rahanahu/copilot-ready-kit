# Repository-wide Copilot instructions

> Template: replace the placeholders below with facts that are authoritative for this repository. Remove examples that are not actually true. Keep role, routing, research workflow, and agent output behavior in `.github/agents/*.agent.md` instead of here.

## Authoritative project facts

- Primary language/toolchain baseline: `<for example: C++20 with GCC 14, Python 3.12, TypeScript 5.x>`
- Framework/runtime/distribution: `<name and exact supported version/distribution>`
- Target operating system/platform: `<OS/version, architecture, device, browser/runtime, etc.>`
- Package/build system: `<for example: CMake + Ninja, Cargo, npm>`
- Dependency baseline(s): `<only versions/ranges that are authoritative project constraints>`

Treat declared versions, distributions, platforms, and toolchain baselines as authoritative compatibility constraints. Do not assume APIs or behavior from newer versions are available.

## Authoritative documentation sources

Record the primary official documentation locations that should be used when researching project technologies. Pair each source with the project version/distribution constraint when version-sensitive.

- `<technology/framework>`
  - Target version/distribution: `<version>`
  - Official documentation: `<official domain or URL>`
- `<technology/framework>`
  - Target version/distribution: `<version>`
  - Official documentation: `<official domain or URL>`

Examples to replace or remove:

- ROS 2
  - Target distribution: `Jazzy`
  - Official documentation: `https://docs.ros.org/`
- Angular
  - Target major version: `20`
  - Official documentation: `https://angular.dev/`

These entries define **where authoritative evidence should come from** and **which project version it must match**. Keep the detailed research procedure in `Scout.agent.md` rather than duplicating it here.

## Build and verification facts

- Configure/build: `<repository-defined command>`
- Unit tests: `<repository-defined command>`
- Integration tests: `<repository-defined command or N/A>`
- Lint/format/static analysis: `<repository-defined command or N/A>`

Use these repository-defined commands when applicable. If the repository has multiple supported workflows, document the supported variants instead of inventing a single canonical command.

## Repository-wide boundaries and invariants

Keep only constraints that genuinely apply regardless of active file, language, or agent. Examples to replace or remove:

- Compatibility boundary: `<for example: public protocol/ABI/schema must remain backward compatible>`
- Generated/vendor boundary: `<for example: generated and third-party sources are not edited directly>`
- Runtime invariant: `<for example: real-time path must not allocate>`
- Configuration invariant: `<for example: existing configuration files must remain backward compatible>`
- Supported compiler/runtime baseline: `<minimum/maximum supported versions if authoritative>`

Do not place ordinary language-specific style rules here. Put those in `.github/instructions/*.instructions.md` with an appropriate `applyTo` pattern.
