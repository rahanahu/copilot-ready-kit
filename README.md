# Copilot-ready repository architecture

A practical, evidence-backed bootstrap template for turning an existing repository into a **Copilot-ready development and review environment** across VS Code and GitHub.com pull-request review.

This repository is not a generic prompt collection or a claim that one set of “best practices” fits every project. It provides a context architecture and adaptation protocol for teaching Copilot the facts, invariants, boundaries, workflows, and review standards that are actually true for a target repository.

> Give each Copilot surface the smallest useful context, keep repository knowledge authoritative, and make automated review focus on real defects instead of noise.

## Humans: start here

1. Copy `AGENTS.md` and `.github/` into your repository. Leave `README.md` and `docs/` behind — they describe the template, not your project.
2. Paste the [bootstrap prompt](#copy-paste-bootstrap-prompt) into a coding agent that has write access to that repository.
3. Review what it wrote. This template ships structure and examples; only your repository can supply the facts.

What you are porting:

| Layer | File | Consumed by |
|---|---|---|
| Repository model | [`AGENTS.md`](AGENTS.md) | every Copilot surface |
| Universal policy and version facts | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | every Copilot surface |
| Path-scoped rules | [`.github/instructions/`](.github/instructions/) | matching files only |
| IDE agent roles | [`.github/agents/`](.github/agents/) | VS Code |
| PR review procedure | [`.github/skills/code-review/SKILL.md`](.github/skills/code-review/SKILL.md) | GitHub.com code review |
| PR description contract | [`.github/pull_request_template.md`](.github/pull_request_template.md) | humans and reviewers |

## AI agents: start here

If you are an AI/coding agent using this repository to adapt another project, treat this README as a **bootstrap manifest**, not the full specification.

Do not copy this repository verbatim. Derive target-repository facts and constraints from evidence.

Port only `AGENTS.md` and `.github/`. `README.md` and `docs/` describe this template repository and stay here.

Architecture docs under `docs/` explain the design and adaptation rules. The template files listed above define the shipped example format and behavior for their own layer. Target-repository evidence is authoritative; template examples are never project facts.

1. Read this README.
2. Read [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md).
3. Inspect the target repository using that evidence inventory before editing.
4. Load the other reference documents only when their topic is relevant.
5. Inspect each actual template file only when you are adapting that context layer.
6. Complete the changes and validate them when you have write access; do not stop at a generic plan.

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

## Responsibility split

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

Use this routing test for every piece of guidance:

```text
Repository purpose / architecture / invariants / verification?
  -> AGENTS.md

Always-relevant Copilot fact or policy?
  -> .github/copilot-instructions.md

Path-specific semantic rule?
  -> .github/instructions/*.instructions.md + precise applyTo

IDE role / model / tools / delegation / output contract?
  -> .github/agents/*.agent.md

GitHub PR review investigation / when to comment?
  -> .github/skills/code-review/SKILL.md
```

Do not duplicate the same detailed rule across several layers just to make it more visible.

## Adaptation flow

The detailed procedure is in [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md). In short:

```text
1. Inspect
   repository facts, versions, architecture, verification, risky boundaries,
   existing AI configuration, version-matched official documentation

2. Report
   summarize the discovered model and uncertainty before editing

3. Classify
   route each fact/rule to the correct context layer

4. Adapt
   write only evidence-backed configuration justified by the target repository

5. Validate
   check paths, applyTo, frontmatter, commands, contradictions, versions, diff

6. Evaluate
   benchmark reviewer behavior with positive/negative controls when it matters
```

## Documentation map

Load these progressively rather than putting the entire architecture in the initial context:

| Document | Read when you need to... |
|---|---|
| [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md) | inspect and convert a target repository into a Copilot-ready repository |
| [`docs/context-architecture.md`](docs/context-architecture.md) | decide what belongs in AGENTS, instructions, custom agents, or skills |
| [`docs/review-design.md`](docs/review-design.md) | design high-signal review rules, semantic-misuse boundaries, severity/priority judgment, or external evidence policy |
| [`docs/reviewer-evaluation.md`](docs/reviewer-evaluation.md) | test reviewer recall, precision, `applyTo`, noise, or version-matched research behavior |

The template files themselves are listed under [Humans: start here](#humans-start-here). Inspect each one only when you are adapting that layer.

## Copy-paste bootstrap prompt

```text
Make this repository Copilot-ready using rahanahu/copilot-ready-kit as the
repository-architecture and bootstrap template.

Start with the template README.md and docs/adaptation-protocol.md, then inspect
THIS target repository before writing anything.

Build an evidence-backed model of:
- repository purpose and architecture
- supported languages/frameworks/toolchains/versions/platforms
- build/test/lint/static-analysis commands
- compatibility, persistence, migration, security, concurrency, lifecycle,
  ownership, deployment, real-time, or safety-sensitive boundaries
- generated/vendor boundaries
- existing Copilot/agent configuration
- version-matched authoritative official documentation sources

Report that model and any uncertainty before editing.

Classify context into:
- architecture/invariants/verification -> AGENTS.md
- universal facts/policy -> .github/copilot-instructions.md
- path-specific semantic rules -> .github/instructions/*.instructions.md
- IDE roles/tools/delegation -> .github/agents/*.agent.md
- GitHub PR review procedure -> .github/skills/code-review/SKILL.md

Adapt the template to the real repository. Port only AGENTS.md and .github/;
the template's own README.md and docs/ stay in the template repository. Do not
copy placeholders, invented facts, unused path-specific rules, generic style
guidance, or latest-only framework assumptions.

Keep automatic review high-signal: require a concrete failure, violated
invariant, or consequence-backed semantic liability before commenting. Let
deterministic tooling own deterministic checks.

Validate applyTo patterns, referenced paths/commands, frontmatter,
duplicated/contradictory instructions, supported-version evidence, and the
final diff. Run appropriate repository-defined verification. Clearly distinguish
checks actually executed from conclusions inferred only by inspection.

If reviewer behavior matters, use small positive/negative benchmark PRs rather
than assuming the prompt works. External web/MCP research may enrich evidence,
but correctness must not depend on an optional framework-specific MCP.

Complete the changes if you have write access. At the end, summarize changed
files, encoded invariants, validation actually performed, experiments performed,
and remaining uncertainties.
```

## Best practices for Copilot-ready repositories

These are design principles for adapting the architecture, not universal coding-style rules.

- Inspect first; configure second.
- Share **facts**, not giant prompts.
- Do not invent unknown project facts.
- Record supported versions and version-matched authoritative documentation for version-sensitive technologies.
- Let web research and MCP enrich evidence when available; do not make correctness depend on optional framework-specific MCPs.
- Do not use latest-only documentation to prove behavior for an older supported version.
- Separate repository knowledge from agent behavior.
- Separate IDE-agent review from GitHub online review procedure.
- Keep the automatic review skill thin; move domain semantics under precise `applyTo` boundaries.
- Write path-specific rules as invariants with concrete consequences and escape hatches.
- Keep broad or version-sensitive research out of the primary implementation context when Scout can compress it.
- Prefer independent reviewer judgment over self-review only.
- Make findings evidence-backed and attributable to the change; supporting evidence may live outside the diff.
- Let deterministic tooling own deterministic checks.
- Prefer silence over weak or speculative findings.
- Treat Copilot instructions as behavioral context, not a security boundary.
- Treat review configuration from a PR head branch as PR-controlled input.
- Keep model names and tool identifiers replaceable; preserve responsibilities rather than freezing product details.
- Evaluate reviewer changes with positive cases and clean negative controls.

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
