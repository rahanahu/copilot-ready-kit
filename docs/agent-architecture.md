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

DeepReviewer owns its finding threshold, severity policy, and merge assessment for the IDE pre-merge gate.

Execution-related prohibitions in the agent prompt are **behavioral safety defaults, not enforcement boundaries**. If a target repository requires hard restrictions around terminal commands, network access, secrets, filesystem mutation, or privileged operations, configure the corresponding VS Code/Copilot approval, permission, sandbox, and network controls.

## Self-contained review-policy invariant

An ownership declaration is a **conflict-resolution rule**, not a replacement for a concrete review policy.

Reviewer and DeepReviewer must remain self-contained enough to make their own review judgments. Keep their review boundary, investigation strategy, finding quality bar, severity semantics, and output contract in their own agent files. Do not thin those policies merely because the agent says that it owns the decision.

The same principle applies to Orchestrator's coordination policy: it must know how to evaluate review evidence before applying a fix because it can mutate the repository. Reviewer owns whether a routine finding passes its reporting threshold; Orchestrator owns whether any confirmed finding warrants a code change and must apply its own verification policy before acting.

A robust runtime agent should therefore have both:

```text
Concrete local policy
  -> enough detail to make the decision on this surface

Generic authority/conflict rule
  -> if another review judgment policy appears in context, it is not authoritative here
```

Repository-wide and applicable path-specific instructions are **authoritative repository inputs to the local policy**, not competing judgment policy. They can define repository invariants and domain-specific semantic mappings that the local reviewer must apply. The conflict rule must not demote those instructions merely because some of them contain review-oriented wording.

The conflict rule applies to competing **judgment policy**, not to reusable investigation capabilities. A shared security/concurrency/compatibility skill may still provide evidence or investigation steps; it does not own this agent's finding threshold or severity decision.

Authority changes are configuration changes, not runtime inference. Runtime agents must not decide during a task to adopt a competing review judgment policy merely because it is relevant or detailed.

The same separation applies to **finding results**. A finding is evidence regardless of whether it came from Reviewer, DeepReviewer, an Agent Skill result, GitHub.com review, or text supplied in the conversation. Its originating threshold, severity, or fix recommendation does not transfer automatically into the IDE workflow. Orchestrator owns the code-change decision and verifies significant findings before acting.

Keep the conflict rule generic. Runtime agent files should not need the name, path, or implementation details of another execution surface's review policy. Cross-surface relationships may be documented in `docs/`, which is template design documentation rather than shipped runtime context.

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

Do not infer Agent Skill isolation from a narrow custom-agent `tools` list. VS Code documents ordinary skills as being selected from skill metadata and loaded inline into the parent context. Its dedicated skill tool is an experimental mechanism used for skills that opt into `context: fork`, not the documented gate for ordinary inline skill discovery. See [skill-architecture.md](skill-architecture.md#cross-surface-discovery-and-authority).

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

Two common acceptable cases are:

1. **Producer/consumer interface contracts.** Fields such as `Claim`, `Source / Sources`, `Confidence`, or a search-scope field may appear in several agent files because isolated producers and consumers each need the schema.
2. **Execution-surface authority declarations.** Several runtime files may state where a decision is authoritative so each isolated context can resolve conflicts.

An authority declaration is narrow only when it states **where authority resides without restating the policy itself**. It must not duplicate severity vocabularies, evidence thresholds, finding thresholds, investigation procedures, or detailed review rules.

Use these exceptions narrowly:

- duplicate only the interface/schema or ownership pointer both contexts need
- keep role-specific behavior local to each agent
- do not duplicate ordinary repository facts or implementation policy
- update all participating contexts together when a shared interface contract changes

The goal is **local self-sufficiency across isolated contexts**, not textual deduplication at any cost.

## Review-surface boundaries

The review surfaces intentionally own different judgment policies. Keep the ownership map here, but keep severity vocabularies and their rationale authoritative in [review-design.md](review-design.md#severity-and-priority).

```text
Orchestrator
  -> IDE review coordination and whether a confirmed finding warrants a code change

Reviewer
  -> routine IDE implementation feedback

DeepReviewer
  -> explicit IDE pre-merge gate

GitHub.com Copilot Code Review
  -> automatic/requested online PR review
  -> repository policy in .github/skills/code-review/SKILL.md
```

These boundaries are behavioral authority boundaries, not platform-enforced skill isolation. Agent Skills can be discovered by VS Code agent mode as well as other Copilot surfaces, so a surface-specific skill may still appear in an IDE context. Runtime agents resolve that ambiguity with their own self-contained policy plus a generic authority rule rather than with a negative dependency on another surface's file path.

Personal/user-level skills, custom agent profiles, or other user configuration can also affect the effective IDE context without being visible in the repository. Repository-local configuration can reduce ambiguity but cannot guarantee that no external customization is present.

VS Code's built-in Copilot code review feature is a separate product surface from this custom-agent topology and is intentionally out of scope for these custom-agent policy owners. Do not infer its behavior from `Reviewer` or `DeepReviewer`.

Do not unify review thresholds merely because several surfaces perform review. Change the policy relationship only when the corresponding surface responsibility changes.
