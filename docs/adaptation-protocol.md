# Adaptation protocol

This document is the detailed execution protocol for adapting `copilot-ready-kit` to an existing repository.

Do not copy this template verbatim. Inspect the target repository, derive authoritative context from evidence, adapt the architecture, write the files, and validate the result.

## Phase 1 — inspect before writing

Do not generate Copilot configuration from the repository name, README alone, or assumptions about the technology stack.

Build an evidence inventory first. Everything gathered here lands in a configuration layer in Phase 3; if an item has no destination there, it is more than the configuration can use.

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
- `.vscode/settings.json`, especially `chat.agentSkillsLocations` when present
- PR templates
- repository-specific contributor/development instructions

Skill roots and what they can and cannot reveal are described in [skill-architecture.md](skill-architecture.md#cross-surface-discovery). Personal configuration is not discoverable here; record it as an environment dependency rather than inventing repository-local control over it.

Preserve useful existing behavior. Do not blindly replace configuration that already encodes real project knowledge.

### Authoritative external documentation

For version-sensitive technologies, record the supported version or distribution together with an official documentation source that matches it. See [review-design.md](review-design.md#version-sensitive-evidence) for why the match matters and for external-research guidance.

## Phase 2 — report the discovered model before editing

Before creating or replacing Copilot configuration, summarize the evidence you found.

Report the inventory from Phase 1, plus three things it does not contain:

```text
Proposed applyTo boundaries
Existing Copilot configuration to preserve or replace
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

[instruction-architecture.md](instruction-architecture.md#repository-composition-examples) shows what minimal, typical, and monorepo results look like. If the routing test justifies layers beyond those, add them deliberately rather than because the template once contained an example.

Port the adapted configuration files and the workspace settings the agent tools need; the shipped `.vscode/settings.json` carries the latter, so port it or fold its entries into settings the target repository already has. The template's own `README.md` and `docs/` describe the architecture and must not be copied into the target repository.

Before finishing adaptation, remove template scaffolding from files that will remain active at runtime:

- replace or delete every placeholder/example value
- remove template-only routing explanations and adaptation notes
- remove example technologies, commands, paths, versions, or documentation URLs that are not true for the target repository
- keep only repository facts and policies that should actually be loaded during ordinary Copilot work

Do not thin a review agent's own finding policy on the assumption that something else will supply the judgment. Its review boundary, quality bar, severity semantics, and output contract are what let it decide on its surface, and they are runtime policy rather than adaptation-only commentary.

When DeepReviewer or Orchestrator consumes a pre-existing review finding, preserve the result-level gate as runtime policy as well. An external finding is evidence, not a transferred threshold, severity, merge implication, or authorization to edit.

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
- model/tool names used by custom agents exist in the target environment and the settings required to activate them are enabled; confirm the agent actually receives each tool's output, not only that the identifier resolves
- each custom agent has an explicit `target` when it is intentionally limited to one execution environment; verify that the configured target matches the intended surface rather than relying on the default cross-environment availability
- Orchestrator can actually invoke configured Scout/Reviewer workers in the current VS Code/Copilot version; confirm a real subagent invocation appears in the run trace rather than accepting a narrated claim of delegation
- every effective repository-local Agent Skill root has been considered for duplicate names, conflicting workflows, and unintended selection, including standard roots (`.github/skills`, `.claude/skills`, `.agents/skills`) and additional roots declared by workspace configuration such as `chat.agentSkillsLocations`
- when an agent has terminal/execution access, the intended VS Code/Copilot approval, permission, sandbox, and network-access settings are configured to enforce any restrictions that materially matter

### Context validation

Check for:

- invented repository facts
- stale version assumptions
- duplicate rules across layers, except the narrow interface contracts described in [agent-architecture.md](agent-architecture.md#intentional-contract-duplication)
- duplicated policy that can remain plausible while silently diverging; use the staleness test in `agent-architecture.md` rather than relying on a fixed category list
- contradictory matching instructions
- giant global instruction files that should be split by path
- path-specific rules accidentally placed in always-on context
- critical facts hidden behind an `applyTo` pattern that does not cover all consumers
- template-only meta guidance left in always-on runtime context
- latest-only external evidence presented as proof for an older supported version
- reviewer formatting/UI requirements that the platform does not guarantee
- correctness that depends on an optional external MCP being available
- IDE review agents whose own finding policy is too thin to make the judgment on their surface without external help
- an Orchestrator that does not own whether a confirmed finding warrants a code change, or that skips verification because of where the finding came from
- a skill described as isolated from other surfaces by its name, directory, tools allowlist, or `context: fork`; the product documents none of these as an isolation mechanism
- review configuration treated as trusted when the change under evaluation can modify it, on GitHub.com head branches or on a pull-request branch checked out for the IDE pre-merge gate

### Behavior validation

Run repository-defined verification appropriate for the configuration/documentation change.

The structural checks above ask you to confirm that tools deliver and that delegation happens. [behavior-verification.md](behavior-verification.md#does-the-configuration-function-at-all) describes how to confirm those in a way that can be believed, and how each of them fails quietly when it fails.

Then inspect the final diff and confirm the configuration describes the target repository, not this template repository.

## Phase 6 — evaluate reviewer behavior when it matters

Copilot review is non-deterministic. A plausible-looking skill is not evidence that the reviewer behaves well.

Use small experimental PRs with positive cases and clean negative controls when reviewer behavior matters. When a surface-specific skill can be discovered by more than one surface, test whether it is selected separately from what it changes.

See [behavior-verification.md](behavior-verification.md#does-the-reviewer-find-real-defects-without-noise) for benchmark design and interpretation.

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
