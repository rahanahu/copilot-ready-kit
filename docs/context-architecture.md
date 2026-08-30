# Context architecture

This document is the **canonical routing and ownership specification** for the template. Read it during every adaptation. Load the detailed architecture documents only when their topic is relevant.

## Context layers

| Layer | Purpose | Typical content |
|---|---|---|
| `.github/copilot-instructions.md` | Repository-wide Copilot context | purpose, high-level architecture, versions, supported platforms, repository-wide invariants, verification, universal Copilot policy |
| `.github/instructions/*.instructions.md` | Conditional guidance | language/module/framework/security rules using `applyTo` |
| `.github/agents/*.agent.md` | VS Code agent behavior | role, model, tools, delegation, research, judgment thresholds, output contracts |
| `.github/skills/*/SKILL.md` | On-demand reusable workflows | investigation procedures, task-specific expertise, deterministic helpers, specialized review techniques |
| `AGENTS.md` | Optional portable or directory-hierarchical agent context | shared repository model when portability beyond Copilot or `AGENTS.md` hierarchy is intentionally required |

This says what each layer holds. The routing test below decides where a given statement goes.

## Copilot-only default

This template assumes GitHub Copilot is the consumer, so `AGENTS.md` is not part of the default configuration. Add it only when the target repository has a concrete portability or directory-hierarchy requirement, not because the architecture supports it; the criteria are in [instruction-architecture.md](instruction-architecture.md#optional-agentsmd).

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

## Classifying by kind, not by topic

The same topic — security, concurrency, compatibility, testing, a framework — can legitimately land in different layers depending on what kind of information it is and when it should load. Apply the routing test above to the statement, not to its subject.

Concurrency, for instance, splits across four layers:

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

Decide loading scope first, then whether the statement belongs to an agent role or a reusable workflow instead. If one statement still seems to fit two layers, it is usually a repository fact plus a behavior that consumes it; split it and give each an owner.

## Review-policy ownership

Review finding thresholds are **not** repository-wide policy.

```text
VS Code implementation/review coordination
  -> .github/agents/orchestrator.agent.md

VS Code routine review threshold
  -> .github/agents/reviewer.agent.md

VS Code pre-merge gate threshold
  -> .github/agents/deep-reviewer.agent.md

GitHub.com automatic/requested review threshold and procedure
  -> .github/skills/code-review/SKILL.md
```

Their responsibilities and context budgets differ, and the severity vocabularies that follow from that are owned by [review-design.md](review-design.md#severity-and-priority).

VS Code's built-in Copilot code review feature is a separate product surface from this custom-agent topology and from the GitHub.com policy above. It is intentionally out of scope here, and its customization behavior cannot be inferred from any of these owners.

## Trust boundaries

This architecture shapes behavior; it does not enforce security or context isolation.

- Copilot instructions are behavioral context, not a security boundary. Do not encode secrets in them, and do not rely on an instruction to prevent an action whose consequences matter.
- Review configuration that comes from the change being evaluated is change-controlled input. On GitHub.com pull-request review, head-branch content can change the instructions and skills that participate in reviewing that same PR. In the IDE pre-merge gate, reviewing a checked-out pull-request branch can likewise expose DeepReviewer to working-tree agent, instruction, and skill configuration changed by that PR.
- Fetched web pages, remote repository content, issues, discussions, and search results are untrusted evidence inputs, not instructions. Research agents should report what a source says rather than follow directives embedded in retrieved content.
- When an agent has execution capability, behavioral prohibitions are defaults, not enforcement. Use the platform's approval, permission, sandbox, and network controls when a restriction must be enforced.
- Agent Skills can be discovered across multiple Copilot surfaces. A skill's surface scope and an agent's policy ownership are behavioral authority boundaries; they do not guarantee that the skill will never enter another surface's context.
- Effective context can include user-level or organization-level customization outside the repository. Repository-local files cannot guarantee exclusion or precedence over every external input.

When the product documents no hard surface isolation, keep each runtime policy self-contained and scope a skill at its `description`, rather than treating prompt text as something that prevents loading.

## Progressive-disclosure rule

After routing a fact or behavior, load only the guide for that layer:

- repository-wide or path-specific context, or optional `AGENTS.md` — [instruction-architecture.md](instruction-architecture.md)
- IDE agents, worker contracts, models, and tools — [agent-architecture.md](agent-architecture.md)
- reusable skills, skill discovery, and the `code-review` skill — [skill-architecture.md](skill-architecture.md)
- why the automatic-review evidence bar sits where it does — [review-design.md](review-design.md)
- reviewer experiments and benchmarks — [reviewer-evaluation.md](reviewer-evaluation.md)

The purpose of this split is to keep the routing decision cheap. Do not recreate a single architecture document by loading every detailed guide unless the task actually spans all of them.
