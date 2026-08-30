# Copilot-ready repository architecture

A practical, evidence-backed bootstrap template for turning an existing repository into a **Copilot-ready development and review environment** across VS Code and GitHub.com pull-request review.

This repository is not a generic prompt collection or a claim that one set of “best practices” fits every project. It provides a context architecture and adaptation protocol for teaching Copilot the facts, invariants, boundaries, workflows, and review standards that are actually true for a target repository.

> Give each Copilot surface the smallest useful context, keep repository knowledge authoritative, and make automated review focus on real defects instead of noise.

## Copilot-only by default

This kit is designed primarily for repositories that use **GitHub Copilot**. For a Copilot-only target repository, `AGENTS.md` is optional rather than a required layer.

Use `.github/copilot-instructions.md` as the default repository-wide source for always-relevant Copilot context: project purpose, high-level architecture, supported versions/platforms, important repository-wide invariants, verification commands, authoritative documentation, and universal policy. Narrow subsystem- or path-specific rules with `.github/instructions/*.instructions.md`.

Add `AGENTS.md` only when the target repository has a concrete need for portable context outside Copilot, intentionally uses directory-local `AGENTS.md` hierarchy, or already treats `AGENTS.md` as an authoritative interface. Do not duplicate the same detailed repository knowledge in both files merely for visibility.

See [`docs/context-architecture.md`](docs/context-architecture.md) for the routing decision tree.

## Humans: start here

1. Copy `.github/` into your repository as adaptation input. Copy `AGENTS.md` only if the target repository has a justified portability or hierarchical-context requirement. Leave `README.md` and `docs/` behind — they describe the template, not your project. The coding agent should remove or omit any copied layer that the target repository does not justify.
2. Paste the [bootstrap prompt](#copy-paste-bootstrap-prompt) into a coding agent that has write access to that repository.
3. Review what it wrote. This template ships structure and examples; only your repository can supply the facts.

What you are porting:

| Layer | File | Intended scope |
|---|---|---|
| Repository-wide Copilot context | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | always-relevant repository facts, versions, invariants, verification, and universal Copilot policy |
| Path-scoped rules | [`.github/instructions/`](.github/instructions/) | matching files on surfaces that support path-specific instructions |
| IDE agent roles | [`.github/agents/`](.github/agents/) | VS Code custom-agent workflow |
| Reusable skills | [`.github/skills/`](.github/skills/) | on-demand task workflows and specialist investigation; includes GitHub.com review procedure |
| Optional portable repository context | [`AGENTS.md`](AGENTS.md) | only when portability beyond Copilot or intentional `AGENTS.md` hierarchy is required |
| PR description contract | [`.github/pull_request_template.md`](.github/pull_request_template.md) | humans and review context |

## AI agents: start here

If you are an AI/coding agent using this repository to adapt another project, treat this README as a **bootstrap manifest**, not the full specification.

Do not copy this repository verbatim. Derive target-repository facts and constraints from evidence.

Treat `.github/` and the optional `AGENTS.md` example as adaptation inputs, not mandatory output. `README.md` and `docs/` describe this template repository and stay here. Omit any layer that the target repository does not justify. For a Copilot-only target, prefer `.github/copilot-instructions.md` plus path-scoped instructions over creating `AGENTS.md` without a concrete reason.

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

For the default Copilot-only architecture:

```text
Shared Copilot repository knowledge
├─ .github/copilot-instructions.md
└─ .github/instructions/*.instructions.md

VS Code / coding-agent workflow
├─ Orchestrator
│  ├─ Scout
│  └─ Reviewer
└─ DeepReviewer
   └─ Scout

On-demand workflows
└─ .github/skills/*/SKILL.md
   └─ code-review/SKILL.md for GitHub.com automatic PR review

Optional portability / directory hierarchy
└─ AGENTS.md
```

Every piece of guidance should have one authoritative owner. The routing test that decides which is in [`docs/context-architecture.md`](docs/context-architecture.md#routing-test) — apply it before writing anything, and do not duplicate a detailed rule across layers to make it more visible.

## Documentation map

Load these progressively rather than putting the entire architecture in the initial context:

| Document | Read when you need to... |
|---|---|
| [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md) | inspect and convert a target repository into a Copilot-ready repository — the six-phase procedure (inspect, report, classify, adapt, validate, evaluate) |
| [`docs/context-architecture.md`](docs/context-architecture.md) | decide what belongs in repository-wide instructions, path-scoped instructions, custom agents, skills, or optional `AGENTS.md` |
| [`docs/review-design.md`](docs/review-design.md) | understand why the review skill's evidence bar is set where it is, or apply the version-matching and external-research policies |
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

For a Copilot-only repository, classify context into:
- repository-wide facts/invariants/versions/verification/universal policy
  -> .github/copilot-instructions.md
- path-specific semantic rules -> .github/instructions/*.instructions.md
- IDE roles/tools/delegation/judgment -> .github/agents/*.agent.md
- reusable task/investigation workflows -> .github/skills/*/SKILL.md
- GitHub automatic PR review procedure -> .github/skills/code-review/SKILL.md

Create or keep AGENTS.md only when the target repository has an explicit need
for portability beyond Copilot, directory-local AGENTS.md hierarchy, or an
existing workflow that treats AGENTS.md as authoritative. Do not duplicate
repository knowledge between AGENTS.md and copilot-instructions.md merely for
visibility.

Adapt the template to the real repository. Treat .github/ and optional AGENTS.md
as adaptation inputs and omit any layer the target repository does not justify;
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

## Design principles

Four ideas the rest of this architecture implements. Each links to where it is operationalized.

- **Inspect first, configure second.** Configuration not backed by target-repository evidence is a liability — [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md)
- **Share facts, not giant prompts.** Every surface gets the smallest useful context — [`docs/context-architecture.md`](docs/context-architecture.md)
- **Separate repository knowledge from agent behavior, and IDE review from online review.** Different execution surfaces, different context budgets — [`docs/context-architecture.md`](docs/context-architecture.md)
- **Prefer silence over weak findings.** A reviewer that comments on taste trains people to ignore it — [`docs/review-design.md`](docs/review-design.md)

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
