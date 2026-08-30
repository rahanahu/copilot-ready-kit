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

### Scoping a skill to one consumer

When a skill is written for one consumer and should not be applied by others, put the distinction in the `description`. That is where the selection decision is made, so it is the only place a boundary can prevent loading rather than merely qualify it afterwards.

Name the consumer with facts a reader can check about its own situation. A product name asks the reader to know a taxonomy, and the individual words in it will often match the situation anyway:

```yaml
# weak — every word matches an editor agent reviewing a pull request
description: Pull-request review procedure for GitHub.com Copilot Code Review.
```

`Copilot`, `pull request`, and `GitHub` are each true of an editor session working on a branch destined for a pull request. Nothing in that sentence is falsifiable from the inside.

```yaml
# stronger — each clause can be checked against the current task
description: >
  Used only by GitHub's server-side pull-request reviewer: the automated reviewer
  that GitHub itself invokes when a pull request is opened or a review is
  requested, and whose findings are posted as inline comments on that pull
  request. Apply this procedure when the current task is producing that posted
  review. When a person asks for a review in an editor, a terminal, or a chat
  session, that surface supplies its own review policy and finding threshold.
```

Who invoked this task, what the output is, and where it goes are all answerable without knowing any product taxonomy. Naming the other consumer positively — as a surface with its own policy — discriminates without turning the description into an exclusion list.

Length is acceptable here as long as the added words are about **who and when**. Adding more of the skill's own subject vocabulary widens the match; adding consumer and trigger facts narrows it.

Do not turn an agent file into a hard-coded routing table for every skill. Let skill metadata carry most of the discovery burden, and add agent-side guidance only when the agent itself owns a decision that must remain authoritative.

## Cross-surface discovery

Agent Skills are a shared mechanism rather than a GitHub.com-only one. The same project skill roots are read by several Copilot environments, VS Code agent mode among them. Placement under a recognized skill directory and a task-shaped skill name are **inclusion signals, not surface isolation**.

Standard project skill roots:

```text
.github/skills/
.claude/skills/
.agents/skills/
```

Those three are not necessarily the whole set. VS Code can add project skill locations through `chat.agentSkillsLocations`, with relative locations resolved from workspace roots, so a committed `.vscode/settings.json` is itself a repository-controlled skill-discovery input that adaptation must inspect. Personal locations — `~/.copilot/skills/`, `~/.agents/skills/`, and in VS Code `~/.claude/skills/` — contribute skills the repository cannot see or control; treat them as environment inputs.

For ordinary skills, Copilot matches on metadata and loads `SKILL.md` inline into the context of the agent that selected it. Two consequences follow.

A narrow `tools` allowlist on a custom agent does not prevent this. Ordinary loading is not tool-mediated, so there is nothing for the allowlist to withhold.

Loading reaches the agent the user is addressing. In this template's topology a skill selected during an Orchestrator task enters Orchestrator's context; the Reviewer subagent it delegates to was not observed to receive it. The visible symptom is that the parent restates the subagent's findings in the skill's vocabulary — a severity scale swap rather than an error.

Because loading happens after selection, the `description` is where a skill's intended consumer can actually be enforced. See [Scoping a skill to one consumer](#scoping-a-skill-to-one-consumer). Nothing here is platform enforcement: a skill written for one surface can still be selected on another, and the design goal is that being loaded does not make a foreign policy authoritative.

### `context: fork` and what it is for

VS Code documents `context: fork` as an **experimental** option, enabled by the `github.copilot.chat.skillTool.enabled` setting. Ordinary skills load their `SKILL.md` inline into the parent's context; a forked skill instead runs in a dedicated subagent and returns only its final result.

Fork changes where a skill runs, not whether it runs. Selection is unchanged, the skill still executes, and its judgment still reaches the parent — as an already-formed result rather than as reviewable policy text.

Use it for context economy: a long investigation skill whose intermediate reasoning is noise to the parent, where only the conclusion matters. That is the same reasoning behind giving Scout its own context and asking it for a compact evidence packet.

Do not reach for it as a policy boundary. For "this skill should not apply here" the decision happens at selection, before any of this takes effect; see [Scoping a skill to one consumer](#scoping-a-skill-to-one-consumer).

Three things to weigh before adopting it:

- a returned result carries no visible trace of the policy that produced it, so a threshold mismatch cannot be spotted the way it can when the policy text is present
- the enabling setting belongs to the user, not the repository, so behavior differs between environments
- other Agent-Skills consumers are not documented to implement the same fork semantics; a skill that depends on fork may behave differently where it is not honored

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
