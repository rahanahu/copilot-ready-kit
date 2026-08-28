# templatecopilotagent

An opinionated template for building a **high-signal GitHub Copilot environment across both VS Code and GitHub.com pull-request review**.

This repository is not just a set of `.agent.md` examples. It defines a context architecture: which facts should always be available, which rules should be conditional, which behavior belongs to IDE agents, and which review procedure should be used by GitHub Copilot Code Review.

The design goal is simple:

> Give each Copilot surface the smallest useful context, keep repository facts authoritative, and make review focus on real defects instead of noise.

---

## Target architecture

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

The important distinction is that **VS Code custom agents and GitHub.com Code Review are different execution surfaces**.

Do not try to make `.github/agents/reviewer.agent.md` act as the online reviewer. Instead, share repository knowledge between both surfaces and give the online reviewer its own review skill.

---

## Recommended repository layout

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
├─ instructions/
│  └─ example.instructions.md
└─ skills/
   └─ code-review/
      └─ SKILL.md
```

Adapt the layout to the real project. Do not create path-specific files only to imitate the template.

---

## The context model

Use five layers with intentionally different responsibilities.

| Layer | Purpose | Typical content |
|---|---|---|
| `AGENTS.md` | Shared repository model | purpose, architecture, invariants, risky boundaries, verification map |
| `.github/copilot-instructions.md` | Universal Copilot policy + authoritative project facts | versions, supported platforms, authoritative docs, cross-surface behavior |
| `.github/instructions/*.instructions.md` | Conditional guidance | language/module/framework/security rules using `applyTo` |
| `.github/agents/*.agent.md` | VS Code agent behavior | role, model, tools, delegation, research, output contracts |
| `.github/skills/code-review/SKILL.md` | GitHub online review procedure | impact analysis, review lenses, noise filter, severity, finding quality bar |

A useful classification test is:

```text
What is this repository and what must remain true?
  -> AGENTS.md

Must every Copilot task know this fact/policy?
  -> copilot-instructions.md

Does this rule only matter for certain paths?
  -> instructions/*.instructions.md + applyTo

Does this define an IDE agent's identity/tools/routing?
  -> agents/*.agent.md

Does this define how GitHub PR review should be performed?
  -> skills/code-review/SKILL.md
```

---

## 1. `AGENTS.md`: repository model

`AGENTS.md` should describe **the system**, not the personality of an agent.

Good content:

- repository purpose and important consumers
- architecture boundaries and directory responsibilities
- repository-wide invariants
- public API/schema/protocol boundaries
- persistence/migration/security/concurrency-sensitive areas
- repository-defined verification commands
- evidence expectations

Bad content:

- model selection
- subagent routing
- VS Code tool lists
- severity formatting
- long review checklists
- path-specific C++/TypeScript/Ansible rules

Keep it concise enough that it remains useful whenever it is injected.

---

## 2. `copilot-instructions.md`: always-on Copilot guidance

Use `.github/copilot-instructions.md` for facts and policies that should remain useful across implementation, research, and review.

Typical examples:

```md
- Target ROS distribution: Jazzy
- Target Ubuntu release: 24.04
- C++ baseline: C++20
- Official ROS documentation: https://docs.ros.org/
```

Version pins often belong here because they affect much more than matching source files. A framework version may matter while Copilot is editing CI, checking a manifest, reviewing documentation, or researching upstream APIs.

The file should also contain a **small universal change/review policy** such as:

- preserve established compatibility boundaries
- prefer repository evidence over assumptions
- make focused changes
- distinguish executed verification from inferred verification
- keep review comments focused on real defects rather than style noise

Do not turn it into a giant reviewer prompt.

---

## 3. Path-specific instructions and `applyTo`

Use `.github/instructions/<topic>.instructions.md` when rules only matter for a subset of the repository.

Example:

```md
---
description: 'GitHub Actions security and correctness rules'
applyTo: '.github/workflows/**/*.yml,.github/workflows/**/*.yaml'
---

- Treat `GITHUB_TOKEN` permissions as a security boundary.
- Flag unnecessarily broad write permissions.
- Review `pull_request_target` carefully when PR-controlled content is executed.
- Check whether secrets can reach untrusted code.
```

Prefer **semantic repository boundaries** over broad extensions.

Bad:

```yaml
applyTo: '**/*.yml'
```

That can accidentally combine Ansible, GitHub Actions, Kubernetes, Compose, and unrelated configuration even though their failure modes are different.

Better:

```yaml
applyTo: 'playbooks/roles/**/tasks/**/*.yml,playbooks/roles/**/handlers/**/*.yml'
```

and separately:

```yaml
applyTo: '.github/workflows/**/*.yml,.github/workflows/**/*.yaml'
```

### Useful path-specific review rules

Examples for Ansible:

```md
- Check idempotency.
- Flag tasks that report changed on every run without justification.
- Prefer Ansible modules over `shell`/`command` when a suitable module exists.
- Check that handlers are notified only when state actually changes.
- Scope privilege escalation as narrowly as practical.
```

Examples for C++:

```md
- Check ownership and lifetime when pointer/resource relationships change.
- Preserve the repository's exception/no-exception policy.
- Treat exported ABI/API changes as compatibility-sensitive.
- Review concurrency assumptions when shared state or callbacks change.
```

Do not rely on instruction ordering to resolve contradictions. If two matching files disagree, fix the scoping or the policy.

---

## 4. VS Code custom-agent topology

The existing agent topology is intentionally optimized for context isolation.

```text
User
├─ Orchestrator
│  ├─ Scout
│  └─ Reviewer
└─ DeepReviewer
   └─ Scout
```

### Orchestrator

Primary human-facing implementation agent.

Responsibilities:

- understand the request
- inspect the smallest useful local context
- implement changes
- run focused verification
- delegate broad/version-sensitive research to Scout
- delegate independent routine review to Reviewer

The Orchestrator should not fill its own context with broad web/repository research when Scout can compress that evidence first.

### Scout

Cheap, read-only evidence worker.

Use Scout for:

- official documentation
- version-sensitive framework/API facts
- upstream issues/release notes
- broad repository mapping
- remote GitHub investigation

Scout returns compact traceable evidence instead of architectural decisions.

### Reviewer

Read-only routine reviewer for the IDE implementation loop.

Reviewer should:

- inspect the current change and nearby affected logic
- report only concrete defects attributable to the change
- avoid style/preference noise
- request research rather than pretending uncertain external facts are confirmed

Reviewer is **not** the GitHub.com online reviewer template.

### DeepReviewer

Human-invoked pre-merge review inside the development environment.

DeepReviewer may inspect a broader impact surface and run controlled repository-defined verification. It remains useful even when GitHub online review is enabled because the two surfaces have different context/tools and provide independent judgment.

---

## 5. GitHub.com Copilot Code Review

GitHub online review should reuse repository knowledge but have its own procedure.

The template therefore adds:

```text
.github/skills/code-review/SKILL.md
```

The skill tells the online reviewer to:

- establish PR intent
- create a change-impact map
- investigate the highest-risk consequences first
- expand beyond changed lines only when evidence justifies it
- validate suspected findings before commenting
- prioritize correctness/security/compatibility/concurrency/data integrity
- suppress formatter/linter/style noise
- prefer one root-cause finding over duplicate comments
- return no actionable findings rather than manufacture feedback

This keeps review behavior out of repository-wide context while still making it reusable whenever Code Review performs a review task.

### Important trust property

GitHub Code Review can read repository instructions/agent guidance/skills from the **PR head branch**. That is useful because reviewer configuration can be changed and tested in the same PR.

It also means review configuration is **PR-controlled input**.

Treat instructions and skills as guidance, not as a hard security boundary. Do not place secrets in them, and do not assume a PR cannot attempt to weaken or redirect its own review instructions. Human review and repository protections still matter.

---

## 6. PR descriptions are reviewer context

A high-quality reviewer needs more than a diff.

The included `.github/pull_request_template.md` asks the author to provide:

- what changed
- why it changed
- important constraints
- verification actually performed
- areas deserving review attention
- known limitations/follow-ups

This helps Copilot distinguish intended behavior from accidental behavior and reduces speculative comments.

Do not use the PR description to suppress valid findings; use it to explain intent and constraints.

---

## Review quality philosophy

The goal is **high signal, low noise**.

A Copilot review comment should usually correspond to a concrete failure mode such as:

- reachable functional regression
- incorrect edge/error handling
- API/schema/protocol/config compatibility break
- security/trust-boundary issue
- lifetime/resource leak
- race/order/idempotency bug
- persistence/migration/data-loss risk
- deployment/build/runtime assumption that makes the change fail
- meaningful missing regression coverage

It should usually not comment on:

- formatting
- import ordering
- naming preference
- broad refactoring preference
- generic best practice without failure evidence
- unrelated pre-existing defects
- things deterministic tooling is already expected to reject reliably

Use AI review for semantic judgment; use formatter/linter/compiler/type checker/schema validation/CI for deterministic enforcement.

---

## Small, medium, and large repository setups

### Minimal

Good for a small repository without meaningful subsystem-specific conventions:

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

Add focused path instructions:

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

## Adapting this template to another repository

When using this repository as a template, inspect the target repository before writing configuration.

Recommended adaptation flow:

1. Identify authoritative project facts, supported versions, build/test commands, architecture, and invariants.
2. Identify important official documentation sources for version-sensitive technologies.
3. Write a concise `AGENTS.md` repository model.
4. Keep universal facts/policies in `copilot-instructions.md`.
5. Create only the path-specific instruction files justified by real repository conventions.
6. Preserve the Orchestrator / Scout / Reviewer / DeepReviewer topology unless the project has a concrete reason to change it.
7. Adapt `.github/skills/code-review/SKILL.md` to the repository's real risk profile.
8. Verify `applyTo` patterns against actual paths.
9. Check for duplicated or contradictory instructions.
10. Test both an IDE implementation/review flow and a GitHub.com PR review.

Do not invent missing project facts. If evidence is inconsistent, surface the uncertainty instead of turning a guess into an instruction.

---

## Prompt for another coding agent

```text
Use rahanahu/templatecopilotagent as the design template for this repository's
GitHub Copilot environment.

Read README.md, AGENTS.md, .github/copilot-instructions.md,
.github/agents/*.agent.md, .github/instructions/, and
.github/skills/code-review/SKILL.md first.

Inspect the target repository before generating configuration.

Classify context into:

1. shared repository architecture/invariants/verification
   -> AGENTS.md
2. universal Copilot facts and policy
   -> .github/copilot-instructions.md
3. path-specific implementation/review rules
   -> .github/instructions/*.instructions.md with precise applyTo
4. VS Code role/model/tool/delegation behavior
   -> .github/agents/*.agent.md
5. GitHub.com pull-request review procedure
   -> .github/skills/code-review/SKILL.md

Keep review high-signal and evidence-backed. Do not use AI review for formatting
or deterministic checks that CI/tooling already owns.

Before writing files, report the repository facts, architecture map,
authoritative documentation registry, proposed applyTo boundaries, and review
risk areas you found. Do not invent unknown facts.
```

---

## Design principles

- Share **facts**, not giant prompts.
- Separate repository knowledge from agent behavior.
- Separate IDE-agent review from GitHub online review procedure.
- Use `applyTo` for real semantic boundaries.
- Keep version/documentation facts visible outside language-specific paths when they matter globally.
- Keep broad research out of the primary implementation context.
- Prefer independent reviewer judgment over self-review only.
- Make review comments evidence-backed and attributable to the change.
- Let deterministic tooling own deterministic checks.
- Treat Copilot instructions as behavioral context, not a security boundary.
- Keep model names and tool identifiers replaceable; preserve the architecture rather than freezing product details.

---

## Official references

- GitHub Docs — Copilot code review: https://docs.github.com/en/copilot/concepts/agents/code-review
- GitHub Docs — Customizing Copilot code review: https://docs.github.com/en/copilot/tutorials/customize-code-review
- GitHub Docs — Repository custom instructions: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
- GitHub Docs — Custom instruction support: https://docs.github.com/en/copilot/reference/custom-instructions-support
- VS Code — Custom instructions: https://code.visualstudio.com/docs/agent-customization/custom-instructions
- VS Code — Custom agents: https://code.visualstudio.com/docs/agent-customization/custom-agents
- VS Code — Subagents: https://code.visualstudio.com/docs/agents/run/subagents
- GitHub Awesome Copilot: https://github.com/github/awesome-copilot
