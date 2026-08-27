# templatecopilotagent

An opinionated template for GitHub Copilot custom agents in VS Code.

This repository is not just a collection of `.agent.md` examples. It defines a **context-management and review strategy** that another AI can adapt to a real project.

The design goals are:

- keep authoritative repository facts available to every relevant task
- keep authoritative documentation locations available to research workers
- keep file/module-specific implementation rules conditional
- isolate context-heavy web/repository research behind a cheap Scout
- keep routine review independent, focused, and read-only
- reserve deep pre-merge review for explicit human invocation
- keep raw research out of the main reasoning context whenever possible
- avoid accidental duplication of the same policy across instruction layers

If another AI is asked to adapt this repository to a project, treat this README as the **design contract**. Preserve the intent, not necessarily every model name, tool identifier, filename, or example glob.

---

## Target architecture

```text
User
 ├─ Orchestrator
 │   ├─ Scout
 │   └─ Reviewer
 │
 └─ DeepReviewer   # explicitly started by a human before merge/release
     └─ Scout
```

### Roles

- **Orchestrator** — human-facing primary agent for planning, implementation, verification, and integration. It implements changes itself and delegates only work that benefits from context isolation or independent judgment.
- **Scout** — low-cost, read-only evidence compressor for web, workspace, and remote GitHub research. It returns compact, traceable evidence instead of a polished decision.
- **Reviewer** — stronger, high-signal, read-only routine reviewer. It performs focused local inspection only and does not run commands, browse the web, or invoke Scout itself.
- **DeepReviewer** — human-invoked pre-merge gate. It performs a risk-driven review, can run controlled repository-defined verification commands, and delegates broad/external research to Scout.

The exact models are implementation details. The intended split is:

```text
Scout
  cheaper model
  find -> verify -> compress evidence

Reviewer
  stronger model when available
  judge whether a change introduces a real defect
```

The template currently prefers:

```text
Scout    -> Claude Haiku 4.5
Reviewer -> Claude Sonnet 4.5, then Claude Haiku 4.5 fallback
```

DeepReviewer intentionally does not pin a model; select an appropriately strong model when starting a pre-merge review.

### Model-tier caveat

Subagents cannot run on a model tier that is unavailable or incompatible with the parent session. Reviewer therefore uses a concrete lower-cost fallback rather than assuming the stronger review model will always be usable.

Do not assume `Auto` is a valid value inside custom-agent `model:` frontmatter unless the current VS Code/Copilot version explicitly documents support for it there. Prefer concrete supported models in priority order.

---

## The core design rule: separate three kinds of context

Do not put every instruction into `.github/copilot-instructions.md`.

Classify project guidance into three layers:

| Kind of information | Where it belongs | Why |
|---|---|---|
| Repository-wide facts, documentation registry, and invariants | `.github/copilot-instructions.md` | Must remain available regardless of active file/task |
| Rules that only apply to certain files/directories | `.github/instructions/*.instructions.md` with `applyTo` | Avoid loading irrelevant implementation guidance |
| Agent role, tools, delegation, model, research behavior, output contract | `.github/agents/*.agent.md` | Keeps orchestration and behavior out of always-on repository context |

Use these questions when deciding where something belongs.

### Repository-wide test

> Would an agent still need this fact while researching the web, editing build files, reviewing tests, reading CI, changing documentation, or inspecting another language in the same repository?

If **yes**, it is probably repository-wide.

### Path-specific test

> Does this rule only matter when working on a particular language, file type, module, directory, or layer?

If **yes**, it is probably a `.instructions.md` rule with `applyTo`.

### Agent-specific test

> Does this rule describe who should perform the work, which tools/model should be used, how research should be performed, when to delegate, or what output should be returned?

If **yes**, it belongs in `.agent.md`.

---

## What belongs in `copilot-instructions.md`

Use `.github/copilot-instructions.md` for **authoritative project facts, authoritative documentation locations, and genuine cross-cutting invariants**.

Typical content:

```md
## Authoritative project facts

- Target framework/runtime: <name + exact supported version/distribution>
- Target operating system/platform: <version/architecture>
- Language/toolchain baseline: <version>
- Package/build system: <tooling>
- Dependency baseline: <only if it is an authoritative project constraint>

## Authoritative documentation sources

- Framework A:
  - Target version: <version>
  - Official documentation: <official domain or URL>

## Build and verification facts

- Build: <repository-defined command>
- Unit tests: <repository-defined command>
- Static analysis: <repository-defined command>

## Repository-wide invariants

- <real compatibility boundary>
- <real generated/vendor boundary>
- <real runtime/configuration invariant>
```

Do not leave generic examples in an adapted project unless they are actually true.

### Why version pins often belong here

Version information is frequently required outside the source files that directly use an API.

For example, suppose a ROS 2 project targets Jazzy:

```md
- Target ROS distribution: ROS 2 Jazzy.
- Target Ubuntu release: Ubuntu 24.04.
- C++ standard: C++20.
```

Those facts matter when an agent is:

- researching ROS documentation on the web
- checking `package.xml`
- editing `CMakeLists.txt`
- reviewing a Dockerfile
- inspecting CI
- writing documentation
- reviewing C++ source

Putting `ROS 2 Jazzy` only in a C++-specific `applyTo` file can hide a critical compatibility constraint from tasks that never activate a `.cpp` file.

**Rule of thumb:** if a version determines which external documentation or upstream API is valid, strongly prefer making that version repository-wide.

---

## Authoritative documentation registry

The project may also declare **where authoritative external evidence should come from**.

This is a repository-wide fact because the preferred documentation source can matter during implementation, review, build-file work, documentation work, and web-only research.

Example:

```md
## Authoritative documentation sources

- ROS 2
  - Target distribution: `Jazzy`
  - Official documentation: `https://docs.ros.org/`

- Angular
  - Target major version: `20`
  - Official documentation: `https://angular.dev/`

- CMake
  - Official documentation: `https://cmake.org/cmake/help/`
```

The registry should answer two questions:

```text
Which source is authoritative for this technology?
Which project version/distribution must the source match?
```

### What belongs in the registry

Good candidates:

- official framework/language documentation
- versioned API documentation
- standards/specification sites used by the project
- authoritative upstream docs for externally defined protocols

Do not turn the registry into a generic bookmark list. Only record sources that materially guide technical evidence for this repository.

### Domain vs exact URL

A domain/root documentation URL is usually enough when documentation paths change across versions.

For version-sensitive ecosystems, always pair it with the target version/distribution.

For example:

```text
ROS 2
  source: docs.ros.org
  distribution: Jazzy
```

is safer than only:

```text
source: docs.ros.org
```

because the latter does not prevent a research agent from treating Rolling documentation as evidence for Jazzy behavior.

### Facts vs research behavior vs implementation behavior

Keep the **fact and source registry** repo-wide:

```text
ROS 2 distribution = Jazzy
ROS 2 authoritative docs = docs.ros.org
Angular major = 20
Angular authoritative docs = angular.dev
```

Keep the **research behavior** in Scout:

```text
Check the repository-declared authoritative documentation source first.
Match documentation to the declared target version.
Use secondary sources only when needed and label them accordingly.
```

Keep the **implementation behavior** in Orchestrator or path-specific instructions:

```text
Use the established rclcpp callback pattern.
Use the repository's Angular signal conventions.
```

This separation prevents the same policy from being repeated across every layer.

---

## What belongs in `.instructions.md` + `applyTo`

Use `.github/instructions/<topic>.instructions.md` when meaningful rules only apply to particular files or repository areas.

### Example: C++ rules

```md
---
description: 'C++ implementation conventions for production sources'
applyTo: '**/*.{cpp,cc,cxx,h,hpp,hxx}'
---

# C++ implementation rules

- Prefer RAII for ownership and resource cleanup.
- Prefer existing project ownership patterns over introducing new abstractions.
- Avoid owning raw pointers unless the surrounding API requires them.
- Preserve the repository's established exception/no-exception policy.
```

### Example: CMake rules

```md
---
description: 'CMake and build-target conventions'
applyTo: '**/CMakeLists.txt, **/*.cmake'
---

# CMake rules

- Follow existing target naming and dependency patterns.
- Prefer target-scoped commands over directory-global configuration.
- Preserve the repository's supported compiler/toolchain baseline.
```

### Example: tests

```md
---
description: 'Test implementation conventions'
applyTo: '**/test/**, **/tests/**, **/*_test.*, **/*.spec.*'
---

# Test rules

- Test observable behavior rather than private implementation details.
- Add a regression test when fixing a reproducible defect.
- Reuse established fixtures/helpers before creating new infrastructure.
```

### Example: module-specific rules

```md
---
description: 'Rules for the public API layer'
applyTo: 'src/api/**'
---

- Treat exported interfaces as backward-compatible API.
- Do not expose internal implementation types.
- Update compatibility tests when externally observable behavior changes.
```

---

## `applyTo` decision examples

| Instruction | Recommended location | Reason |
|---|---|---|
| `Target ROS 2 distribution is Jazzy` | `copilot-instructions.md` | Needed for web research, build files, manifests, CI, source, docs |
| `ROS 2 official docs are docs.ros.org` | `copilot-instructions.md` | Research source-of-truth across task/file types |
| `Angular official docs are angular.dev` | `copilot-instructions.md` | Research source-of-truth across task/file types |
| `Target Ubuntu is 24.04` | `copilot-instructions.md` | Environment-wide compatibility fact |
| `Public wire protocol must remain compatible` | `copilot-instructions.md` if actually authoritative | Cross-cutting invariant |
| `Build with ./scripts/build.sh` | `copilot-instructions.md` | Repository-wide workflow fact |
| `Prefer RAII in C++ code` | `cpp.instructions.md` | C++-specific implementation guidance |
| `Use rclcpp callback-group pattern X in this module` | ROS/C++ path-specific instructions | Only relevant to matching implementation |
| `Use ament_target_dependencies in CMake targets` | `cmake.instructions.md` | Build-file-specific pattern |
| `Tests should use fixture X` | test-specific instructions | Only relevant to test files |
| `Frontend components must use design system Y` | frontend path-specific instructions | Only relevant to frontend area |
| `Web research goes through Scout` | `orchestrator.agent.md` | Routing policy, not repository fact |
| `Check declared documentation sources first` | `scout.agent.md` | Research behavior, not source registry |
| `Scout returns compact evidence` | `scout.agent.md` | Worker output contract |

Prefer the **widest scope at which the information is genuinely required**, but do not promote ordinary implementation/style guidance to always-on context merely because it might occasionally be useful.

---

## Common `applyTo` pitfalls

### 1. Hiding version facts behind a language glob

Bad:

```md
---
applyTo: '**/*.cpp'
---
- Target ROS distribution is Jazzy.
```

A web-only Scout task, `package.xml`, CMake, CI, or documentation task may not receive that constraint automatically.

Better:

```text
copilot-instructions.md
  -> ROS 2 Jazzy
  -> docs.ros.org is the authoritative ROS documentation source

ros2-cpp.instructions.md
  -> rclcpp implementation conventions
```

### 2. Hiding documentation sources behind `applyTo`

Bad:

```md
---
applyTo: '**/*.ts'
---
Use angular.dev as the authoritative Angular documentation source.
```

A Scout researching Angular configuration, migration behavior, build tooling, or a non-TypeScript file may not receive the instruction.

If the source is authoritative for the project technology rather than only one file type, keep it repository-wide.

### 3. Making `applyTo` too broad

```yaml
applyTo: '**'
```

Using this routinely defeats the point of conditional instructions and increases context size. If the rule is genuinely universal, ask whether it belongs in `copilot-instructions.md` instead.

### 4. Making `applyTo` too narrow

```yaml
applyTo: '**/*.cpp'
```

If the same conventions matter in headers, tests, wrappers, or adjacent file types, the rule can disappear unexpectedly. Inspect the real repository layout before choosing a glob.

### 5. Omitting `applyTo`

A `.instructions.md` file without an appropriate `applyTo` should not be relied on for normal path-based application. Critical constraints should not depend on manual attachment or incidental selection.

### 6. Relying on semantic matching for critical constraints

Descriptions can help Copilot discover relevant instruction files, but authoritative version, documentation-source, safety, and compatibility facts should not depend on semantic matching alone.

### 7. Duplicating the same rule across layers

Avoid maintaining copies of one rule in:

```text
copilot-instructions.md
cpp.instructions.md
orchestrator.agent.md
reviewer.agent.md
```

Duplication wastes context and eventually creates contradictions.

There is one intentional exception in this template: **small interface contracts may be repeated across isolated agent contexts when both sides need to understand them independently**. See [Intentional contract duplication](#intentional-contract-duplication).

### 8. Forgetting that globs encode repository structure

When a monorepo or directory layout changes, old globs can silently stop matching useful files. Review `applyTo` patterns after major repository reorganizations.

### 9. Using instructions as a security boundary

Prompt text such as `do not use curl` is behavioral guidance, not a hard security mechanism. Actual authority is determined by exposed tools plus VS Code approval/sandbox settings.

### 10. Relying on instruction ordering

When multiple instruction files apply, they are combined. Do not design overlapping instructions around the assumption that one file will reliably override another later.

Prefer overlapping rules that are mutually compatible. If two instruction files conflict, fix the scoping or remove the duplication rather than relying on ordering.

---

## How another AI should adapt this template

If you are an AI using this repository as a template, **inspect the target repository before writing Copilot configuration**. Do not merely replace placeholders.

### Step 1: discover project facts

First determine what fact you are trying to establish, then identify the source that directly declares or demonstrates that fact.

Do not use a single global source-priority list for every kind of fact.

Examples:

| Fact | Strong evidence sources |
|---|---|
| Language/toolchain standard | build/toolchain configuration, explicit project metadata |
| Declared dependency compatibility/range | manifest/build configuration |
| Resolved dependency version | lockfile |
| Runtime/compiler combinations actually tested | CI matrix/workflows |
| Supported deployment platform | project docs + build/deployment configuration + CI cross-check |
| Framework/distribution target | explicit setup/container/build/CI/project metadata; cross-check when ambiguous |
| Build/test commands | repository scripts, CI, documented developer workflow |
| Public compatibility boundary | API/schema/protocol definitions plus project documentation/policy |

Cross-check multiple sources when a fact is important and the repository is inconsistent.

A lockfile proves a resolved version; it does not automatically prove that the resolved version is the project's supported runtime or compatibility baseline.

Do not invent missing facts. If evidence conflicts or is insufficient, mark the fact as uncertain or leave a placeholder.

### Step 2: discover authoritative documentation sources

For each important external technology/framework used by the project, determine whether the repository has a clear authoritative documentation source.

Prefer official/upstream documentation that corresponds to the project target version.

Examples:

```text
ROS 2 Jazzy -> docs.ros.org
Angular 20  -> angular.dev
CMake       -> cmake.org/cmake/help
```

Do not blindly register every dependency's website. Add a documentation source when it is likely to be used for technical evidence during implementation/review/research.

When version-sensitive documentation has multiple branches/distributions, record both the documentation root and the target version/distribution.

If there is no trustworthy official source or the target version cannot be established, do not invent one.

### Step 3: classify every candidate instruction

```text
Required across task/file types?
  yes -> copilot-instructions.md

Only relevant to certain paths/languages/modules?
  yes -> .github/instructions/*.instructions.md + applyTo

Defines agent role/model/tools/delegation/research/output?
  yes -> .github/agents/*.agent.md
```

Do not move orchestration or research procedure into `copilot-instructions.md` merely because it should be consistent.

### Step 4: create path-specific files only when they add real value

Do not create one `.instructions.md` per language merely because the language exists.

Create one when the repository has meaningful conventions that Copilot would otherwise miss, for example:

- language-specific ownership/error-handling conventions
- framework-specific implementation patterns
- build-system conventions
- test conventions
- frontend/backend differences
- monorepo area-specific constraints

### Step 5: preserve the agent topology unless the project gives a reason not to

```text
Orchestrator
├─ Scout
└─ Reviewer

Human
└─ DeepReviewer
   └─ Scout
```

Do not make Reviewer invoke Scout in the normal flow. Orchestrator coordinates sibling workers so routine review does not require nested subagent invocation.

Do not give Orchestrator broad web tooling merely because external documentation is common. That context-heavy work is intentionally isolated behind Scout.

### Step 6: adapt models and tools deliberately

Preserve the intent:

- Scout: inexpensive model, read/search/web only, compact evidence
- Reviewer: stronger reasoning model when possible, narrow read/search only, concrete fallback when useful
- Orchestrator: implementation + verification + agent delegation
- DeepReviewer: read/search + controlled independent verification + Scout

Prefer the smallest tool set that can perform the role.

Model availability, cost tiers, and tool identifiers change over time. Verify them against the current VS Code/Copilot installation instead of blindly copying this template.

### Step 7: verify instruction and agent behavior

After generating configuration:

- verify `applyTo` globs against real paths
- check that important repository-wide facts are not trapped in path-specific files
- check that authoritative documentation sources are visible to web-only research tasks
- check that path-specific rules are not unnecessarily always-on
- check for contradictory overlapping instructions
- inspect VS Code customization diagnostics/references when available
- test that Orchestrator can actually invoke Scout and Reviewer
- test at least one source-file task, build-file task, test task, and external/version-sensitive research task

---

## Agent invocation topology

Orchestrator and DeepReviewer are human-facing roots:

```yaml
user-invocable: true
disable-model-invocation: true
```

Scout and Reviewer are hidden/protected workers:

```yaml
user-invocable: false
disable-model-invocation: true
```

The coordinators explicitly whitelist their workers with `agents:`:

```text
Orchestrator agents: [Scout, Reviewer]
DeepReviewer agents: [Scout]
```

### Current VS Code semantics

This combination is intentional, not a contradictory configuration.

With the current VS Code custom-agent semantics, `disable-model-invocation: true` prevents general automatic model selection of that agent, **but an agent explicitly listed in a parent's `agents:` array remains invocable by that parent**.

That lets the template express a coordinator whitelist:

```text
Orchestrator
  agents: [Scout, Reviewer]
       -> may invoke Scout
       -> may invoke Reviewer

DeepReviewer
  agents: [Scout]
       -> may invoke Scout

Other model-driven agent selection
       -> does not automatically select these protected workers
```

In other words, Scout and Reviewer are deliberately hidden/protected workers rather than dead agents.

When adapting this template to a future VS Code version, verify that this documented behavior has not changed. The future-compatibility warning is not uncertainty about the current design; it is simply a reminder that custom-agent semantics can evolve.

---

## Review flow

### Routine review

```text
Small/local change

Orchestrator
    └─ Reviewer

Research-sensitive change

Orchestrator
    ├─ Scout
    │    └─ compact evidence
    └─ Reviewer
         └─ independent judgment using only relevant evidence
```

Reviewer does not invoke Scout. If Reviewer encounters a concrete unresolved factual question, it returns `Research needed`. Orchestrator then delegates that exact question to Scout and either evaluates the returned evidence itself or re-runs Reviewer when independent judgment is still useful.

### Deep review

```text
Human
  └─ DeepReviewer
       └─ Scout
```

DeepReviewer is started directly by a human and may use Scout for broad repository or external/version-sensitive research.

Before reviewing, DeepReviewer must know what change set is being reviewed. If the user did not provide a PR, base branch, or commit range and the target is ambiguous, it asks the human rather than silently assuming `main` or another base branch.

---

## Scout evidence philosophy

Scout exists to prevent context-heavy exploration from polluting the parent context.

A good Scout result is short, traceable, and sufficient for a decision.

### Positive repository findings

Require a concrete source:

```text
Claim: Foo::bar mutates shared state without locking.
Source: src/foo.cpp
Symbol/Lines: Foo::bar / relevant range
Confidence: high
```

### Negative/global findings

Absence cannot be proven with an invented `file:path`.

For statements such as:

```text
No other callers were found.
No override of this configuration key exists.
```

return a traceable search description instead:

```text
Claim: No other callers were found.
Search scope: entire workspace excluding generated/vendor paths
Search query: usages of Foo::bar
Anchor path: src/foo.cpp
Confidence: high
```

### Web findings

Prefer the repository-declared authoritative documentation source and target version first.

```text
Claim: <fact>
Source: <URL>
Version/Date: <target version/date>
Evidence: <concise support>
Confidence: high|medium|low
```

Use other primary/upstream sources when needed, and distinguish them from the preferred documentation registry entry.

---

## Intentional contract duplication

The template generally avoids duplicating policy across `copilot-instructions.md`, path-specific instructions, and agent files. However, **small interface contracts are intentionally repeated when isolated agents need to understand the same protocol independently**.

For example, evidence fields such as:

```text
Claim
Source / Sources
Confidence
Search scope/query for negative findings
```

appear in more than one `.agent.md` file.

This is deliberate because subagents run with isolated contexts:

```text
Orchestrator
  needs to know what evidence to request

Scout
  needs to know what evidence to return

Reviewer / DeepReviewer
  need to know how to consume and report traceable evidence
```

Moving the contract to one central prose file would be more DRY on disk but could make individual workers less self-contained or require extra context to be injected into every delegation.

Use this exception narrowly:

- duplicate only the small interface/schema needed by both sides
- keep role-specific behavior local to each agent
- do not duplicate ordinary project facts or implementation policies
- when changing a shared contract, update all participating agents together

The priority is **local self-sufficiency across isolated contexts**, not textual deduplication at any cost.

---

## Suggested adapted layout

A small single-stack repository may only need:

```text
.github/
├── copilot-instructions.md
└── agents/
    ├── orchestrator.agent.md
    ├── scout.agent.md
    ├── reviewer.agent.md
    └── deep-reviewer.agent.md
```

A repository with meaningful language/module-specific conventions may grow to:

```text
.github/
├── copilot-instructions.md
├── agents/
│   ├── orchestrator.agent.md
│   ├── scout.agent.md
│   ├── reviewer.agent.md
│   └── deep-reviewer.agent.md
└── instructions/
    ├── cpp.instructions.md
    ├── cmake.instructions.md
    ├── tests.instructions.md
    └── frontend.instructions.md
```

Do not create empty or generic path-specific files merely to imitate this layout.

---

## Prompt for adapting this repository with another AI

You can give another coding agent this repository and a target project with a prompt similar to:

```text
Use rahanahu/templatecopilotagent as the design template for this repository's
GitHub Copilot configuration.

Read the template README and agent files first. Preserve the context-management,
research, and review philosophy rather than blindly copying filenames or model
versions.

Inspect this repository and determine authoritative project facts, versions,
build/test commands, invariants, implementation conventions, and authoritative
official documentation sources for important external technologies.

Classify configuration into:
1. repository-wide facts, version pins, documentation registry, and invariants
   -> .github/copilot-instructions.md
2. genuinely path-specific implementation rules
   -> .github/instructions/*.instructions.md
3. role/routing/tool/model/research/output behavior
   -> .github/agents/*.agent.md

Pay special attention to version facts and official documentation locations
needed for external research: do not hide them behind language-specific applyTo
rules.

Keep the Orchestrator / Scout / Reviewer / DeepReviewer topology unless this
repository provides a concrete reason to change it.

Before writing files, report the facts you found, the documentation registry,
and the proposed instruction layout with applyTo globs and rationale. Do not
invent unknown project facts or documentation sources.
```

---

## Design principles

- Keep the main context for decisions, implementation, verification results, and compact evidence.
- Put broad web/repository exploration behind Scout.
- Give workers narrow factual questions instead of the full conversation history.
- Prefer a few strong evidence items over exhaustive source collection.
- Keep routine review read-only and high-signal.
- Use DeepReviewer as an independent merge gate, not as part of every implementation loop.
- Keep authoritative repository facts and version pins in `copilot-instructions.md`.
- Keep authoritative external documentation locations in `copilot-instructions.md` when they apply across task/file types.
- Keep research procedure in Scout rather than duplicating it in repository-wide instructions.
- Keep conditional implementation guidance in `.instructions.md` files with precise `applyTo` patterns.
- Keep role and routing behavior in `.agent.md` files.
- Avoid accidental policy duplication across layers, while allowing small intentional interface-contract duplication across isolated agent contexts.
- Treat model names and tool identifiers as replaceable implementation details, not the core architecture.

---

## Official references

- VS Code: Custom instructions — https://code.visualstudio.com/docs/agent-customization/custom-instructions
- VS Code: Custom agents — https://code.visualstudio.com/docs/agent-customization/custom-agents
- VS Code: Subagents — https://code.visualstudio.com/docs/agents/run/subagents
- GitHub Docs: Repository and path-specific custom instructions — https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide
- GitHub Awesome Copilot — https://github.com/github/awesome-copilot