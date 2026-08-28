# Repository context

This branch contains independent examples across several frameworks and languages. They are small enough to review by inspection, but each example should preserve the semantics of its native abstraction.

## Review boundaries

- Preserve authoritative state ownership and keep derived/display values synchronized with their inputs.
- External synchronization may intentionally write to browser APIs, telemetry systems, or operating-system state.
- Resource ownership changes must remain safe when intermediate operations fail or throw.
- Automation should preserve predictable repeat-run behavior and check-mode semantics where the platform provides them.
- Prefer semantic findings over style, naming, formatting, or “newer syntax” preferences.

## Evidence policy

- Tie findings to concrete behavior introduced by the diff.
- A shorter or more idiomatic alternative is not enough by itself; explain the state, lifecycle, ownership, idempotency, or failure-mode consequence.
- Do not treat every effect, subscription, command invocation, or raw pointer as suspicious without considering its role.
