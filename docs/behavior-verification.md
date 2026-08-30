# Behavior verification

Two kinds of thing in this template cannot be confirmed by reading. Product behavior — whether a declared tool actually returns anything, whether an agent can really invoke a worker, whether a skill gets selected — is decided by an installation, not by the text you wrote. And review judgment is non-deterministic, so a plausible-looking policy is not evidence that the reviewer behaves well.

Both are settled the same way: run it, change one thing, and see what moves.

## Method

The discipline is the same whatever you are verifying.

**Take a baseline.** Record what the surface does before the thing under test exists. Without it you cannot tell a change from normal variation.

**Change one variable.** If the prompt wording, the configuration, and the agent set all move together, the result explains nothing.

**Prefer direct evidence over inference.** When the product shows which skills were loaded, which agent ran, or which tool was called, record that separately from the output. When it does not, say so — an output that resembles a policy is not proof the policy was loaded, and an absent marker is not proof it was not.

**Give the result somewhere to fail.** A control condition where the mechanism under test is removed shows that the mechanism is what produced the difference. Without one, a clean result may just mean nothing was ever at risk.

**Keep the experiment out of the workspace.** Hypotheses, expected signals, and condition definitions in files the agent can read will be read. Neutral branch, commit, and file names are not enough if the reasoning sits next to the code.

**Record before interpreting.** Write the expected result down first, run the condition at least three times, and record what happened before deciding what it means.

Do not reuse a contaminated run after changing configuration unless the experiment is specifically about that change.

## Does the configuration function at all

The cheapest failures are the ones where nothing is wrong with your reasoning and the machinery is simply not connected.

```text
question   does each declared tool actually deliver what it is for
condition  give an agent a task that requires the tool
verdict    the agent receives real content, not an empty result it
           reports as an absence of findings
```

A tool identifier can resolve and still be inert because its feature is off. The agent will not say so; it will report that it found nothing.

```text
question   can a parent actually invoke the workers it lists
condition  give the parent a task its own policy delegates
verdict    a real subagent invocation appears in the run trace
```

An agent that cannot delegate may compose the worker's prompt in a terminal and report that it delegated. The transcript reads as a successful hand-off. Look at the trace, not the narration.

## Does a scoped rule stay scoped

Place the same suspicious-looking code in two paths: one governed by a non-obvious invariant in a single `*.instructions.md`, one not.

```text
verdict    the matching path is flagged, and the same pattern in the
           non-matching path is not
```

Both halves are required. Detection alone does not distinguish path-sensitive behavior from a rule leaking repository-wide.

## Is a skill selected where you intended

A skill written for one surface can be selected on another, so test **whether it is chosen** and **what it changes** as separate questions.

Testing this template on 2026-08-31, against VS Code 1.135.0 with `@github/copilot` 1.0.81-0, found:

```text
loads into    the agent the user is addressing
not observed  reaching a subagent that agent delegates to
symptom       the parent restates the subagent's findings in the skill's
              severity vocabulary instead of its own
control       the skill's description decides selection, before any
              content is loaded
```

A description built from product names was loaded on an editor pull-request review task, because every word in it was also true of that task. A description built from consumer facts — who invokes the review, where its output is posted — was skipped, with the agent stating its reason. See [skill-architecture.md](skill-architecture.md#scoping-a-skill-to-one-consumer).

When two surfaces already use different severity scales, that difference is a ready-made marker and no canary has to be planted. If you do plant one, never leave it in the production skill.

Run the delegated path and the direct path separately. A skill that never reaches a worker cannot be tested through its parent, and a worker invoked directly is not exercising the topology that ships.

A custom agent's `tools` list is not a lever here. Ordinary selection loads `SKILL.md` inline rather than through a tool call, so an allowlist has nothing to withhold.

## Does a finding keep its severity when it crosses a surface

Findings that arrive already judged are a different case from policy text.

```text
condition  supply a finding whose stated severity is inconsistent with the
           code evidence, holding the reviewed change constant
verdict    the receiving surface re-derives severity from its own policy
           instead of adopting the label
```

For Orchestrator, also verify that an aggressive fix recommendation does not by itself authorize a code change.

## Does recorded documentation guide research

Choose behavior whose answer is version-sensitive, record the target version and a version-matched official source in repository instructions, and write code whose correctness depends on that behavior. Do not encode the expected answer.

```text
correct finding + external research observed
  -> repository guidance directed the research

correct finding + no external research observed
  -> model knowledge may have sufficed; claim nothing about the guidance

incorrect finding + external research observed
  -> investigate source selection or interpretation

incorrect finding + no external research observed
  -> the recorded source did not trigger verification in this run
```

Do not assume external research or a particular MCP is always available.

## Does the reviewer find real defects without noise

This is the one case where the interesting question is judgment quality rather than mechanism.

Put a real defect and a superficially similar safe case on the same surface:

```text
Derived state
  positive: writable mirror creates a second source of truth / stale render
  control: external effect with correct lifecycle behavior

Ownership
  positive: raw ownership crosses a throwing operation before RAII handoff
  control: non-owning pointer with clear lifetime

Infrastructure
  positive: imperative mutation loses idempotency/check-mode semantics
  control: deterministic rendering/template operation
```

A reviewer that catches the positives and also flags the clean controls has not passed the boundary.

Worth measuring across runs: root-cause recall, false-positive rate on controls, duplicate comments for one root cause, cross-file detection, findings a linter or compiler would have produced anyway, and comments on pre-existing code. For semantic misuse, optimize precision before recall — a false positive that teaches the reviewer to complain about every unfamiliar primitive costs more than a missed simplification.

When a semantic-misuse false positive turns on framework lifecycle or scheduling, separate the causes:

```text
review-policy problem
  -> the instructions encouraged a weak class of finding

knowledge problem
  -> the model misread execution semantics despite a sound evidence threshold
```

Do not add framework-specific prompt text after a single knowledge error unless the failure reproduces or the rule generalizes.

## Recording

For any experiment:

```text
configuration baseline
what you expected, written before the run
the single variable that changed
the control condition
direct evidence observed, or "unverified"
what happened, per run
interpretation, and what this run cannot conclude
```

A review benchmark adds comments generated, true positives, false positives, misses, and which cross-file evidence the reviewer actually used.

The purpose is not to maximize comment count. It is to learn whether the configuration behaves predictably enough that its output can be trusted.
