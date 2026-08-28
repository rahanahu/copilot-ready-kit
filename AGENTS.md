# Shared repository context for Copilot

> Template: adapt this file to the target repository. Keep it concise, factual, and useful to both coding agents and GitHub Copilot code review.

`AGENTS.md` describes **what this repository is and what must remain true**. It is shared context, not a reviewer prompt and not an orchestration script.

## Repository purpose

- Product/system: `<what this repository builds or operates>`
- Primary users/consumers: `<who or what depends on it>`
- Critical behavior: `<behavior whose regression would matter most>`

## Architecture map

Document only the boundaries an agent must understand to reason across files.

```text
<entrypoint / application>
  -> <domain/service layer>
  -> <integration/infrastructure layer>
  -> <external systems>
```

Important areas:

- `<path>` — `<responsibility>`
- `<path>` — `<responsibility>`
- `<path>` — `<responsibility>`

## Repository invariants

Record concrete cross-cutting constraints, for example:

- `<public API/schema/protocol compatibility rule>`
- `<generated/vendor files must not be edited directly>`
- `<runtime, safety, security, real-time, persistence, or migration invariant>`
- `<configuration backward-compatibility rule>`

Only keep invariants that are actually true for the repository.

## Change-sensitive boundaries

These are areas where a local diff may require wider impact analysis:

- Public interfaces: `<paths/schemas/packages>`
- Persistence/migrations: `<paths>`
- Authentication/authorization/security boundaries: `<paths>`
- Concurrency/state ownership: `<paths>`
- Build/release/deployment: `<paths>`

## Verification map

Use repository-defined commands. Do not invent substitutes when an authoritative command exists.

- Build: `<command>`
- Unit tests: `<command>`
- Integration tests: `<command or N/A>`
- Lint/static analysis: `<command or N/A>`
- Focused validation: `<command or guidance>`

## Evidence policy

When making a technical claim about this repository:

- prefer concrete source/configuration/test evidence over assumptions
- distinguish declared support from merely resolved dependency versions
- distinguish checks actually executed from checks inferred by inspection
- do not treat comments, examples, or stale documentation as stronger than the code/configuration that currently defines behavior

## What does not belong here

Do not put these in `AGENTS.md`:

- model selection or subagent routing
- VS Code tool permissions
- detailed review workflow or severity formatting
- language/module rules that only apply to particular paths
- generic style advice already enforced by formatter/linter/CI

Use `.github/agents/` for IDE agent behavior, `.github/instructions/` for path-specific rules, and `.github/skills/code-review/` for GitHub code-review procedure.
