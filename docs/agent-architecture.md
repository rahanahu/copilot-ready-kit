# Agent architecture

Read this document when adapting the VS Code custom-agent topology, worker permissions, research boundaries, model/tool configuration, or agent interface contracts.

The canonical ownership and routing rules live in [context-architecture.md](context-architecture.md). This document assumes the relevant behavior has already been routed to an agent layer.

## Default IDE topology

| Agent | Started by | May delegate to |
|---|---|---|
| Orchestrator | the user | Scout, Reviewer |
| DeepReviewer | the user | Scout |
| Reviewer | Orchestrator | — |
| Scout | Orchestrator or DeepReviewer | — |

Scout is one agent with two callers, not two configurations. The wiring is three frontmatter properties:

```text
user-invocable: false        keeps a worker out of the user's picker
disable-model-invocation     keeps it from being chosen as a subagent generally
agents: [...]                names the workers this parent may call anyway
```

Listing a worker in a parent's `agents:` overrides its `disable-model-invocation`, so a worker becomes reachable by adding it to a parent's list rather than by changing the worker. Whether the list also excludes is version-dependent, so confirm both directions in the installation you are adapting for: that a listed worker can be reached, and that an unlisted one cannot. Where exclusion is not enforced, an agent's own instruction not to invoke another is the only boundary, which is why `orchestrator.agent.md` carries one. See [behavior-verification.md](behavior-verification.md#does-the-configuration-function-at-all).

The two workers exist for different reasons, and delegation is worth its cost only when one of them applies.

Scout buys **context economy**. Broad repository sweeps and fetched web pages are bulky and mostly irrelevant once the answer is found, so they stay in Scout's context and only a compact evidence packet comes back. Running it on the cheapest capable model follows from that: the work is search and compression, not judgment.

Reviewer buys **independent judgment**. A review produced by the context that just wrote the code inherits that context's assumptions about what the code is supposed to do. Reviewer starts from the change and the stated intent instead, which is why it is a separate agent rather than a step in the parent's own reasoning.

Four agents is a first shape, not the only one. Orchestrator here both coordinates and writes code, and a larger setup can split those: coordination in one profile, implementation in its own, so the coordinator's context stays free of edit-by-edit detail. Growing the topology is the same decision as the one above — a new profile earns its place when it buys context economy or independent judgment, and otherwise costs a profile to maintain and a delegation hop to justify. Shrinking works the same way. A repository with no pre-merge practice can drop DeepReviewer; one where research is never the bottleneck can drop Scout and let the parent read for itself.

Adapt model names and tool identifiers to the available environment, but preserve this split unless the target repository has a concrete reason to change it — and check the reason against what the split buys, since collapsing a worker into its parent gives back exactly one of these two properties.

## Targeting the agent profiles

`.github/agents/` is not a VS Code-only directory. The same profiles are offered by VS Code, by GitHub.com, and by the Copilot CLI. The two target values cover them: `vscode` for the editor, `github-copilot` for the other two. `target` limits which side can select an agent; omitting it leaves the agent available on both.

It also decides which frontmatter properties apply. Switching a shipped agent to `target: github-copilot` and watching the editor is enough to see this: in VS Code 1.135.0 with `@github/copilot` 1.0.81-0, `argument-hint`, `user-invocable`, `disable-model-invocation`, `tools`, and `agents` all dim. Since the topology above chains parents to workers through `agents:`, retargeting a profile is a rewrite rather than a one-line change.

The shipped agents therefore set `target: vscode`. Their thresholds, output contracts, and delegation are written in the VS Code form, and without the setting `Reviewer` could be picked from a dropdown on GitHub.com or assigned to an issue and run somewhere it was not written for.

This scopes the custom agent, not Agent Skill discovery or Copilot Code Review. GitHub documents `github-copilot` as the other target value but does not define it as the Code Review surface, so do not read `target: vscode` as an online-review exclusion mechanism.

## Orchestrator

- primary implementation agent
- inspects the smallest useful local context
- implements focused changes
- runs repository-defined verification
- delegates broad/version-sensitive research to Scout
- delegates independent routine review to Reviewer

Orchestrator is the most consequential place for review-policy confusion because it can edit the repository. A polluted review decision can become an unnecessary or incorrect code change rather than merely a noisy comment.

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

## DeepReviewer

- human-invoked pre-merge reviewer
- may inspect a broader blast radius
- may run controlled repository-defined verification
- acts as an explicit merge gate
- is the better surface for architecture, simplification, migration strategy, and design trade-offs

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

A skill written for another surface can be selected here, and it lands in the agent the user is addressing rather than in a subagent it delegates to. Runtime agent files do not need that skill's name or path; keep the local policy concrete and treat an unexpected severity vocabulary in a parent's summary as the sign that a foreign policy reached it. The control is the skill's own `description` — see [skill-architecture.md](skill-architecture.md#scoping-a-skill-to-one-consumer).

Personal skills, personal agent profiles, and other user-level configuration reach the effective context without appearing in the repository, so repository-local files reduce ambiguity rather than removing it.

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

## Model selection

Model availability and cost tiers are implementation details that change over time. Verify them against the current VS Code/Copilot installation instead of copying the template blindly. The shipped files use values verified against VS Code 1.135.0 with `@github/copilot` 1.0.81-0 on 2026-08-31, including a general `Auto` entry. Treat every one of them as something to re-check rather than as a portable constant.

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

## Tool granularity

Custom agents may intentionally use either broad tool sets or individual tools.

```text
Orchestrator
  -> broader search/read/execute capability for implementation work

Scout
  -> a group for web access plus individual search/read tools

Reviewer / DeepReviewer
  -> individual tools only, where the role benefits from a tighter boundary
```

Do not make tool lists textually uniform if doing so changes the actual capability boundary. Validate both the tool identifiers and the resulting behavior in the target VS Code/Copilot version.

Do not infer Agent Skill isolation from a narrow custom-agent `tools` list. VS Code documents ordinary skills as being selected from skill metadata and loaded inline into the parent context. Its dedicated skill tool is an experimental mechanism used for skills that opt into `context: fork`, not the documented gate for ordinary inline skill discovery. See [skill-architecture.md](skill-architecture.md#cross-surface-discovery).
