# Context architecture

This document defines what belongs in each Copilot context layer and how to keep those layers small, authoritative, and non-overlapping.

## Context layers

| Layer | Purpose | Typical content |
|---|---|---|
| `.github/copilot-instructions.md` | Repository-wide Copilot context | purpose, high-level architecture, versions, supported platforms, repository-wide invariants, verification, universal Copilot policy |
| `.github/instructions/*.instructions.md` | Conditional guidance | language/module/framework/security rules using `applyTo` |
| `.github/agents/*.agent.md` | VS Code agent behavior | role, model, tools, delegation, research, judgment thresholds, output contracts |
| `.github/skills/*/SKILL.md` | On-demand reusable workflows | investigation procedures, task-specific expertise, deterministic helpers, specialized review techniques |
| `AGENTS.md` | Optional portable or directory-hierarchical agent context | shared repository model when portability beyond Copilot or `AGENTS.md` hierarchy is intentionally required |

## Copilot-only default

This template is designed primarily for repositories that use **GitHub Copilot**. In a Copilot-only repository, `AGENTS.md` is **not required by default**.

Prefer `.github/copilot-instructions.md` as the single repository-wide source of always-relevant Copilot context, including project purpose, high-level architecture, supported versions/platforms, important repository-wide invariants, and the verification map. Use `.github/instructions/*.instructions.md` to narrow subsystem- or path-specific rules.

Add `AGENTS.md` only when the target repository has a concrete reason, such as:

- the same repository context must be portable to non-Copilot AI agents that support `AGENTS.md`
- the repository intentionally uses directory-local `AGENTS.md` files as a hierarchical context mechanism
- an existing toolchain or team workflow already treats `AGENTS.md` as an authoritative interface

Do not create `AGENTS.md` merely because this template contains an example. When Copilot is the only consumer, duplicating repository knowledge between `AGENTS.md` and `copilot-instructions.md` adds maintenance cost without a clear routing benefit.

## Routing test

This is the canonical routing test for the whole template. Apply it to every piece of guidance before writing it anywhere.

```text
Does almost every Copilot task need this repository fact, invariant,
version/platform baseline, architecture summary, verification command,
or universal policy?
  -> .github/copilot-instructions.md

A rule that applies only to a subsystem, language, framework, or security surface?
  -> .github/instructions/*.instructions.md + precise applyTo

An IDE agent's role, model, tools, delegation, judgment policy, or output contract?
  -> .github/agents/*.agent.md

A reusable investigation or task workflow needed only when relevant?
  -> .github/skills/<skill-name>/SKILL.md

How GitHub PR review investigates and decides when to comment?
  -> .github/skills/code-review/SKILL.md

Need portable repository context outside GitHub Copilot, or intentionally using
hierarchical directory-local agent context?
  -> AGENTS.md
```

Do not duplicate the same detailed rule across several layers just to make it more visible. A rule repeated in several places has several chances to go stale and no single owner.

### Hierarchical classification when a rule seems to fit several layers

Do not classify guidance by topic alone. The same topic — security, concurrency, compatibility, testing, or a framework — can legitimately appear in different layers depending on **what kind of information it is and when it should load**.

For a Copilot-only repository, classify in this order:

```text
1. Is this repository-wide knowledge or policy that is useful to almost every
   Copilot task?
   YES -> .github/copilot-instructions.md

2. Is it a repository rule that is true only for particular files,
   subsystems, languages, frameworks, or security surfaces?
   YES -> .github/instructions/*.instructions.md + precise applyTo

3. Does it define an AI role's identity, authority, tools, delegation,
   investigation boundary, judgment threshold, or output contract?
   YES -> .github/agents/*.agent.md

4. Does it describe how to perform a reusable task or investigation that
   should load only when that task is relevant?
   YES -> .github/skills/<skill-name>/SKILL.md

5. Is it specifically the finding threshold and investigation procedure for
   GitHub automatic pull-request review?
   YES -> .github/skills/code-review/SKILL.md

6. Is there an explicit portability or directory-hierarchy requirement that
   is better served by AGENTS.md?
   YES -> AGENTS.md
```

The order matters. First decide the **loading scope** of repository knowledge, then decide whether the information instead belongs to an agent role or reusable workflow. Do not move repository facts into a skill just because the skill happens to use them, and do not turn a workflow into an always-on instruction merely because several agents may need it.

A useful test is to rewrite the statement as a sentence:

```text
"This repository is / must ... and almost every Copilot task needs to know it."
  -> copilot-instructions.md

"When files under this boundary change, this invariant must ..."
  -> path-specific instruction

"This agent may / must / must not ..."
  -> agent

"To investigate or perform this task, follow these steps ..."
  -> skill

"This context must also work outside Copilot / follow directory hierarchy ..."
  -> AGENTS.md may be justified
```

For example, concurrency-related information can land in different places:

```text
"Callbacks from component X are serialized on one worker thread."
  -> repository-wide fact if broadly relevant: copilot-instructions.md
  -> subsystem-only fact if narrow: matching *.instructions.md

"Code under src/realtime/** must not block inside the callback."
  -> path-specific invariant: *.instructions.md

"Reviewer must not report an uncertain race as a confirmed finding."
  -> Reviewer judgment policy: reviewer.agent.md

"To investigate a race, map shared state, readers/writers, synchronization,
 ordering, cancellation, retries, and idempotency."
  -> reusable investigation procedure: concurrency-review/SKILL.md
```

If the same detailed statement still appears to belong in two layers after this test, split it into the underlying repository fact and the behavior that consumes that fact. Prefer one authoritative owner for each statement rather than duplication.

## Trust boundaries

This architecture shapes behavior; it does not enforce security.

- Copilot instructions are behavioral context, not a security boundary. Do not encode secrets in them, and do not rely on an instruction to prevent an action whose consequences matter.
- Review configuration on a pull-request head branch is PR-controlled input. A pull request can modify the instructions, skills, and templates that review it.

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
- small high-signal review policy that genuinely applies across Copilot surfaces

Do not turn this file into a giant reviewer prompt, framework encyclopedia, or detailed subsystem manual. Narrow rules with `applyTo`, and move reusable task procedures to skills.

## `AGENTS.md`

Treat `AGENTS.md` as an **optional architecture choice**, not a mandatory layer.

Use it when portability across multiple AI-agent ecosystems or directory-local hierarchical context is a real requirement. If used, give it a clearly distinct ownership boundary and avoid copying the same repository facts verbatim into `.github/copilot-instructions.md`.

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
