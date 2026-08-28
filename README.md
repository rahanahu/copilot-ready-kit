# templatecopilotagent

An opinionated template for turning an existing repository into a **Copilot-ready development and review environment** across VS Code and GitHub.com pull-request review.

The goal is not to copy a pile of prompt files. The goal is to build a small, evidence-backed context architecture so that Copilot can understand the repository, use the right rules in the right places, delegate work deliberately, and review pull requests with high signal and low noise.

> **AI agents: start with the adaptation protocol below.** Do not copy this repository verbatim into another project.

---

## AI: make a target repository Copilot-ready

If you are an AI/coding agent reading this repository because a user asked you to make another repository Copilot-ready, treat this section as your execution contract.

Your job is to **inspect the target repository, derive authoritative context from evidence, adapt this architecture, write the files, and validate the result**.

Do not stop at recommendations when you have permission to modify the target repository.

### Required outcome

A Copilot-ready repository should give Copilot enough context to answer these questions reliably:

```text
What does this repository build?
What architecture and invariants must remain true?
What versions/platforms are actually supported?
Which rules apply everywhere, and which only apply to certain paths?
How should implementation work be delegated in the IDE?
How should pull requests be reviewed without style/noise spam?
How is a change verified using repository-defined commands?
Which facts are known, and which are still uncertain?
```

The finished repository should normally use this responsibility split:

```text
Shared repository knowledge
├─ AGENTS.md
├─ .github/copilot-instructions.md
└─ .github/instructions/*.instructions.md

VS Code / coding-agent workflow
├─ Orchestrator
│  ├─ Scout
│  └─ Reviewer
└─ DeepReviewer
   └─ Scout

GitHub.com pull-request review
└─ Copilot Code Review
   ├─ shared repository knowledge
   ├─ PR description/context
   └─ .github/skills/code-review/SKILL.md
```

### Phase 1 — inspect before writing

Do not generate Copilot configuration from the repository name, README alone, or assumptions about the technology stack.

Inspect enough of the target repository to establish the following evidence inventory.

#### Repository facts

Identify:

- repository purpose and important users/consumers
- top-level architecture and major subsystem boundaries
- primary languages, frameworks, runtimes, distributions, and toolchains
- **declared/supported** versions, not merely locally resolved dependency versions
- target operating systems, architectures, devices, browsers, or deployment environments
- package/build systems
- generated and vendored source boundaries
- configuration and deployment surfaces

#### Verification facts

Find repository-defined commands for the workflows that actually exist:

- configure/build/compile
- unit tests
- integration/end-to-end tests
- lint/format/static analysis
- schema/code-generation checks
- focused subsystem validation

Do not invent replacement commands when an authoritative project command exists.

#### Change-sensitive boundaries

Look for contracts where a local change can have non-local impact:

- public API / ABI / schema / protocol compatibility
- persisted data and migrations
- authentication, authorization, secrets, trust boundaries
- concurrency, callbacks, shared state, atomicity
- ownership, lifecycle, resource cleanup
- deployment and runtime assumptions
- real-time or safety constraints
- backward-compatible configuration

#### Existing AI/Copilot configuration

Before adding files, inspect any existing:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/agents/*.agent.md`
- `.github/skills/**/SKILL.md`
- PR templates
- repository-specific contributor/development instructions

Preserve useful existing behavior. Do not blindly replace configuration that already encodes real project knowledge.

#### Authoritative external documentation

For version-sensitive technologies, identify the official documentation source that matches the repository's declared support baseline.

Examples:

```text
Angular 20 -> https://angular.dev/
ROS 2 Jazzy -> https://docs.ros.org/
```

Do not use latest/rolling/nightly behavior as proof for an older supported release without explicit evidence.

### Phase 2 — report the discovered model before editing

Before creating or replacing Copilot configuration, summarize the evidence you found.

At minimum report:

```text
Repository purpose
Architecture map
Supported versions/platforms
Build/test/lint commands
Important invariants
Change-sensitive boundaries
Generated/vendor boundaries
Authoritative documentation sources
Proposed applyTo boundaries
Existing Copilot configuration to preserve/replace
Unknown or conflicting facts
```

If a fact is uncertain, mark it uncertain. **Do not turn a guess into an instruction.**

### Phase 3 — classify context into the correct layer

Use this routing test for every piece of guidance:

```text
What is this repository and what must remain true?
  -> AGENTS.md

Must almost every Copilot task know this fact or policy?
  -> .github/copilot-instructions.md

Does this rule apply only to a subsystem/language/framework/security surface?
  -> .github/instructions/*.instructions.md + precise applyTo

Does this define an IDE agent's role, tools, model, delegation, or output contract?
  -> .github/agents/*.agent.md

Does this define how GitHub PR review should investigate and decide when to comment?
  -> .github/skills/code-review/SKILL.md
```

Do not duplicate the same detailed rule across several layers just to make it more visible.

### Phase 4 — adapt the files

#### `AGENTS.md`

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

#### `.github/copilot-instructions.md`

Keep this file small and always relevant.

Good content includes:

- authoritative project/toolchain/framework versions
- supported platforms
- authoritative documentation sources
- universal compatibility/change policy
- generated/vendor boundaries that truly apply repository-wide
- small high-signal review policy

Do not turn this file into a giant reviewer prompt or a language encyclopedia.

#### `.github/instructions/*.instructions.md`

Create path-specific instruction files **only when the target repository has real domain-specific rules**.

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

A strong path-specific rule has this mental model:

```text
Trigger       When does the rule apply?
Invariant     What must remain true?
Failure mode  What concrete bad behavior follows if it is violated?
Evidence      What should Copilot inspect before commenting?
Escape hatch  What evidence means the code is actually safe?
```

Example — Angular signals:

```md
- Treat values purely derived from existing signals as derived state.
- Flag `effect()` that copies a pure derivation into writable state when it creates a second source of truth, eager synchronization, or update-order/lifecycle dependence.
- Prefer `computed()` when the value has no independent mutation semantics.
- Do not flag effects whose purpose is external synchronization such as browser APIs, persistence, analytics, network I/O, focus, or imperative third-party APIs.
- Do not comment merely because `computed()` is shorter.
```

The important boundary is **semantic consequence**, not preferred syntax.

#### `.github/agents/*.agent.md`

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

**Orchestrator**

- primary implementation agent
- inspects the smallest useful local context
- implements focused changes
- runs repository-defined verification
- delegates broad/version-sensitive research to Scout
- delegates independent routine review to Reviewer

**Scout**

- cheap/read-only evidence worker
- researches official docs and version-sensitive behavior
- performs broad repository mapping when needed
- returns compact traceable evidence instead of architectural decisions

**Reviewer**

- read-only routine reviewer for the IDE implementation loop
- reports concrete change-attributable defects
- avoids style/preference noise
- does not pretend uncertain external facts are verified

**DeepReviewer**

- human-invoked pre-merge reviewer
- may inspect a broader blast radius
- may run controlled repository-defined verification
- is the better surface for architecture, simplification, migration strategy, and design trade-offs

The IDE Reviewer and GitHub.com Code Review are different execution surfaces. Do not try to make `reviewer.agent.md` act as the online reviewer.

#### `.github/skills/code-review/SKILL.md`

Keep the automatic review skill relatively thin.

Its main job is to define:

- evidence threshold
- impact-analysis procedure
- high-risk review lenses
- semantic-misuse boundary
- noise suppression
- severity/priority judgment
- final finding quality bar

The automatic reviewer should usually prioritize:

- correctness and reachable regressions
- security and trust boundaries
- compatibility
- concurrency / atomicity / ordering
- lifecycle / ownership / cleanup / exception safety
- persistence / migration / precision / data integrity
- consequence-backed semantic misuse
- missing verification tied to a specific risky behavior
- performance issues with concrete structural or measured evidence

It should usually stay silent on:

- formatting/import ordering/whitespace
- naming preference
- generic best practices without failure evidence
- unrelated pre-existing defects
- broad refactoring or architecture taste
- tests merely because no test file was added
- micro-optimizations without meaningful impact
- failures that formatter/linter/compiler/type checker/schema validation/ordinary CI will reliably explain

Use this principle:

> **The defect must be caused by the PR, but the supporting evidence does not have to live in the diff.**

A reviewer may inspect unchanged callers, consumers, tests, sibling implementations, or configuration when that evidence is needed to prove or disprove the finding.

Do not rely on custom review-comment rendering as a contract. The skill should specify the **substance** a useful finding needs; GitHub owns the review UI/comment presentation.

#### `.github/pull_request_template.md`

A useful PR description gives both human and AI reviewers context that cannot be reliably inferred from a diff:

- what changed
- why it changed
- important constraints
- verification actually performed
- review focus
- known limitations/follow-ups

Do not use the PR description as permission to suppress unrelated valid findings.

### Phase 5 — validate the generated configuration

Do not consider the repository Copilot-ready until the resulting configuration passes these checks.

#### Structural validation

Verify:

- every `applyTo` pattern matches real intended paths
- no placeholder such as `__REPLACE_WITH_REAL_PATH__` remains active
- YAML/frontmatter is valid
- referenced files/commands/paths actually exist
- generated/vendor files are not accidentally targeted for direct editing
- model/tool names used by custom agents exist in the target environment

#### Context validation

Check for:

- invented repository facts
- stale version assumptions
- duplicate rules across layers
- contradictory matching instructions
- giant global instruction files that should be split by path
- path-specific rules accidentally placed in always-on context
- reviewer formatting/UI requirements that the platform does not guarantee

#### Behavior validation

Run the repository-defined verification that is appropriate for configuration/documentation changes.

Then inspect the final diff and confirm the configuration describes the **target repository**, not this template repository.

### Phase 6 — test the reviewer, do not merely trust the prompt

Copilot review is non-deterministic. A plausible-looking skill is not evidence that the reviewer behaves well.

When reviewer behavior matters, test it with small experimental PRs containing both positive cases and clean negative controls.

Useful benchmark dimensions:

```text
root-cause recall
precision / false-positive rate
negative-control false positives
duplicate-comment rate
cross-file detection
security-boundary detection
compatibility detection
concurrency/atomicity detection
semantic-misuse recall
semantic-misuse false-positive rate
CI-duplication rate
pre-existing-code noise
actionability
```

For semantic misuse, prefer **precision over recall**. Missing a safe-but-nonidiomatic simplification is usually less damaging than teaching the reviewer to complain about every effect, subscription, raw pointer, shell command, or custom abstraction.

### Completion report

When you finish adapting a repository, report:

```text
Files created/updated
Repository facts encoded
Path-specific applyTo boundaries created
Agent topology/configuration chosen
Review risks encoded
Verification actually performed
Reviewer experiments performed, if any
Known uncertainties or follow-ups
```

Do not claim verification you did not run.

---

## Copy-paste bootstrap prompt for another coding agent

Use this when you want an AI to adapt a repository using this template:

```text
Make this repository Copilot-ready using rahanahu/templatecopilotagent as the
architecture template.

First read the template repository's README.md, AGENTS.md,
.github/copilot-instructions.md, .github/agents/*.agent.md,
.github/instructions/, and .github/skills/code-review/SKILL.md.

Then inspect THIS target repository before writing anything.

1. Build an evidence-backed inventory of:
   - repository purpose and architecture
   - supported languages/frameworks/toolchains/versions/platforms
   - build/test/lint/static-analysis commands
   - public compatibility boundaries
   - persistence/migration/security/concurrency/lifecycle-sensitive areas
   - generated/vendor boundaries
   - existing Copilot/agent instructions
   - authoritative official documentation sources

2. Report that inventory and any uncertainty before editing.

3. Classify context into:
   - shared architecture/invariants/verification -> AGENTS.md
   - universal facts/policy -> .github/copilot-instructions.md
   - path-specific semantic rules -> .github/instructions/*.instructions.md
   - IDE roles/tools/delegation -> .github/agents/*.agent.md
   - GitHub PR review procedure -> .github/skills/code-review/SKILL.md

4. Adapt the template files to the real repository. Do not copy placeholders,
   invented facts, unused path-specific rules, or generic style guidance.

5. Keep automatic review high-signal: require a concrete failure, violated
   invariant, or consequence-backed semantic liability before commenting.
   Let deterministic tooling own deterministic checks.

6. Validate all applyTo patterns, referenced paths/commands, frontmatter,
   duplicated/contradictory instructions, and the final diff.

7. Run appropriate repository-defined verification and clearly distinguish
   checks actually executed from checks inferred by inspection.

8. If reviewer behavior is important, propose or create small positive/negative
   benchmark PRs rather than assuming the prompt works.

Complete the changes if you have write access; do not stop at a generic plan.
At the end, summarize changed files, encoded invariants, validation performed,
and remaining uncertainties.
```

---

## Context architecture reference

The repository uses five layers with intentionally different responsibilities.

| Layer | Purpose | Typical content |
|---|---|---|
| `AGENTS.md` | Shared repository model | purpose, architecture, invariants, risky boundaries, verification map |
| `.github/copilot-instructions.md` | Universal Copilot policy + authoritative project facts | versions, supported platforms, authoritative docs, cross-surface behavior |
| `.github/instructions/*.instructions.md` | Conditional guidance | language/module/framework/security rules using `applyTo` |
| `.github/agents/*.agent.md` | VS Code agent behavior | role, model, tools, delegation, research, output contracts |
| `.github/skills/code-review/SKILL.md` | GitHub online review procedure | evidence threshold, impact analysis, semantic-misuse boundary, noise filter, finding quality bar |

A compact classification test:

```text
Repository fact/invariant?        -> AGENTS.md
Always-relevant fact/policy?      -> copilot-instructions.md
Only relevant under some paths?   -> instructions/*.instructions.md
IDE identity/tools/routing?       -> agents/*.agent.md
GitHub PR review procedure?       -> skills/code-review/SKILL.md
```

---

## Review philosophy

The automatic reviewer exists to find concrete defects, not to prove every changed line is ideal.

Good review targets:

```text
reachable behavioral regression
security/trust-boundary violation
API/schema/protocol/config compatibility break
race / atomicity / ordering / idempotency bug
resource leak / unsafe ownership / cleanup failure
persistence / migration / precision / data-integrity issue
consequence-backed framework/language semantic misuse
specific missing regression protection
structurally meaningful performance regression
```

Semantic misuse is review-worthy only when the abstraction choice creates a real liability.

Examples:

```text
manual derived mutable state
  -> duplicated source of truth / synchronization / ordering

manual ownership across throwing code
  -> exception safety / lifetime leak

imperative infrastructure mutation
  -> idempotency / check-mode / state semantics lost

repository-native helper bypassed
  -> duplicated invariant / divergent behavior
```

Usually not review targets by themselves:

```text
"this could use fewer lines"
"this is not the newest idiom"
"I prefer abstraction X"
"this would be more elegant"
```

When evidence is weak, silence is better than speculative review noise.

---

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

Add only justified path-specific instructions:

```text
.github/instructions/
├─ source.instructions.md
├─ tests.instructions.md
├─ github-actions.instructions.md
└─ security-sensitive.instructions.md
```

### Monorepo

Prefer subsystem boundaries:

```text
.github/instructions/
├─ frontend.instructions.md      applyTo: apps/frontend/**
├─ backend.instructions.md       applyTo: services/backend/**
├─ protocol.instructions.md      applyTo: proto/**
├─ infra.instructions.md         applyTo: infra/**
└─ github-actions.instructions.md
```

Do not create one giant instruction file containing every language and service rule.

---

## Design principles

- Inspect first; configure second.
- Share **facts**, not giant prompts.
- Do not invent unknown project facts.
- Separate repository knowledge from agent behavior.
- Separate IDE-agent review from GitHub online review procedure.
- Keep the automatic review skill thin; move domain semantics under precise `applyTo` boundaries.
- Write path-specific rules as invariants with concrete consequences and escape hatches.
- Keep broad/version-sensitive research out of the primary implementation context when Scout can compress it.
- Prefer independent reviewer judgment over self-review only.
- Make review findings evidence-backed and attributable to the change; supporting evidence may live outside the diff.
- Let deterministic tooling own deterministic checks.
- Prefer silence over weak or speculative findings.
- Treat Copilot instructions as behavioral context, not a security boundary.
- Treat review configuration from a PR head branch as PR-controlled input.
- Keep model names and tool identifiers replaceable; preserve responsibilities rather than freezing product details.
- Evaluate reviewer changes with positive cases and clean negative controls.

---

## Official references

- GitHub Docs — Copilot code review: https://docs.github.com/en/copilot/concepts/agents/code-review
- GitHub Docs — Customizing Copilot code review: https://docs.github.com/en/copilot/tutorials/customize-code-review
- GitHub Docs — Agent Skills for Copilot: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills
- GitHub Docs — Repository custom instructions: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
- GitHub Docs — Custom instruction support: https://docs.github.com/en/copilot/reference/custom-instructions-support
- VS Code — Custom instructions: https://code.visualstudio.com/docs/agent-customization/custom-instructions
- VS Code — Custom agents: https://code.visualstudio.com/docs/agent-customization/custom-agents
- VS Code — Subagents: https://code.visualstudio.com/docs/agents/run/subagents
- GitHub Awesome Copilot: https://github.com/github/awesome-copilot
