<!-- TEMPLATE: replace every <placeholder>, remove example values that are not authoritative, then delete this comment. -->
# Repository-wide Copilot instructions

## Repository purpose and architecture

- Repository purpose: `<what this repository builds or provides>`
- Important consumers/users: `<who or what depends on it>`
- Major subsystems and responsibilities: `<small architecture map>`
- Important cross-subsystem boundaries: `<interfaces or ownership boundaries that affect changes>`

If the architecture is too large to summarize usefully here, link to authoritative repository documentation and keep only the invariants and routing facts that Copilot must know on almost every task.

## Authoritative project facts

- Primary language/toolchain baseline: `<for example: C++20 with GCC 14, Python 3.12, TypeScript 5.x>`
- Framework/runtime/distribution: `<name and exact supported version/distribution>`
- Target operating system/platform: `<OS/version, architecture, device, browser/runtime, etc.>`
- Package/build system: `<for example: CMake + Ninja, Cargo, npm>`
- Dependency baseline(s): `<only versions/ranges that are authoritative project constraints>`

Treat declared versions, distributions, platforms, and toolchain baselines as compatibility constraints. Do not silently assume APIs or behavior from newer versions are available.

## Authoritative documentation sources

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

Use an exact versioned URL when the documentation site provides a stable version-specific location. A domain/root URL is acceptable when paths vary, but pair it with the target version/distribution so research does not silently drift to latest or rolling documentation.

## Build and verification facts

- Configure/build: `<repository-defined command>`
- Unit tests: `<repository-defined command>`
- Integration/end-to-end tests: `<repository-defined command or N/A>`
- Lint/format/static analysis: `<repository-defined command or N/A>`
- Code/schema generation or validation: `<repository-defined command or N/A>`
- Focused subsystem verification: `<repository-defined command or guidance>`

Prefer the repository's established entry points over invented equivalent commands. Distinguish checks actually executed from checks inferred only by inspection.

## Repository-wide boundaries and invariants

Record only constraints that genuinely matter across repository tasks:

- `<public API / ABI / protocol / schema compatibility boundary>`
- `<persistence or migration invariant>`
- `<generated or vendored source boundary>`
- `<ownership, lifecycle, concurrency, real-time, or safety invariant>`
- `<deployment/runtime assumption that many tasks must preserve>`

State invariants in terms of what must remain true and, when useful, the concrete consequence of violation.

## Universal change policy

- Preserve established repository architecture and compatibility boundaries unless the task explicitly changes them.
- Prefer concrete repository evidence over assumptions about how nearby code probably behaves.
- Make focused changes; avoid unrelated refactors unless they are required for correctness.
- When behavior changes, update or add meaningful tests when the behavior can reasonably be captured.
- Distinguish checks actually executed from checks inferred only by reading code.
- Do not edit generated or vendored sources directly when the repository defines a generation/update path.
- Treat security, safety, data-loss, persistence, migration, public API/schema/protocol, and concurrency boundaries as high-risk when a change touches them.
