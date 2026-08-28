# Repository context

This branch contains a small order/refund service used to exercise the repository's Copilot configuration against normal application code.

## Architecture

```text
handler.py
  -> service.py
     -> repository.py
     -> audit.py

quota.py      # per-tenant refund limits
api.py        # public response serialization
fees.py       # monetary fee arithmetic
```

## Repository invariants

- Order IDs are unique only within a tenant. Any order lookup or mutation must remain scoped by `(tenant_id, order_id)`.
- Refund amounts must be strictly positive and must not exceed the currently captured amount.
- A `*_succeeded` audit event means the corresponding state change has already been persisted successfully.
- `DailyRefundLimiter.try_consume` may be called concurrently by multiple request workers; its read/check/update sequence must remain atomic per tenant.

## Change-sensitive boundaries

- Public response shape is consumed outside this package; compatibility changes require explicit migration work.
- Authorization credentials are secrets and must not be written to application logs.
- Monetary values are represented as integer cents and calculations must remain exact in integer arithmetic.

## Evidence policy

- Prefer concrete code and repository constraints over assumptions.
- Review changed behavior and directly affected callers/consumers, not unrelated pre-existing issues.
- Distinguish deterministic lint/style concerns from semantic defects.
