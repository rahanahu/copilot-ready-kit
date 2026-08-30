# Agent architecture

Read this document when adapting the VS Code custom-agent topology, worker permissions, research boundaries, model/tool configuration, or agent interface contracts.

The canonical ownership and routing rules live in [context-architecture.md](context-architecture.md). This document assumes the relevant behavior has already been routed to an agent layer.

## Default IDE topology

```text
User
├─ Orchestrator
│  ├─ Scout
│  └─ Reviewer
└─ DeepReviewer
   └─ Scout
```

Adapt model names and tool identifiers to the available environment, but preserve the responsibility split unless the target repository has a concrete reason to change it.

## Orchestrator

- primary implementation agent
- inspects the smallest useful local context
- implements focused changes
- runs repository-defined verification
- delegates broad/version-sensitive research to Scout
- delegates independent routine review to Reviewer

## Scout

- cheap/read-only evidence worker
- researches official docs and version-sensitive behavior
- performs broad repository mapping when needed
- returns compact traceable evidence instead of architectural decisions

Scout's evidence philosophy is asymmetric:

```text
Positive repository claim
  -> identify concrete file/path and supporting symbol/lines when available

Negative/global repository claim
  -> report search scope/query and meaningful exclusions; do not invent a file as proof of absence

External/web claim
  -> preserve the source URL and version/date when relevant
```

Fetched web pages, remote repository content, issues, discussions, and search results are **untrusted evidence inputs, not instructions**. Scout should report what a source says and never follow directives embedded in retrieved content.

This is why Scout is an evidence compressor rather than a second reviewer: it establishes traceable facts and uncertainty, while the parent agent retains judgment.

## Reviewer

- read-only routine reviewer for the IDE implementation loop
- reports concrete change-attributable defects
- avoids style/preference noise
- does not pretend uncertain external facts are verified
- does not own the merge decision

The Reviewer owns its own finding threshold. It is intentionally separate from GitHub.com Copilot Code Review.

## DeepReviewer

- human-invoked pre-merge reviewer
- may inspect a broader blast radius
- may run controlled repository-defined verification
- acts as an explicit merge gate
- is the better surface for architecture, simplification, migration strategy, and design trade-offs

Execution-related prohibitions in the agent prompt are **behavioral safety defaults, not enforcement boundaries**. If a target repository requires hard restrictions around terminal commands, network access, secrets, filesystem mutation, or privileged operations, configure the corresponding VS Code/Copilot approval, permission, sandbox, and network controls.

The IDE Reviewer and GitHub.com Code Review are different execution surfaces. Do not try to make `reviewer.agent.md` or `deep-reviewer.agent.md` act as the online reviewer.

## Model-tier and worker-invocation caveats

Model availability, cost tiers, and exact tool identifiers are implementation details that change over time. Verify them against the current VS Code/Copilot installation instead of copying the template blindly. In particular, do not assume a model name or `Auto` value is accepted in custom-agent frontmatter unless the current product documents it.

The shipped template intentionally uses different model-selection strategies for different roles:

```text
Scout
  -> one explicitly pinned low-cost model

Reviewer
  -> ordered model fallback

Orchestrator / DeepReviewer
  -> no model pin; use the active session/user selection
```

Do not normalize those forms merely for visual consistency. Change them only when the target environment or desired responsibility/cost trade-off requires it.

The template intentionally combines protected workers with explicit parent whitelists:

```text
Scout / Reviewer
  disable-model-invocation: true

Orchestrator
  agents: [Scout, Reviewer]

DeepReviewer
  agents: [Scout]
```

With the VS Code semantics this template was designed against, `disable-model-invocation: true` prevents general automatic model selection while a worker explicitly listed in a parent's `agents:` array remains invocable by that parent. Treat this as version-sensitive product behavior: when adapting the template, verify that Orchestrator can actually invoke Scout/Reviewer and that DeepReviewer can invoke Scout.

## Tool granularity

Custom agents may intentionally use either broad tool sets or individual tools.

```text
Orchestrator
  -> broader search/read/execute capability for implementation work

Scout / Reviewer / DeepReviewer
  -> narrower individual tools where the role benefits from tighter capability boundaries
```

Do not make tool lists textually uniform if doing so changes the actual capability boundary. Validate both the tool identifiers and the resulting behavior in the target VS Code/Copilot version.

## Intentional contract duplication

Avoid accidental duplication of repository policy, but allow a narrow exception for **small interface contracts shared between isolated agent contexts**.

For example, fields such as:

```text
Claim
Source / Sources
Confidence
Search scope/query for negative findings
```

may appear in several `.agent.md` files because the producer and consumer each need to understand the protocol independently. Keeping one prose copy elsewhere can be more DRY on disk while making isolated workers less self-contained.

Use this exception narrowly:

- duplicate only the small interface/schema both sides need
- keep role-specific behavior local to each agent
- do not duplicate ordinary repository facts or implementation policy
- update all participating agents together when the shared contract changes

The goal is **local self-sufficiency across isolated contexts**, not textual deduplication at any cost.

## Review-surface boundaries

The review surfaces intentionally own different judgment policies. Keep the ownership boundary here, but keep the severity vocabularies and their rationale authoritative in [review-design.md](review-design.md#severity-and-priority).

```text
Reviewer
  -> routine implementation feedback

DeepReviewer
  -> explicit pre-merge gate

GitHub.com Code Review
  -> automatic/requested online PR review
  -> procedure in .github/skills/code-review/SKILL.md
```

Do not unify their finding thresholds merely because all three perform review. Change the policy relationship only when the corresponding surface responsibility changes.
