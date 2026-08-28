# Review design

This document defines the automatic review philosophy for `copilot-ready-kit`: high signal, concrete evidence, and minimal style noise.

## Objective

The automatic reviewer exists to find concrete defects introduced, exposed, or made reachable by a pull request. It does not exist to prove every changed line is ideal.

Good review targets include:

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

## Evidence threshold

Before commenting, establish:

1. a cause attributable to the PR
2. a realistic failure, regression, violated invariant, or concrete semantic liability
3. repository or authoritative technical evidence supporting the claim
4. a concrete corrective direction

If the evidence is insufficient, stay silent.

Use this principle:

> **The defect must be caused by the PR, but the supporting evidence does not have to live in the diff.**

A reviewer may inspect unchanged callers, consumers, tests, sibling implementations, configuration, or authoritative documentation when needed to prove or disprove a finding.

## Review procedure

A useful review loop is:

```text
1. Establish intent and constraints.
2. Map the changed surface and likely blast radius.
3. Inspect the highest-risk boundaries first.
4. Validate suspicions against repository evidence and supported-version semantics.
5. Report only actionable root causes.
```

Prioritize:

- correctness and reachable regressions
- security and trust boundaries
- compatibility
- concurrency / atomicity / ordering
- lifecycle / ownership / cleanup / exception safety
- persistence / migration / precision / data integrity
- consequence-backed semantic misuse
- missing verification tied to a specific risky behavior
- performance issues with concrete structural or measured evidence

## Semantic misuse

A language/framework/library/repository primitive is review-worthy only when the abstraction choice creates a concrete semantic burden, for example:

- duplicated mutable or derived state
- synchronization or update-order dependencies
- unnecessary lifecycle management with a real failure mode
- unsafe or ambiguous ownership
- weakened idempotency, atomicity, or exception safety
- avoidable error-handling complexity that can change behavior
- bypass of a repository-native abstraction that protects an invariant

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

For semantic misuse, prefer precision over recall. Missing a safe-but-nonidiomatic simplification is usually less damaging than teaching the reviewer to complain about every effect, subscription, raw pointer, shell command, or custom abstraction.

Framework-specific mappings belong in `.github/instructions/*.instructions.md` under precise `applyTo` boundaries.

## Noise filter

The automatic reviewer should usually stay silent on:

- formatting, import ordering, or whitespace
- naming/readability preference without a failure consequence
- generic best practices without evidence
- unrelated pre-existing defects
- speculative architecture criticism
- broad refactor/simplification suggestions
- generic requests for tests merely because no test file changed
- micro-optimizations without meaningful impact
- deterministic failures that formatter/linter/compiler/type checker/schema validation/ordinary CI will reliably explain
- duplicate comments that are symptoms of the same root cause

Do not rely on custom review-comment rendering as a contract. The skill should specify the substance a useful finding needs; GitHub owns the review UI/comment presentation.

## Severity and priority

Judge severity from realistic impact and reachability, not from a theoretical worst case. Keep prioritization proportional to the failure that can actually occur on a reachable path.

The executable `.github/skills/code-review/SKILL.md` defines the current severity categories for the shipped reviewer. Those categories guide prioritization; they are not a requirement for GitHub to render a particular label, prefix, or comment format.

## Version-sensitive evidence

For version-sensitive technologies, record both the repository's supported version/distribution and a version-matched authoritative documentation source when one is available.

Examples:

```text
Angular 20 -> https://v20.angular.dev/
ROS 2 Jazzy -> https://docs.ros.org/en/jazzy/
```

Do not use latest/rolling/nightly behavior as proof for an older supported release without explicit evidence.

If a finding depends on framework/runtime lifecycle, scheduling, callback ordering, cleanup timing, ownership semantics, or another version-sensitive behavior, validate the assumption against evidence applicable to the repository's supported version. If that cannot be substantiated, keep the claim uncertain rather than presenting it as a confirmed defect.

## External research and MCP

Treat external research as an evidence source, not as the source of truth for the repository's compatibility baseline.

In one repository experiment, path-scoped instructions identified Angular 20 and `https://v20.angular.dev/` as the authoritative source. Copilot Code Review then performed web searches against Angular 20 documentation before reasoning about effect scheduling. This shows that repository-recorded authoritative sources can guide external review research when that capability is available.

Do not turn that observed behavior into a hard dependency:

- framework-specific MCP servers may enrich implementation or review context, but should not be required for correctness
- external tools, network access, proxies, and MCP availability can differ between environments
- prefer version-matched official documentation over a framework MCP that exposes only latest behavior
- if external evidence cannot be retrieved, do not silently replace it with newer-version assumptions

When needed, inspect the review-session log to distinguish model knowledge from actual external-documentation research.

## Finding quality bar

A useful finding should make the root cause understandable and actionable. It should communicate enough substance to answer:

```text
What is wrong?
Why can it fail?
What evidence supports that claim?
What direction would correct it?
```

Do not require a fixed UI rendering or exact prose template.

## Human-invoked deep review

Broader architecture, simplification, migration strategy, or design-tradeoff analysis belongs more naturally to a human-invoked DeepReviewer than to the automatic online reviewer.

That keeps automatic review narrow enough to optimize for high signal while preserving a separate surface for deeper engineering judgment.
