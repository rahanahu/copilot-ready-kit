---
description: 'Review rules for the Copilot reviewer benchmark fixture'
applyTo: 'benchmarks/copilot-review/**/*.py'
---

# Reviewer benchmark path rules

For files in this benchmark fixture:

- Never log, print, persist, or include raw bearer tokens or authorization headers in diagnostic output.
- Money values are integer cents. Do not introduce floating-point arithmetic into monetary calculations.
- Preserve the public serialized order response fields: `order_id`, `tenant_id`, `captured_cents`, and `status` unless the consumer is migrated in the same change.
- Treat formatter, naming, whitespace, and purely stylistic cleanup as non-review findings unless they create a concrete correctness problem.
