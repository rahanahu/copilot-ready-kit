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
interpretation
```

The purpose is not to maximize raw comment count. The purpose is to learn whether the reviewer behaves predictably enough to trust its high-signal findings.
