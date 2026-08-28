---
description: 'Identifier-handling rules for the scoped routing integration examples'
applyTo: 'experiments/applyto/scoped/**/*.ts'
---

# Scoped routing integration

- `routeKey` is an externally assigned opaque identifier and is case-sensitive.
- Pass `routeKey` to the routing gateway byte-for-byte. Do not trim, lowercase, uppercase, parse, or Unicode-normalize it.
- Altering `routeKey` can select a different tenant route, so normalization is a correctness and isolation failure rather than a style concern.
- Before reporting a finding, confirm that the changed code transforms `routeKey` itself; ordinary display labels and user-entered search text are not covered by this rule.
- This contract applies only to files matched by this instruction's `applyTo` pattern.
