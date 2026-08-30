# Instruction architecture

Read this document when adapting repository-wide instructions, path-scoped instructions, authoritative documentation sources, an optional `AGENTS.md` layer, or repository configuration composition.

The canonical ownership and routing rules live in [context-architecture.md](context-architecture.md). This document explains the details after a rule has already been routed to an instruction or repository-configuration layer.

## `.github/copilot-instructions.md`

In a Copilot-only repository, this is the primary repository-wide context layer. Keep it compact enough that its contents remain useful whenever Copilot operates in the repository.

Good content includes:

- repository purpose and a concise high-level architecture map
- authoritative project/toolchain/framework versions
- supported platforms
- repository-wide invariants and compatibility boundaries
- version-matched authoritative documentation sources
- generated/vendor boundaries that truly apply repository-wide
- repository-defined build/test/lint/static-analysis verification map
- universal compatibility/change policy

Review finding thresholds do not belong here. The IDE review surfaces and GitHub automatic review own their own judgment policies; see [context-architecture.md](context-architecture.md#review-policy-ownership).

Do not turn this file into a giant reviewer prompt, framework encyclopedia, detailed subsystem manual, or adaptation guide. Narrow rules with `applyTo`, and move reusable task procedures to skills.

## Authoritative documentation registry

A repository-wide documentation registry should answer two questions:

```text
Which source is authoritative for this technology?
Which project version/distribution must that source match?
```

Prefer exact versioned URLs when stable version-specific documentation exists. A documentation domain/root is acceptable when paths vary, but pair it with the declared target version/distribution. A domain alone does not prevent a research worker from treating rolling/latest documentation as evidence for an older supported baseline.

Keep the split clear:

```text
copilot-instructions.md
  -> project version/distribution
  -> authoritative documentation source

Scout agent
  -> how to search, verify version matching, and report evidence

path-specific instructions
  -> implementation semantics for matching code
```

Do not turn the registry into a generic bookmark list. Record sources only when they materially guide technical evidence for the repository.

## Optional `AGENTS.md`

Treat `AGENTS.md` as an **optional architecture choice**, not a mandatory layer.

Add it only when the target repository has a concrete reason, such as:

- the same repository context must be portable to non-Copilot AI agents that support `AGENTS.md`
- the repository intentionally uses directory-local `AGENTS.md` files as a hierarchical context mechanism
- an existing toolchain or team workflow already treats `AGENTS.md` as an authoritative interface

If used, give it a clearly distinct ownership boundary and avoid copying the same repository facts verbatim into `.github/copilot-instructions.md`.

Possible content includes evidence-backed repository context such as purpose, architecture, invariants, risky boundaries, and verification — but only when `AGENTS.md` has a justified consumer or hierarchy role.

Do not put model selection, subagent routing, long review procedures, or path-specific framework rules here. In a Copilot-only repository with no hierarchical `AGENTS.md` requirement, omit the file and route repository-wide context to `.github/copilot-instructions.md` instead.

## `.github/instructions/*.instructions.md`

Create path-specific instructions only when the target repository has real domain-specific rules.

Prefer semantic boundaries over broad extensions.

Bad:

```yaml
applyTo: '**/*.yml'
```

Better:

```yaml
applyTo: 'playbooks/roles/**/tasks/**/*.yml,playbooks/roles/**/handlers/**/*.yml'
```

and separately:

```yaml
applyTo: '.github/workflows/**/*.yml,.github/workflows/**/*.yaml'
```

Write rules as invariants with consequences, not taste.

A strong path-specific rule has this shape:

```text
Trigger       When does this rule apply?
Invariant     What must remain true?
Failure mode  What concrete bad behavior follows if violated?
Evidence      What should Copilot inspect before commenting?
Escape hatch  What evidence means the code is actually safe?
```

Example — Angular signals:

```md
- Treat values purely derived from existing signals as derived state.
- Flag `effect()` that copies a pure derivation into writable state only when it creates a second source of truth, eager synchronization, or update-order/lifecycle dependence.
- Prefer `computed()` when the value has no independent mutation semantics.
- Do not flag effects whose purpose is external synchronization such as browser APIs, persistence, analytics, network I/O, focus, or imperative third-party APIs.
- Do not comment merely because `computed()` is shorter.
```

The important boundary is semantic consequence, not preferred syntax.

## Common `applyTo` pitfalls

1. **Hiding repository-wide version facts behind a language glob.** A version such as a ROS distribution may also matter to manifests, build files, CI, docs, and external research. Put broadly required compatibility facts in `copilot-instructions.md`.
2. **Hiding authoritative documentation sources behind `applyTo`.** Research may happen without opening a matching source file. Keep repository-wide source-of-truth facts always available.
3. **Making `applyTo` too broad.** Routine `applyTo: '**'` defeats conditional context; promote a genuinely universal rule to `copilot-instructions.md` instead.
4. **Making `applyTo` too narrow.** A `**/*.cpp` rule may disappear for headers, wrappers, tests, or build files that participate in the same semantic boundary. Inspect the actual repository layout first.
5. **Omitting or depending on incidental instruction selection.** Critical path rules should have an intentional matching boundary rather than relying on manual attachment or accidental context.
6. **Relying on semantic discovery for critical constraints.** Descriptions help discovery, but versions, safety boundaries, compatibility requirements, and authoritative sources should have deterministic placement.
7. **Accidentally duplicating policy across layers.** Do not copy the same repository rule into `copilot-instructions.md`, path instructions, and several agents merely for visibility.
8. **Forgetting that globs encode repository structure.** Re-check patterns after directory or monorepo reorganizations.
9. **Assuming instruction order is a correctness mechanism.** Avoid designs that only work if overlapping instruction files happen to be processed in a particular order; make boundaries non-conflicting and explicit.
10. **Using file extensions when the real boundary is semantic.** YAML for Ansible, GitHub Actions, Kubernetes, and Compose should not share one generic rule set merely because the syntax is YAML.

## PR description contract

A useful PR description gives human and AI reviewers context that cannot be reliably inferred from a diff:

- what changed
- why it changed
- important constraints
- verification actually performed
- review focus
- known limitations/follow-ups

Do not use the PR description as permission to suppress unrelated valid findings.

## Repository composition examples

### Minimal Copilot-only repository

For a small repository without meaningful subsystem-specific conventions:

```text
.github/
├─ copilot-instructions.md
├─ pull_request_template.md
├─ agents/
│  ├─ orchestrator.agent.md
│  ├─ scout.agent.md
│  ├─ reviewer.agent.md
│  └─ deep-reviewer.agent.md
└─ skills/code-review/SKILL.md
```

`AGENTS.md` is intentionally absent. Add it only when portability or hierarchical agent context is a requirement.

### Typical

Add only justified path-specific instructions and reusable skills:

```text
.github/
├─ instructions/
│  ├─ source.instructions.md
│  ├─ tests.instructions.md
│  ├─ github-actions.instructions.md
│  └─ security-sensitive.instructions.md
└─ skills/
   ├─ code-review/SKILL.md
   ├─ code-tutor/SKILL.md
   └─ compatibility-review/SKILL.md
```

### Monorepo

Prefer `applyTo` subsystem boundaries for Copilot-specific repository rules and task boundaries for reusable skills:

```text
.github/instructions/
├─ frontend.instructions.md      applyTo: apps/frontend/**
├─ backend.instructions.md       applyTo: services/backend/**
├─ protocol.instructions.md      applyTo: proto/**
├─ infra.instructions.md         applyTo: infra/**
└─ github-actions.instructions.md
```

If the monorepo also needs portable or directory-hierarchical agent context, `AGENTS.md` can still be introduced deliberately. Do not create one giant instruction file containing every language and service rule, and do not create one giant skill containing every specialist workflow.
