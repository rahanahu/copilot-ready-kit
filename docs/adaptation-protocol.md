# Adaptation protocol

This document is the detailed execution protocol for adapting `copilot-ready-kit` to an existing repository.

Do not copy this template verbatim. Inspect the target repository, derive authoritative context from evidence, adapt the architecture, write the files, and validate the result.

## Phase 1 — inspect before writing

Do not generate Copilot configuration from the repository name, README alone, or assumptions about the technology stack.

Build an evidence inventory first.

### Repository facts

Identify:

- repository purpose and important users/consumers
- top-level architecture and major subsystem boundaries
- primary languages, frameworks, runtimes, distributions, and toolchains
- declared/supported versions, not merely locally resolved dependency versions
- target operating systems, architectures, devices, browsers, or deployment environments
- package/build systems
- generated and vendored source boundaries
- configuration and deployment surfaces

### Verification facts

Find repository-defined commands for workflows that actually exist:

- configure/build/compile
- unit tests
- integration/end-to-end tests
- lint/format/static analysis
- schema/code-generation checks
- focused subsystem validation

Do not invent replacement commands when an authoritative project command exists.

### Change-sensitive boundaries

Look for contracts where a local change can have non-local impact:

- public API / ABI / schema / protocol compatibility
- persisted data and migrations
- authentication, authorization, secrets, trust boundaries
- concurrency, callbacks, shared state, atomicity
- ownership, lifecycle, resource cleanup
- deployment and runtime assumptions
- real-time or safety constraints
- backward-compatible configuration

### Existing AI/Copilot configuration

Before adding files, inspect any existing:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/agents/*.agent.md`
- `.github/skills/**/SKILL.md`
- PR templates
- repository-specific contributor/development instructions

Preserve useful existing behavior. Do not blindly replace configuration that already encodes real project knowledge.

### Authoritative external documentation

For version-sensitive technologies, identify official documentation matching the repository's declared support baseline.

Examples:

```text
Angular 20 -> https://v20.angular.dev/
ROS 2 Jazzy -> https://docs.ros.org/en/jazzy/
```

Record both the supported version/distribution and a version-matched authoritative source when one is available. Do not use latest/rolling/nightly behavior as proof for an older supported release without explicit evidence.

See [review-design.md](review-design.md) for external research and MCP guidance.

## Phase 2 — report the discovered model before editing

Before creating or replacing Copilot configuration, summarize the evidence you found.

At minimum report:

```text
Repository purpose
Architecture map
Supported versions/platforms
Build/test/lint commands
Important invariants
Change-sensitive boundaries
Generated/vendor boundaries
Authoritative documentation sources
Proposed applyTo boundaries
Existing Copilot configuration to preserve/replace
Unknown or conflicting facts
```

If a fact is uncertain, mark it uncertain. Do not turn a guess into an instruction.

## Phase 3 — classify context into the correct layer

Use this routing test for every piece of guidance:

```text
What is this repository and what must remain true?
  -> AGENTS.md

Must almost every Copilot task know this fact or policy?
  -> .github/copilot-instructions.md

Does this rule apply only to a subsystem/language/framework/security surface?
  -> .github/instructions/*.instructions.md + precise applyTo

Does this define an IDE agent's role, tools, model, delegation, or output contract?
  -> .github/agents/*.agent.md

Does this define how GitHub PR review should investigate and decide when to comment?
  -> .github/skills/code-review/SKILL.md
```

Do not duplicate the same detailed rule across several layers just to make it more visible.

See [context-architecture.md](context-architecture.md) for the detailed responsibility split.

## Phase 4 — adapt the files

Adapt only the layers justified by the target repository.

Typical result:

```text
AGENTS.md
.github/
├─ copilot-instructions.md
├─ pull_request_template.md
├─ instructions/*.instructions.md
├─ agents/*.agent.md
└─ skills/code-review/SKILL.md
```

Port only these files. The template's own `README.md` and `docs/` describe the architecture and must not be copied into the target repository.

Keep repository facts evidence-backed, path-specific rules narrowly scoped, agent roles explicit, and automatic review focused on concrete defects rather than style.

Do not create empty architecture just because the template contains an example file.

## Phase 5 — validate the generated configuration

Do not consider the repository Copilot-ready until the resulting configuration passes these checks.

### Structural validation

Verify:

- every `applyTo` pattern matches real intended paths
- no placeholder such as `__REPLACE_WITH_REAL_PATH__` remains active
- YAML/frontmatter is valid
- referenced files/commands/paths actually exist
- generated/vendor files are not accidentally targeted for direct editing
- model/tool names used by custom agents exist in the target environment

### Context validation

Check for:

- invented repository facts
- stale version assumptions
- duplicate rules across layers
- contradictory matching instructions
- giant global instruction files that should be split by path
- path-specific rules accidentally placed in always-on context
- reviewer formatting/UI requirements that the platform does not guarantee
- latest-only external evidence presented as proof for an older supported version
- correctness that depends on an optional external MCP being available

### Behavior validation

Run repository-defined verification appropriate for the configuration/documentation change.

Then inspect the final diff and confirm the configuration describes the target repository, not this template repository.

## Phase 6 — evaluate reviewer behavior when it matters

Copilot review is non-deterministic. A plausible-looking skill is not evidence that the reviewer behaves well.

Use small experimental PRs with positive cases and clean negative controls when reviewer behavior matters.

See [reviewer-evaluation.md](reviewer-evaluation.md) for benchmark design and interpretation.

## Completion report

When finished, report:

```text
Files created/updated
Repository facts encoded
Path-specific applyTo boundaries created
Agent topology/configuration chosen
Review risks encoded
Verification actually performed
Reviewer experiments performed, if any
Known uncertainties or follow-ups
```

Do not claim verification you did not run.
