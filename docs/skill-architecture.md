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
  -> whether that evidence is strong enough for GitHub.com Copilot Code Review
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

Skill discovery depends heavily on skill metadata. Treat `name` and especially `description` as the routing surface that helps an agent recognize when a skill is relevant.

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

Keep metadata focused on positive selection signals. Do not overload `description` with a long exclusion policy for other execution surfaces; a skill that needs an authority boundary should state that boundary in its body so the rule travels with the loaded instructions.

Do not turn an agent file into a hard-coded routing table for every skill. Let skill metadata carry most of the discovery burden, and add agent-side guidance only when the agent itself owns a decision that must remain authoritative.

## Cross-surface discovery and authority

Agent Skills are a shared mechanism rather than a GitHub.com-only mechanism. The same project skill roots can be discovered by multiple Copilot environments, including VS Code agent mode. Treat placement under a recognized skill directory and a review-oriented skill name as **selection/inclusion signals, not surface isolation**.

Standard project skill roots include:

```text
.github/skills/
.claude/skills/
.agents/skills/
```

Do not assume those three directories are the complete effective project skill set. VS Code can add project skill locations with `chat.agentSkillsLocations`; relative locations are resolved from workspace roots. A repository can therefore introduce additional skill roots through workspace settings such as `.vscode/settings.json`, making that configuration another repository-controlled skill-discovery input that adaptation must inspect.

Personal/user-level skill locations can also contribute skills outside the repository. Depending on the consumer, these include `~/.copilot/skills/`, `~/.agents/skills/`, and in VS Code `~/.claude/skills/`. Personal customizations are environment inputs rather than repository-controlled policy.

For ordinary VS Code skills, Copilot selects a skill from its metadata and loads the `SKILL.md` instructions inline into the parent agent context. Do not assume a custom agent's narrow `tools` allowlist prevents this ordinary inline loading. VS Code's dedicated skill tool is documented for the separate experimental `context: fork` mechanism; it is not the documented gate for ordinary inline skill discovery.

This produces three distinct concerns:

```text
Selection guidance
  -> name / description help Copilot decide whether to load the skill

Policy authority
  -> the loaded content states which execution surface owns its policy

Platform enforcement
  -> a product mechanism would prevent loading or execution
```

Do not describe a behavioral authority declaration as platform enforcement. When no documented surface-specific exclusion mechanism exists for the intended consumers, the realistic design goal is:

```text
accidental loading != accidental authority
```

That goal still depends on model behavior. Keep the policy owner on each runtime surface concrete and self-contained; an authority sentence is a conflict-resolution aid, not a substitute for the local policy. Authority changes must come from configuration changes, not from an agent deciding at runtime to adopt competing judgment policy. See [agent-architecture.md](agent-architecture.md#self-contained-review-policy-invariant).

### Why `context: fork` is not the isolation mechanism

VS Code's experimental `context: fork` mode was considered for the surface-specific `code-review` skill and intentionally rejected as an isolation strategy.

A fork keeps the skill instructions out of the parent context, but only the forked skill's final result returns to the parent. For a review-policy skill, that moves the failure mode rather than removing it: an online-oriented finding threshold can be applied inside the fork and return an already-judged finding that the IDE workflow then receives as result-level input. The parent authority rule can no longer resolve a conflict between two visible policies because the competing policy text is no longer present.

In addition, VS Code documents `context: fork` as an experimental feature enabled by a user setting. Do not assume other Agent-Skills consumers implement the same fork semantics. Do not add `context: fork` to the shipped `code-review` skill merely to create surface isolation; use it only for a workflow whose execution and result semantics independently justify a fork in every intended consumer.

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

`.github/skills/code-review/SKILL.md` is a **review policy designed for the GitHub.com Copilot Code Review surface**, not a general-purpose investigation skill. This describes intended authority; it does not guarantee that another Agent-Skills-capable surface cannot discover the file.

Its job is to define how the GitHub.com online reviewer investigates, decides whether evidence is sufficient, suppresses noise, and produces actionable findings. The IDE Reviewer and DeepReviewer own separate self-contained judgment policies in their agent files, while Orchestrator owns IDE review coordination and the decision to change code in response to a confirmed finding.

Use two complementary signals without coupling runtime agents to this file path:

```text
Skill metadata
  -> positively and narrowly describes GitHub.com Copilot Code Review use

Surface scope in SKILL.md
  -> states that this policy is authoritative on that surface and is not
     authoritative if the document appears elsewhere
```

IDE runtime agents should state their own authority and a generic conflict rule. They should not need to know the name or location of this skill. Runtime adoption of competing review judgment policy is not an escape hatch; changing authority requires changing configuration. The design documentation may describe the relationship because these `docs/` files are not shipped as runtime agent context during adaptation.

Keep the automatic review skill relatively thin. Domain-specific framework semantics generally belong under precise `applyTo` instructions. Reusable specialist investigation can live in separate skills. Neither belongs in one giant cross-language review prompt.

This surface boundary is behavioral, not enforcement. Do not add a product-specific exclusion switch or change skill invocation metadata merely to create isolation unless the target product documents that behavior for every intended consumer and it has been validated.

See [review-design.md](review-design.md) for the automatic-review evidence bar, severity rationale, version matching, and external-research policy.
