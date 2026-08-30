# Skill architecture

Read this document when deciding whether knowledge belongs in a reusable Agent Skill, when tuning skill discovery, or when a skill is becoming large enough to need progressive disclosure.

The canonical ownership and routing rules live in [context-architecture.md](context-architecture.md). This document assumes the relevant behavior has already been routed to a skill layer.

## Skills are reusable task procedures

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

## Skill boundaries

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
code-tutor
```

Do not create a skill merely to hold one repository rule. If the rule is true only for particular files or subsystems, prefer an `applyTo` instruction. Do not move an agent's reporting threshold, authority, or review personality into a shared skill just to deduplicate text.

## Skill selection

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

Do not turn an agent file into a hard-coded routing table for every skill. Let skill metadata carry most of the discovery burden, and add agent-side guidance only when a workflow needs an explicit guarantee that relevant skills are considered or excluded.

## Skill size and progressive disclosure

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

## The special `code-review` skill

`.github/skills/code-review/SKILL.md` is a **surface-specific review policy**, not a general-purpose investigation skill.

Its job is to define how the GitHub online reviewer investigates, decides whether evidence is sufficient, suppresses noise, and produces actionable findings. The IDE Reviewer and DeepReviewer own separate judgment policies in their agent files.

Keep the automatic review skill relatively thin. Domain-specific framework semantics generally belong under precise `applyTo` instructions. Reusable specialist investigation can live in separate skills. Neither belongs in one giant cross-language review prompt.

Because review tasks also occur in VS Code, make the intended surface explicit in the `code-review` skill metadata and in the IDE review agents when needed. The goal is to prevent the GitHub automatic-review judgment policy from silently changing routine IDE review or the pre-merge gate.

This boundary is a legitimate small interface contract between isolated execution surfaces, not a reason to duplicate the full review procedure into several files.

See [review-design.md](review-design.md) for the automatic-review evidence bar, severity rationale, version matching, and external-research policy.
