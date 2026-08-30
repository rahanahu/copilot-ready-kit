# Copilot-ready repository architecture

A practical, evidence-backed bootstrap template for turning an existing repository into a **Copilot-ready development and review environment** across VS Code and GitHub.com pull-request review.

This repository is not a generic prompt collection or a claim that one set of “best practices” fits every project. It provides a context architecture and adaptation protocol for teaching Copilot the facts, invariants, boundaries, workflows, and review standards that are actually true for a target repository.

> Put each piece of guidance where the decision it affects is actually made, and verify against the product rather than reasoning about it.

## Copilot-only by default

This kit is designed primarily for repositories that use **GitHub Copilot**. For a Copilot-only target, `.github/copilot-instructions.md` is the default repository-wide context layer and `AGENTS.md` is not part of the default shipped configuration.

The exact routing rules, including when an optional `AGENTS.md` is justified, have a single owner: [`docs/context-architecture.md`](docs/context-architecture.md#routing-test).

## Humans: start here

1. Copy `.github/` and `.vscode/settings.json` into your repository as adaptation input. Leave `README.md` and `docs/` behind — they describe the template, not your project.
2. Paste the [bootstrap prompt](#copy-paste-bootstrap-prompt) into a coding agent that has write access to that repository.
3. Review what it wrote. This template ships structure and examples; only your repository can supply the facts.

What you are porting:

| Layer | File | Intended scope |
|---|---|---|
| Repository-wide Copilot context | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | always-relevant repository facts, versions, invariants, verification, and universal policy |
| Path-scoped rules | [`.github/instructions/`](.github/instructions/) | matching files on surfaces that support path-specific instructions |
| IDE agent roles | [`.github/agents/`](.github/agents/) | VS Code custom-agent workflow |
| Reusable skills | [`.github/skills/`](.github/skills/) | on-demand task workflows and specialist investigation; `code-review` defines GitHub.com automatic review procedure |
| PR description contract | [`.github/pull_request_template.md`](.github/pull_request_template.md) | humans and review context |
| Workspace settings | [`.vscode/settings.json`](.vscode/settings.json) | settings the agent tools need in order to function |

## AI agents: start here

If you are an AI/coding agent using this repository to adapt another project, treat this README as a **bootstrap manifest**, not the full specification.

Do not copy this repository verbatim. Derive target-repository facts and constraints from evidence.

Treat `.github/` as adaptation input, not mandatory output. `README.md` and `docs/` describe this template repository and stay here. Omit any layer that the target repository does not justify.

1. Read this README.
2. Read [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md).
3. Inspect the target repository using that evidence inventory before editing.
4. Use [`docs/context-architecture.md`](docs/context-architecture.md) to classify every fact, rule, agent behavior, and skill.
5. Load only the detailed architecture document for the layer you are adapting.
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

Routing and ownership are defined in [`docs/context-architecture.md`](docs/context-architecture.md). Detailed instruction, agent, and skill design live in separate topic documents so an adaptation agent does not need to load the full architecture when only one layer is relevant.

## Documentation map

Load these progressively rather than putting the entire architecture in the initial context:

| Document | Read when you need to... |
|---|---|
| [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md) | inspect and convert a target repository into a Copilot-ready repository — the six-phase procedure |
| [`docs/context-architecture.md`](docs/context-architecture.md) | classify guidance, decide ownership, and establish trust boundaries — read during every adaptation |
| [`docs/instruction-architecture.md`](docs/instruction-architecture.md) | design repository-wide instructions, `applyTo` rules, authoritative docs, optional `AGENTS.md`, or repository configuration layout |
| [`docs/agent-architecture.md`](docs/agent-architecture.md) | adapt VS Code agent topology, worker contracts, research boundaries, models, tools, execution controls, or review-policy ownership |
| [`docs/skill-architecture.md`](docs/skill-architecture.md) | design reusable skills, cross-surface discovery/authority, sizing/progressive disclosure, or the special GitHub `code-review` skill |
| [`docs/review-design.md`](docs/review-design.md) | understand the automatic-review evidence bar, severity rationale, effective online context, and version-matched research policy |
| [`docs/reviewer-evaluation.md`](docs/reviewer-evaluation.md) | test reviewer recall, precision, `applyTo`, noise, cross-surface policy isolation, or version-matched research behavior |

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

Use docs/context-architecture.md as the canonical routing test. After routing,
load only the detailed architecture document relevant to the layer being adapted.
Do not duplicate detailed repository policy across context layers merely for visibility.

Adapt the template to the real repository. Port only the configuration layers
that the target repository actually justifies. Remove placeholders, template-only
meta guidance, invented facts, unused path-specific rules, generic style guidance,
and latest-only framework assumptions.

Keep automatic review high-signal: require a concrete failure, violated
invariant, or consequence-backed semantic liability before commenting. Let
deterministic tooling own deterministic checks.

Validate applyTo patterns, referenced paths/commands, frontmatter,
duplicated/contradictory instructions, supported-version evidence, configured
worker invocation, and the final diff. Run appropriate repository-defined
verification. Clearly distinguish checks actually executed from conclusions
inferred only by inspection.

If reviewer behavior matters, use small positive/negative benchmark PRs rather
than assuming the prompt works. External web/MCP research may enrich evidence,
but correctness must not depend on an optional framework-specific MCP.

Complete the changes if you have write access. At the end, summarize changed
files, encoded invariants, validation actually performed, experiments performed,
and remaining uncertainties.
```

## Design principles

**Place guidance where the decision happens.** Two questions decide where something belongs, and they are not the same question.

*When is this loaded?* Repository-wide facts, path-scoped rules, and on-demand workflows differ by loading scope, and that is what the routing test sorts — [`docs/context-architecture.md`](docs/context-architecture.md)

*Where is this decided?* A skill's `description` decides selection; `applyTo` decides file matching; an agent's `agents:` list decides who it can delegate to; `target` decides where it runs. Prose about any of these sits outside the decision and does not reach it. A rule saying "do not invoke DeepReviewer" cannot redirect anything when DeepReviewer is not in the list to begin with — [`docs/skill-architecture.md`](docs/skill-architecture.md#scoping-a-skill-to-one-consumer)

**Verify against the product, do not reason about it.** Declared tool names resolve and still return nothing when their setting is off. An agent that cannot delegate may narrate a delegation it did not perform. A skill scoped by product name is selected anyway, because every word in the name is also true of the situation you meant to exclude. None of that is visible by reading — [`docs/reviewer-evaluation.md`](docs/reviewer-evaluation.md)

**Inspect first, configure second.** Configuration not backed by target-repository evidence is a liability — [`docs/adaptation-protocol.md`](docs/adaptation-protocol.md)

**Prefer silence over weak findings.** A reviewer that comments on taste trains people to ignore it — [`docs/review-design.md`](docs/review-design.md)

## Official references

- GitHub Docs — Copilot code review: https://docs.github.com/en/copilot/concepts/agents/code-review
- GitHub Docs — Customizing Copilot code review: https://docs.github.com/en/copilot/tutorials/customize-code-review
- GitHub Docs — Agent Skills for Copilot: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills
- GitHub Docs — Repository custom instructions: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
- GitHub Docs — Custom instruction support: https://docs.github.com/en/copilot/reference/custom-instructions-support
- VS Code — Agent Skills: https://code.visualstudio.com/docs/agent-customization/agent-skills
- VS Code — AI settings reference: https://code.visualstudio.com/docs/agents/reference/ai-settings
- VS Code — Custom instructions: https://code.visualstudio.com/docs/agent-customization/custom-instructions
- VS Code — Custom agents: https://code.visualstudio.com/docs/agent-customization/custom-agents
- VS Code — Subagents: https://code.visualstudio.com/docs/agents/run/subagents
- GitHub Awesome Copilot: https://github.com/github/awesome-copilot
