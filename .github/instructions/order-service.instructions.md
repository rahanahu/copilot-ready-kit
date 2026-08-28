---
description: 'Correctness and compatibility rules for the order service example'
applyTo: 'examples/order-service/**/*.py'
---

# Order service rules

- Preserve the public serialized field `order_id`; clients depend on that exact key.
- Never log `Authorization` header values or bearer tokens.
- Keep monetary calculations in integer cents; do not introduce binary floating-point arithmetic.
- Preserve tenant scoping for all order reads and writes.
- Treat quota updates as concurrent shared-state operations.
