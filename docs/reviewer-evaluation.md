# Reviewer evaluation

Copilot review is non-deterministic. Evaluate behavior with experiments instead of assuming that a plausible prompt works.

## Experimental principles

Use small pull requests with deliberately controlled cases.

Prefer:

- one hypothesis per experiment
- neutral branch, commit, and PR names that do not reveal the expected answer
- positive cases with a concrete defect
- clean negative controls that look superficially similar
- a fixed expected result written down before review
- fresh branches from the current configuration baseline
- result recording before changing the prompt

Do not reuse a contaminated PR after changing reviewer instructions unless the experiment is specifically about configuration changes.

## Useful benchmark dimensions

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
version-matched external-evidence use
cross-surface policy contamination
```

For semantic misuse, optimize precision before recall.

## Positive and negative controls

A benchmark is more useful when the same surface contains both a real defect and a superficially similar safe case.

Examples:

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

A reviewer that catches positives but also flags clean controls has not passed the semantic boundary.

## `applyTo` isolation

Test path-scoped instructions independently.

A useful experiment places the same suspicious-looking code in two paths:

```text
matching path
  -> governed by a non-obvious invariant in one *.instructions.md

non-matching control path
  -> no such invariant
```

Success requires both:

- the matching-path violation is detected
- the same pattern in the non-matching path is not flagged merely because the scoped rule exists elsewhere in the repository

This distinguishes actual path-sensitive behavior from a repository-wide prompt leak.

## Semantic-misuse boundary

Use A/B cases that separate "concrete liability" from "safe but non-idiomatic".

A miss on a safe-but-nonidiomatic simplification can be acceptable. A false positive that teaches the reviewer to complain about every unusual framework primitive is more damaging.

When a false positive depends on framework lifecycle or scheduling semantics, determine whether the problem is:

```text
review-policy problem
  -> instructions encouraged a weak class of findings

knowledge/verification problem
  -> the model misunderstood execution semantics despite a sound evidence threshold
```

Do not add framework-specific prompt text after a single knowledge error unless the failure pattern is reproducible or the rule generalizes cleanly.

## Version-matched external evidence

To test whether recorded authoritative documentation influences review research:

1. choose behavior whose answer is version-sensitive
2. record the target version and version-matched official documentation in repository instructions
3. do not encode the expected answer in the instruction
4. create code whose correctness depends on that version-sensitive behavior
5. request review
6. inspect both the finding and the review-session log when available

Interpret the result separately:

```text
correct finding + external research observed
  -> evidence that repository guidance successfully directed research

correct finding + no external research observed
  -> model knowledge may have been sufficient; do not claim external validation

incorrect finding + external research observed
  -> investigate source selection or interpretation

incorrect finding + no external research observed
  -> authoritative-doc guidance alone did not trigger verification in this run
```

Do not assume external research or a particular MCP is always available.

## Cross-surface skill loading and policy authority

When a review-oriented Agent Skill can be discovered by both GitHub.com Code Review and VS Code agent mode, test **skill selection/loading** and **policy authority** as separate hypotheses.

```text
Selection hypothesis
  -> did the IDE surface actually load the skill for this task?

Authority hypothesis
  -> if the skill was present, did the IDE agent still use its own finding policy?
```

Do not infer loading merely because an output resembles the skill, and do not infer non-loading merely because an online-only marker is absent. An ownership/conflict rule can suppress application of a skill that was nevertheless loaded.

### Selection experiment

Use a neutral review prompt that should plausibly match the review-oriented skill description. When the product exposes a session trace, diagnostics, or other direct evidence of selected skills, record that evidence separately from the review output.

If direct loading evidence is unavailable, report the result as **selection unverified** rather than converting output behavior into proof about context composition.

### Authority stress test

Test the conflict rule under a condition where both policies are deliberately present. A practical benchmark can use a temporary experiment branch with a benign, unmistakable online-only canary in the review skill, or explicitly invoke the skill from the IDE when the product supports that path.

Expected behavior for Reviewer/DeepReviewer:

- the IDE agent keeps its own finding threshold, severity vocabulary, and output contract
- the online-only canary does not become part of the IDE review policy
- the agent does not weaken its own concrete finding policy merely because another detailed review procedure is present

Expected behavior for Orchestrator:

- external review-policy text does not by itself justify a code change
- fixes are still gated by the configured IDE review workflow and verification of significant findings

Use a control condition in a separate test configuration where the ownership/conflict rule is absent, or where that test surface is configured to make the skill's review policy authoritative. Otherwise a missing canary is not evidence that the boundary caused the result. Do not treat runtime self-adoption by the tested agent as a valid control.

Never leave experiment-only canary instructions in the production skill.

### Tool-allowlist hypothesis

Do **not** currently treat a custom-agent `tools` allowlist as an isolation mechanism for ordinary inline skills. VS Code documents ordinary skill discovery/loading as a metadata-driven customization path, while its dedicated skill tool is used for the separate experimental `context: fork` mode.

If future product documentation or behavior changes this relationship, test it with a controlled A/B experiment that varies only tool configuration and uses direct loading evidence when possible. Output absence alone is insufficient because it cannot distinguish "not loaded" from "loaded but not authoritative."

## Recording results

Record at least:

```text
configuration baseline
experiment hypothesis
positive cases
negative controls
review effort level
comments generated
true positives
false positives
misses
cross-file evidence used
external research observed, if relevant
skill loading observed/unverified, if relevant
cross-surface policy contamination observed, if relevant
interpretation
```

The purpose is not to maximize raw comment count. The purpose is to learn whether the reviewer behaves predictably enough to trust its high-signal findings.
