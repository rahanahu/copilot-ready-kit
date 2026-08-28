# Review design

The executable rules live in [`.github/skills/code-review/SKILL.md`](../.github/skills/code-review/SKILL.md). That file is authoritative for what the online reviewer actually does.

This document records the design decisions behind those rules and the policies that do not belong in an executable skill. If the two ever disagree, the skill is what runs: fix the skill first, then update this document.

## Why the bar is set where it is

The automatic reviewer exists to find concrete defects introduced, exposed, or made reachable by a pull request. It does not exist to prove that every changed line is ideal.

That objective produces the three constraints the skill encodes:

- **A finding needs a cause in the change and a realistic consequence.** Without the consequence requirement, a reviewer with broad knowledge will always find something to say, and the comment stream stops being read.
- **The cause must belong to the pull request, but the supporting evidence does not have to live in the diff.** A reviewer restricted to changed lines cannot establish a contract, so it either misses cross-file defects or guesses at them. It may inspect unchanged callers, consumers, tests, sibling implementations, configuration, or authoritative documentation.
- **Deterministic checks belong to deterministic tooling.** A comment that a formatter, linter, compiler, type checker, or schema validator would produce anyway spends review attention and buys nothing.

## Semantic misuse: precision before recall

Semantic-misuse findings are the highest-variance category, so the skill deliberately trades recall for precision.

Missing a safe-but-nonidiomatic simplification is usually less damaging than teaching the reviewer to complain about every effect, subscription, raw pointer, shell command, or custom abstraction. A reviewer that flags an unfamiliar primitive on sight becomes noise on exactly the code that most needs careful attention.

Framework-specific mappings of these principles belong in `.github/instructions/*.instructions.md` under precise `applyTo` boundaries, not in one cross-language review skill.

## Severity and priority

Judge severity from realistic impact and reachability, not from a theoretical worst case. Keep prioritization proportional to the failure that can actually occur on a reachable path.

The skill defines the current severity categories for the shipped reviewer. Those categories guide prioritization; they are not a requirement for GitHub to render a particular label, prefix, or comment format. Do not treat comment rendering as a contract at all — the skill specifies the substance a useful finding needs, and GitHub owns the review UI.

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

## Human-invoked deep review

Broader architecture, simplification, migration strategy, or design-tradeoff analysis belongs more naturally to a human-invoked DeepReviewer than to the automatic online reviewer.

That keeps automatic review narrow enough to optimize for high signal while preserving a separate surface for deeper engineering judgment.
