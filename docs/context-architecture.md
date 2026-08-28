# Context architecture

This document defines what belongs in each Copilot context layer and how to keep those layers small, authoritative, and non-overlapping.

## Five layers

| Layer | Purpose | Typical content |
|---|---|---|
| `AGENTS.md` | Shared repository model | purpose, architecture, invariants, risky boundaries, verification map |
| `.github/copilot-instructions.md` | Universal Copilot policy + authoritative project facts | versions, supported platforms, authoritative docs, cross-surface behavior |
| `.github/instructions/*.instructions.md` | Conditional guidance | language/module/framework/security rules using `applyTo` |
| `.github/agents/*.agent.md` | VS Code agent behavior | role, model, tools, delegation, research, output contracts |
| `.github/skills/code-review/SKILL.md` | GitHub online review procedure | evidence threshold, impact analysis, semantic-misuse boundary, noise filter, finding quality bar |

A compact classification test:

```text
Repository fact/invariant?        -> AGENTS.md
Always-relevant fact/policy?      -> .github/copilot-instructions.md
Only relevant under some paths?   -> .github/instructions/*.instructions.md
IDE identity/tools/routing?       -> .github/agents/*.agent.md
GitHub PR review procedure?       -> .github/skills/code-review/SKILL.md
```

## Trust boundaries

This architecture shapes behavior; it does not enforce security.

- Copilot instructions are behavioral context, not a security boundary. Do not encode secrets in them, and do not rely on an instruction to prevent an action whose consequences matter.
- Review configuration on a pull-request head branch is PR-controlled input. A pull request can modify the instructions, skills, and templates that review it.

## `AGENTS.md`

Use `AGENTS.md` as the shared repository model.

Include only evidence-backed repository facts such as:

- purpose and important consumers
- architecture boundaries
- directory/subsystem responsibilities
- repository-wide invariants
- public compatibility boundaries
- persistence/security/concurrency/lifecycle-sensitive areas
- repository-defined verification commands
- evidence expectations

Do not put model selection, subagent routing, long review procedures, or path-specific framework rules here.

## `.github/copilot-instructions.md`

Keep this file small and always relevant.

Good content includes:

- authoritative project/toolchain/framework versions
- supported platforms
- version-matched authoritative documentation sources
- universal compatibility/change policy
- generated/vendor boundaries that truly apply repository-wide
- small high-signal review policy

Do not turn this file into a giant reviewer prompt or a language encyclopedia.

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

## `.github/agents/*.agent.md`

This template uses the following default IDE topology:

```text
User
├─ Orchestrator
│  ├─ Scout
│  └─ Reviewer
└─ DeepReviewer
   └─ Scout
```

Adapt model names and tool identifiers to the available environment, but preserve the responsibility split unless the target repository has a concrete reason to change it.

### Orchestrator

- primary implementation agent
- inspects the smallest useful local context
- implements focused changes
- runs repository-defined verification
- delegates broad/version-sensitive research to Scout
- delegates independent routine review to Reviewer

### Scout

- cheap/read-only evidence worker
- researches official docs and version-sensitive behavior
- performs broad repository mapping when needed
- returns compact traceable evidence instead of architectural decisions

### Reviewer

- read-only routine reviewer for the IDE implementation loop
- reports concrete change-attributable defects
- avoids style/preference noise
- does not pretend uncertain external facts are verified

### DeepReviewer

- human-invoked pre-merge reviewer
- may inspect a broader blast radius
- may run controlled repository-defined verification
- is the better surface for architecture, simplification, migration strategy, and design trade-offs

The IDE Reviewer and GitHub.com Code Review are different execution surfaces. Do not try to make `reviewer.agent.md` act as the online reviewer.

## `.github/skills/code-review/SKILL.md`

Keep the automatic review skill relatively thin.

Its job is to define how the online reviewer investigates, decides whether evidence is sufficient, suppresses noise, and produces actionable findings.

Domain-specific framework semantics generally belong under precise `applyTo` instructions rather than in one giant cross-language review skill.

See [review-design.md](review-design.md) for the detailed review philosophy.

## `.github/pull_request_template.md`

A useful PR description gives human and AI reviewers context that cannot be reliably inferred from a diff:

- what changed
- why it changed
- important constraints
- verification actually performed
- review focus
- known limitations/follow-ups

Do not use the PR description as permission to suppress unrelated valid findings.

## Repository size guidance

### Minimal

For a small repository without meaningful subsystem-specific conventions:

```text
AGENTS.md
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

### Typical

Add only justified path-specific instructions:

```text
.github/instructions/
├─ source.instructions.md
├─ tests.instructions.md
├─ github-actions.instructions.md
└─ security-sensitive.instructions.md
```

### Monorepo

Prefer subsystem boundaries:

```text
.github/instructions/
├─ frontend.instructions.md      applyTo: apps/frontend/**
├─ backend.instructions.md       applyTo: services/backend/**
├─ protocol.instructions.md      applyTo: proto/**
├─ infra.instructions.md         applyTo: infra/**
└─ github-actions.instructions.md
```

Do not create one giant instruction file containing every language and service rule.
