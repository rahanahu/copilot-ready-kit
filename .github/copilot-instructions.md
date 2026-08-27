# Repository-wide Copilot instructions

> Template: replace the placeholders below with authoritative facts for this repository. Keep this file concise. Put role-specific orchestration behavior in `.github/agents/*.agent.md` instead of here.

## Project facts

- Primary language(s): `<for example: C++20, Python 3.12, TypeScript 5.x>`
- Framework/runtime: `<name and exact supported version/distribution>`
- Target platform(s): `<OS, architecture, device, browser, runtime, etc.>`
- Package/build system: `<for example: CMake + Ninja, Cargo, npm>`
- Test framework: `<for example: pytest, GoogleTest, Vitest>`

Treat these versions and targets as authoritative constraints. Do not silently assume APIs from newer releases are available.

## Build and verification

- Configure/build: `<command>`
- Unit tests: `<command>`
- Integration tests: `<command or N/A>`
- Lint/format/static analysis: `<command>`

Prefer the repository's existing scripts and documented commands over inventing new workflows.

## Repository conventions

- Follow existing architecture and local patterns before introducing new abstractions.
- Make the smallest change that fully solves the requested problem.
- Preserve backward compatibility unless the task explicitly permits a breaking change.
- Do not add dependencies without a concrete reason; prefer dependencies already used by the repository.
- Update tests when behavior changes or a regression can reasonably be captured.
- Keep generated files, vendored code, and third-party sources unchanged unless the task explicitly targets them.

## Version-sensitive research

When external documentation or upstream behavior matters:

- Match documentation to the versions declared above.
- Prefer primary/official sources.
- Do not use `latest`, rolling, nightly, or development documentation as evidence for a stable version unless explicitly comparing versions.
- State clearly when only evidence for a different version is available.

## Repository-specific invariants

Replace this section with constraints that should apply regardless of which file or agent is active, for example:

- `<public protocol/ABI must remain compatible>`
- `<real-time path must not allocate>`
- `<configuration schema must remain backward compatible>`
- `<supported compiler/runtime baseline>`
