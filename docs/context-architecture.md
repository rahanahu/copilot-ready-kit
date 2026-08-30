# Context architecture

This document defines what belongs in each Copilot context layer and how to keep those layers small, authoritative, and non-overlapping.

## Five layers

| Layer | Purpose | Typical content |
|---|---|---|
| `AGENTS.md` | Shared repository model | purpose, architecture, invariants, risky boundaries, verification map |
| `.github/copilot-instructions.md` | Universal Copilot policy + authoritative project facts | versions, supported platforms, authoritative docs, cross-surface behavior |
| `.github/instructions/*.instructions.md` | Conditional guidance | language/module/framework/security rules using `applyTo` |
| `.github/agents/*.agent.md` | VS Code agent behavior | role, model, tools, delegation, research, output contracts |
| `.github/skills/*/SKILL.md` | On-demand reusable workflows | investigation procedures, task-specific expertise, deterministic helpers, specialized review techniques |

## Routing test

This is the canonical routing test for the whole template. Apply it to every piece of guidance before writing it anywhere.

```text
Repository purpose, architecture, invariants, or verification?
  -> AGENTS.md

A fact or policy almost every Copilot task needs?
  -> .github/copilot-instructions.md

A rule that applies only to a subsystem, language, framework, or security surface?
  -> .github/instructions/*.instructions.md + precise applyTo

An IDE agent's role, model, tools, delegation, or output contract?
  -> .github/agents/*.agent.md

A reusable investigation or task workflow needed only when relevant?
  -> .github/skills/<skill-name>/SKILL.md

How GitHub PR review investigates and decides when to comment?
  -> .github/skills/code-review/SKILL.md
```

Do not duplicate the same detailed rule across several layers just to make it more visible. A rule repeated in three places has three chances to go stale and no single owner.

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

## `.github/skills/*/SKILL.md`

Use skills for reusable procedures or specialized investigation that should load only when relevant. A skill should teach an agent **how to perform a task**, not redefine the agent's identity or duplicate repository facts.

A useful split is:

```text
Agent
  -> role, authority, tools, delegation, judgment policy

Skill
  -> reusable investigation/workflow and specialized task knowledge

Path-specific instruction
  -> repository invariant or semantic rule for matching files
```

For review-related skills, keep the distinction especially clear:

```text
security-review skill
  -> where to look, what evidence to gather, common failure modes

Reviewer agent
  -> whether that evidence is strong enough to report locally

code-review skill
  -> whether that evidence is strong enough for GitHub automatic review
```

This allows the same investigative skill to support different review surfaces without forcing them to use the same finding threshold.

### Skill boundaries

Create a separate skill when the procedure:

- is useful across multiple tasks or agents
- has a recognizable trigger or problem class
- requires a repeatable investigation sequence
- contains specialized knowledge that should not occupy always-on context
- can be explained independently of one particular agent's identity

Typical examples include:

```text
security-review
concurrency-review
compatibility-review
migration-review
diagnose
```

Do not create a skill merely to hold one repository rule. If the rule is true only for particular files or subsystems, prefer an `applyTo` instruction. Do not move an agent's reporting threshold, authority, or review personality into a shared skill just to deduplicate text.

### Skill selection

Skill discovery depends heavily on the skill metadata. Treat `name` and especially `description` as the routing surface that helps an agent recognize when the skill is relevant.

A useful description says both **what the skill does** and **when to use it**. Include concrete trigger concepts rather than vague labels.

Weak:

```yaml
description: Helps with security.
```

Stronger:

```yaml
description: >
  Investigate security-sensitive changes involving authentication,
  authorization, secrets, injection, trust boundaries, or dependency risk.
  Use during implementation or review when changed code touches these areas.
```

Do not turn an agent file into a hard-coded routing table for every skill. Let skill metadata carry most of the discovery burden, and add agent-side guidance only when a workflow needs an explicit guarantee that relevant skills are considered.

### Skill size and progressive disclosure

Keep `SKILL.md` focused on the workflow that must be understood whenever the skill is selected. Move detailed reference material or deterministic helpers out of the main file when they are only needed for some cases.

Practical sizing guidance:

```text
50-150 lines
  preferred for a focused skill

150-250 lines
  reasonable for a complex multi-step workflow

>250 lines
  review whether detailed material should move to references/, scripts/,
  or a separate skill with a clearer trigger
```

These are design heuristics, not platform limits. A short skill is not automatically good, and a long skill is not automatically wrong; the goal is to avoid loading detail that the selected workflow does not need.

A scalable skill directory can look like:

```text
.github/skills/security-review/
├─ SKILL.md
├─ references/
│  ├─ authentication.md
│  └─ trust-boundaries.md
└─ scripts/
   └─ collect-security-signals.sh
```

Use:

- `SKILL.md` for the task objective, investigation sequence, decision procedure, and when to load supporting material
- `references/` for detailed knowledge that only some cases need
- `scripts/` for deterministic operations that are safer or cheaper to execute than to restate procedurally

Prefer one cohesive workflow per skill. If two sections have different triggers and can be useful independently, they are usually better as separate skills.

## `.github/skills/code-review/SKILL.md`

`code-review` is a special review-surface skill rather than a general-purpose investigation skill.

Keep the automatic review skill relatively thin. Its job is to define how the GitHub online reviewer investigates, decides whether evidence is sufficient, suppresses noise, and produces actionable findings.

Domain-specific framework semantics generally belong under precise `applyTo` instructions. Reusable specialist investigation can live in separate skills. Neither belongs in one giant cross-language review prompt.

See [review-design.md](review-design.md) for the reasoning behind the skill's evidence bar, and for the version-matching and external-research policies that sit outside it.

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
   ├─ security-review/SKILL.md
   └─ compatibility-review/SKILL.md
```

### Monorepo

Prefer subsystem boundaries for repository rules and task boundaries for reusable skills:

```text
.github/instructions/
├─ frontend.instructions.md      applyTo: apps/frontend/**
├─ backend.instructions.md       applyTo: services/backend/**
├─ protocol.instructions.md      applyTo: proto/**
├─ infra.instructions.md         applyTo: infra/**
└─ github-actions.instructions.md
```

Do not create one giant instruction file containing every language and service rule, and do not create one giant skill containing every specialist workflow.
