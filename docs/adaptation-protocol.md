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

- `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/agents/*.agent.md`
- `.github/skills/**/SKILL.md`
- `.claude/skills/**/SKILL.md`
- `.agents/skills/**/SKILL.md`
- PR templates
- repository-specific contributor/development instructions

These project skill roots participate in the same Agent Skills mechanism. Do not inspect only `.github/skills` and assume it is the complete repository-local skill set.

Personal/user-level skills and settings can also affect some execution environments but are not discoverable from repository contents alone. If they materially affect the target workflow, record them as an environment dependency or residual uncertainty rather than inventing repository-local control over them.

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

Apply the [canonical routing test](context-architecture.md#routing-test) to every fact and rule you gathered in Phase 1, and record where each one lands.

Do not restate the routing rules here. `context-architecture.md` is their authoritative owner, including the decision about whether an optional `AGENTS.md` is justified.

A fact that does not clearly belong to one layer is usually two facts, or one you cannot yet support with evidence. Resolve that before writing, not by putting it in several places.

After classification, load only the detailed guide needed for the layers you will actually adapt:

- [instruction-architecture.md](instruction-architecture.md) for repository-wide/path-scoped instructions and optional `AGENTS.md`
- [agent-architecture.md](agent-architecture.md) for IDE agent topology, tools, models, delegation, and worker contracts
- [skill-architecture.md](skill-architecture.md) for reusable skills and the GitHub `code-review` skill

Do not load all three by default merely to reconstruct the former monolithic architecture document.

## Phase 4 — adapt the files

Adapt only the layers justified by the routing test and target-repository evidence.

Typical Copilot-only result:

```text
.github/
├─ copilot-instructions.md
├─ pull_request_template.md
├─ instructions/*.instructions.md
├─ agents/*.agent.md
└─ skills/
   ├─ code-review/SKILL.md
   └─ <optional reusable skills>/SKILL.md
```

If the routing test justifies additional context layers, add them deliberately rather than because the template once contained an example.

Port only the adapted configuration files. The template's own `README.md` and `docs/` describe the architecture and must not be copied into the target repository.

Before finishing adaptation, remove template scaffolding from files that will remain active at runtime:

- replace or delete every placeholder/example value
- remove template-only routing explanations and adaptation notes
- remove example technologies, commands, paths, versions, or documentation URLs that are not true for the target repository
- keep only repository facts and policies that should actually be loaded during ordinary Copilot work

Keep repository facts evidence-backed, path-specific rules narrowly scoped, agent roles explicit, and automatic review focused on concrete defects rather than style.

Do not create empty architecture just because the template contains an example file.

## Phase 5 — validate the generated configuration

Do not consider the repository Copilot-ready until the resulting configuration passes these checks.

### Structural validation

Verify:

- every `applyTo` pattern matches real intended paths
- no scaffold marker such as `__REPLACE_WITH_REAL_PATH__` or `<!-- TEMPLATE:` remains active
- YAML/frontmatter is valid
- referenced files/commands/paths actually exist
- generated/vendor files are not accidentally targeted for direct editing
- model/tool names used by custom agents exist in the target environment
- Orchestrator can actually invoke configured Scout/Reviewer workers in the current VS Code/Copilot version
- all repository-local Agent Skill roots that exist (`.github/skills`, `.claude/skills`, `.agents/skills`) have been considered for duplicate names, conflicting workflows, and unintended selection
- when an agent has terminal/execution access, the intended VS Code/Copilot approval, permission, sandbox, and network-access settings are configured to enforce any restrictions that materially matter

### Context validation

Check for:

- invented repository facts
- stale version assumptions
- duplicate rules across layers, except narrow intentional interface/authority contracts described in [agent-architecture.md](agent-architecture.md#intentional-contract-duplication)
- duplicated policy that can remain plausible while silently diverging; use the staleness test in `agent-architecture.md` rather than relying on a fixed category list
- contradictory matching instructions
- giant global instruction files that should be split by path
- path-specific rules accidentally placed in always-on context
- critical facts hidden behind an `applyTo` pattern that does not cover all consumers
- template-only meta guidance left in always-on runtime context
- latest-only external evidence presented as proof for an older supported version
- reviewer formatting/UI requirements that the platform does not guarantee
- correctness that depends on an optional external MCP being available
- runtime agents that depend on the name/path of another execution surface's review policy instead of declaring their own authority generically
- IDE review agents whose concrete finding policy was thinned because an ownership declaration was mistaken for a substitute
- surface-specific skill scope described as hard isolation even though the target product does not document that enforcement
- assumptions that a custom-agent `tools` allowlist prevents ordinary inline Agent Skill discovery/loading without product evidence

### Behavior validation

Run repository-defined verification appropriate for the configuration/documentation change.

Then inspect the final diff and confirm the configuration describes the target repository, not this template repository.

## Phase 6 — evaluate reviewer behavior when it matters

Copilot review is non-deterministic. A plausible-looking skill or authority declaration is not evidence that the reviewer behaves well.

Use small experimental PRs with positive cases and clean negative controls when reviewer behavior matters. When multiple review surfaces or a surface-specific skill are involved, test policy-authority isolation separately from ordinary defect recall.

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
