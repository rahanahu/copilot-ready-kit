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

The shipped agents set `target: vscode` because this topology is intentionally an IDE workflow. Current custom-agent configuration supports environment targeting as a configuration-level boundary; omitting `target` makes an agent available in both VS Code and GitHub Copilot environments. Without `target: vscode`, these IDE-tuned profiles can therefore be selected in an execution environment their review thresholds, output contracts, and coordination rules were not written for. Preserve `target: vscode` unless the target repository intentionally wants the same agent profile in another supported environment.

This target setting scopes the **custom agent**, not Agent Skill discovery or Copilot Code Review. GitHub documents `github-copilot` as the other custom-agent target but does not define that value as the Code Review surface. Do not infer that `target: vscode` is a general online-review exclusion mechanism or that `target: github-copilot` specifically means Copilot Code Review.

Adapt model names and tool identifiers to the available environment, but preserve the responsibility split unless the target repository has a concrete reason to change it.

## Orchestrator

- primary implementation agent
- inspects the smallest useful local context
- implements focused changes
- runs repository-defined verification
- delegates broad/version-sensitive research to Scout
- delegates independent routine review to Reviewer

Orchestrator is the most consequential place for review-policy confusion because it can edit the repository. A polluted review decision can become an unnecessary or incorrect code change rather than merely a noisy comment. Keep its review-coordination authority explicit.

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

This is why Scout is an evidence compressor rather than a second reviewer: it establishes traceable facts and uncertainty, while the parent agent retains judgment. Scout does not need a review-policy ownership declaration because it does not own finding thresholds or review decisions.

## Reviewer

- read-only routine reviewer for the IDE implementation loop
- reports concrete change-attributable defects
- avoids style/preference noise
- does not pretend uncertain external facts are verified
- does not own the merge decision

Reviewer owns its finding threshold and severity policy for routine IDE review.

## DeepReviewer

- human-invoked pre-merge reviewer
- may inspect a broader blast radius
- may run controlled repository-defined verification
- acts as an explicit merge gate
- is the better surface for architecture, simplification, migration strategy, and design trade-offs

DeepReviewer owns its finding threshold, severity policy, and merge assessment for the IDE pre-merge gate. Review findings supplied from outside that review are evidence only; their originating threshold, severity, or merge implication does not transfer into DeepReviewer's assessment.

When DeepReviewer runs against a checked-out pull-request branch, the working tree can contain agent, instruction, and skill configuration changed by that same pull request. Configuration under review is not trusted merely because it configures the reviewer.

Execution-related prohibitions in the agent prompt are **behavioral safety defaults, not enforcement boundaries**. If a target repository requires hard restrictions around terminal commands, network access, secrets, filesystem mutation, or privileged operations, configure the corresponding VS Code/Copilot approval, permission, sandbox, and network controls.

## Self-contained review policies

Each review surface must be able to make its own judgment without borrowing another surface's policy.

Reviewer and DeepReviewer keep their review boundary, investigation strategy, finding quality bar, severity semantics, and output contract in their own agent files. Orchestrator keeps enough coordination policy to evaluate review evidence before applying a fix, because it can mutate the repository.

```text
Reviewer       whether a routine finding passes its reporting threshold
DeepReviewer   severity and merge assessment for the pre-merge gate
Orchestrator   whether a confirmed finding warrants a code change
```

Findings move between these surfaces as evidence. A finding's originating threshold, severity, or fix recommendation does not transfer with it; the receiving surface applies its own policy. Repository-wide and path-specific instructions are inputs to a local policy rather than competing policy, even where they contain review-oriented wording such as when to flag a pattern.

### Where a surface-specific skill can reach

Agent Skills are discovered across Copilot surfaces, so a skill written for one surface can be selected in another. Testing this template found a specific shape:

```text
loads into    the agent the user is talking to (Orchestrator, DeepReviewer)
does not      reach a subagent's context (Reviewer, invoked by Orchestrator)
symptom       the parent restates the subagent's findings in the skill's
              severity vocabulary rather than its own
```

The effective control is the skill's `description`, which decides selection before any content is loaded. See [skill-architecture.md](skill-architecture.md#scoping-a-skill-to-one-consumer). A skill whose description discriminates by consumer was skipped with an explicit reason; the same skill under a product-name description was loaded and shifted the parent's reported severity.

Runtime agent files do not need the name or path of another surface's review policy. Keep the local policy concrete instead, and treat an unexpected severity vocabulary in a parent's summary as the signal that a foreign policy reached it.

Personal skills, personal agent profiles, and other user-level configuration reach the effective context without appearing in the repository, so repository-local files reduce ambiguity rather than removing it.

## Model-tier and worker-invocation caveats

Model availability, cost tiers, and exact tool identifiers are implementation details that change over time. Verify them against the current VS Code/Copilot installation instead of copying the template blindly. In particular, do not assume a model name or `Auto` value is accepted in custom-agent frontmatter unless the current product documents it.

The shipped template intentionally uses different model-selection strategies for different roles:

```text
Scout
  -> cheapest capable model first, then a general fallback

Reviewer
  -> quality-ordered fallback, general fallback last

Orchestrator / DeepReviewer
  -> no model pin; use the active session/user selection
```

A trailing general entry matters because a pinned name that the installation does not expose leaves the list unsatisfied. Verify the exact strings against the target installation; they carry a provider or plan qualifier in some environments.

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

Verify delegation by observing the run, not by reading the agent's own summary. When the delegation tool is unavailable, a parent with terminal access may compose the worker's prompt in the shell and report that it delegated. The transcript then reads as a successful hand-off while the same context performed the review, so the independence the topology exists to provide is gone without any error surfacing. Look for an actual subagent invocation in the trace.

Declared tools can also resolve while remaining inert. A tool whose feature is disabled by setting may return nothing instead of failing, which an agent can report as an absence of findings. Confirm each agent receives what its tools are for.

## Tool granularity

Custom agents may intentionally use either broad tool sets or individual tools.

```text
Orchestrator
  -> broader search/read/execute capability for implementation work

Scout / Reviewer / DeepReviewer
  -> narrower individual tools where the role benefits from tighter capability boundaries
```

Do not make tool lists textually uniform if doing so changes the actual capability boundary. Validate both the tool identifiers and the resulting behavior in the target VS Code/Copilot version.

Do not infer Agent Skill isolation from a narrow custom-agent `tools` list. VS Code documents ordinary skills as being selected from skill metadata and loaded inline into the parent context. Its dedicated skill tool is an experimental mechanism used for skills that opt into `context: fork`, not the documented gate for ordinary inline skill discovery. See [skill-architecture.md](skill-architecture.md#cross-surface-discovery).

## Intentional contract duplication

Avoid accidental duplication of repository policy, but allow narrow duplication when isolated contexts each need a small contract or ownership pointer.

Use this decision test rather than a closed list of allowed categories:

```text
If one copy becomes stale, does the failure become an obvious reference,
ownership, or schema mismatch?
  -> narrow duplication can be acceptable

Can both copies remain plausible while silently expressing different policy?
  -> do not duplicate; keep one authoritative owner
```

The usual acceptable case is a producer/consumer interface contract. Fields such as `Claim`, `Source / Sources`, `Confidence`, or a search-scope field appear in several agent files because isolated producers and consumers each need the schema independently.

Use the exception narrowly:

- duplicate only the schema both contexts need, never the behavior around it
- do not duplicate repository facts or implementation policy
- update all participating agents together when the shared contract changes

The goal is **local self-sufficiency across isolated contexts**, not textual deduplication at any cost.
